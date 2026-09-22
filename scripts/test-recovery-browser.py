#!/usr/bin/env python3
"""Phase 20 backup / restore / reset disaster-recovery certification."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--base-url',default='http://127.0.0.1:8080/')
    ap.add_argument('--output',default='')
    opt=ap.parse_args()

    failures=[]
    page_errors=[]
    report={'pass':False,'phase':20,'version':'1.14.0'}

    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        context=browser.new_context(viewport={'width':1200,'height':850},accept_downloads=True,service_workers='block')
        page=context.new_page()
        label={'value':'boot'}
        page.on('pageerror',lambda exc: page_errors.append({'at':label['value'],'error':str(exc)}))
        page.goto(opt.base_url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_function('() => window.__PA_RECOVERY__?.version===20',timeout=30000)

        def route(hash_value,condition='() => true'):
            label['value']='route:'+hash_value
            page.evaluate('(h)=>{location.hash=h}',hash_value)
            page.wait_for_function(condition,timeout=30000)

        # Create representative user state through production UI/runtime paths.
        route('#/settings','() => location.hash==="#/settings" && document.querySelector(\'[data-theme-choice="dark"]\')')
        page.locator('[data-theme-choice="dark"]').click()
        page.wait_for_function('() => document.documentElement.dataset.theme==="dark"')

        route('#/home','() => location.hash==="#/home" && document.querySelector(".discovery-home")')
        fav=page.locator('[data-favorite="sudoku"]').first
        if not fav.count():
            raise AssertionError('Sudoku favorite control missing')
        fav.click()
        page.wait_for_timeout(80)

        route(
            '#/game/sudoku?seed=p20-recovery-sudoku&difficulty=Medium',
            '() => document.querySelector(".game-page")?.dataset.playGame==="sudoku"'
        )
        done=page.evaluate('async () => await window.__PA_PLAYER_FUZZ__.finishBoundary()')
        if not done.get('pass'):
            raise AssertionError('could not create certified completed result')
        page.locator('.result-panel--reward').wait_for(timeout=5000)

        route(
            '#/game/groups?seed=p20-recovery-groups&difficulty=Medium',
            '() => document.querySelector(".game-page")?.dataset.playGame==="groups"'
        )
        probe=page.evaluate('async () => await window.__PA_RESILIENCE__.probeCurrent()')
        if not probe.get('pass'):
            raise AssertionError('could not persist active puzzle state')

        # Verify the actual settings download button, not only the internal API.
        route('#/settings','() => location.hash==="#/settings" && document.querySelector(\'[data-theme-choice="dark"]\')')
        backup_path=Path('/tmp/puzzle-arcade-phase20-backup.json')
        with page.expect_download(timeout=15000) as download_info:
            page.locator('[data-action="backup-export"]').click()
        download=download_info.value
        download.save_as(str(backup_path))
        text=backup_path.read_text(encoding='utf-8')
        raw=json.loads(text)
        report['backupBytes']=backup_path.stat().st_size
        report['backupMetadata']={
            'kind':raw.get('kind'),
            'schemaVersion':raw.get('schemaVersion'),
            'appVersion':raw.get('appVersion'),
            'databaseSchema':raw.get('databaseSchema'),
        }

        prepared=page.evaluate(
            'async (text) => await window.__PA_RECOVERY__.prepareText(text)',
            text
        )
        counts=prepared.get('report',{})
        report['backupCounts']=counts
        if counts.get('favorites',0)<1 or counts.get('active',0)<2 or counts.get('history',0)<1:
            failures.append({'kind':'backup-incomplete','report':counts})

        before_tamper=page.evaluate('async () => await window.__PA_RECOVERY__.snapshot()')
        tampered=json.loads(text)
        tampered['payload']['favorites']=[]
        rejected=False
        try:
            page.evaluate(
                'async (text) => await window.__PA_RECOVERY__.prepareText(text)',
                json.dumps(tampered)
            )
        except Exception:
            rejected=True
        after_tamper=page.evaluate('async () => await window.__PA_RECOVERY__.snapshot()')
        if not rejected:
            failures.append({'kind':'tampered-backup-accepted'})
        if before_tamper!=after_tamper:
            failures.append({'kind':'validation-mutated-live-data','before':before_tamper,'after':after_tamper})

        # Verify damaged-but-checksummed active state is repaired during preparation.
        damaged=json.loads(text)
        for row in damaged.get('payload',{}).get('active',[]):
            if row.get('gameId')=='groups':
                row.setdefault('state',{})['selected']=['not-a-real-tile']
        damaged['checksum']=page.evaluate(
            '(payload) => window.__PA_RECOVERY__.checksum(payload)',
            damaged['payload']
        )
        damaged_prepared=page.evaluate(
            'async (text) => await window.__PA_RECOVERY__.prepareText(text)',
            json.dumps(damaged)
        )
        report['repairProbe']=damaged_prepared.get('report',{})
        if damaged_prepared.get('report',{}).get('repairedActive',0)<1:
            failures.append({'kind':'damaged-active-not-repaired','report':damaged_prepared.get('report')})

        # Verify destructive reset really clears current local user data.
        label['value']='reset'
        page.locator('[data-action="clear-data"]').click()
        page.locator('.modal').wait_for(timeout=3000)
        page.get_by_role('button',name='Reset all').click()
        page.wait_for_function(
            'async () => { const s=await window.__PA_RECOVERY__.snapshot(); return s.active===0 && s.history===0 && s.favorites.length===0 && s.settings.theme==="system"; }',
            timeout=10000
        )
        reset_snapshot=page.evaluate('async () => await window.__PA_RECOVERY__.snapshot()')
        report['resetSnapshot']=reset_snapshot

        # Verify actual file-picker restore UX and confirmation flow.
        label['value']='restore'
        with page.expect_file_chooser(timeout=10000) as chooser_info:
            page.locator('[data-action="backup-import"]').click()
        chooser_info.value.set_files(str(backup_path))
        page.locator('.modal').wait_for(timeout=15000)
        page.locator('#overlay-root').get_by_role('button',name='Restore backup').click()
        page.wait_for_function(
            'async () => { const s=await window.__PA_RECOVERY__.snapshot(); return s.active>=2 && s.history>=1 && s.favorites.includes("sudoku") && s.settings.theme==="dark"; }',
            timeout=30000
        )
        restored=page.evaluate('async () => await window.__PA_RECOVERY__.snapshot()')
        report['restoredSnapshot']=restored

        # Reload proves restoration is durable, not only in-memory.
        label['value']='post-restore-reload'
        page.reload(wait_until='domcontentloaded',timeout=30000)
        page.wait_for_function('() => window.__PA_RECOVERY__?.version===20',timeout=30000)
        durable=page.evaluate('async () => await window.__PA_RECOVERY__.snapshot()')
        report['durableSnapshot']=durable
        if durable.get('active',0)<2 or durable.get('history',0)<1 or 'sudoku' not in durable.get('favorites',[]) or durable.get('settings',{}).get('theme')!='dark':
            failures.append({'kind':'restore-not-durable','snapshot':durable})

        # Completed and in-progress records both remain navigable after restore.
        route(
            '#/game/sudoku?seed=p20-recovery-sudoku&difficulty=Medium',
            '() => document.querySelector(".game-page")?.dataset.playGame==="sudoku" && document.querySelector(".result-panel--reward")'
        )
        route(
            '#/game/groups?seed=p20-recovery-groups&difficulty=Medium',
            '() => document.querySelector(".game-page")?.dataset.playGame==="groups"'
        )
        groups=page.evaluate('() => window.__PA_PLAYER_FUZZ__.summary()')
        report['restoredActiveSummary']=groups
        if (groups or {}).get('hintsUsed',0)<1:
            failures.append({'kind':'active-progress-not-restored','summary':groups})

        report['pageErrors']=page_errors
        if page_errors:
            failures.append({'kind':'page-errors','errors':page_errors})
        report['failures']=failures
        report['pass']=not failures

        context.close()
        browser.close()

    encoded=json.dumps(report,indent=2)
    print(encoded)
    if opt.output:
        path=Path(opt.output);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(encoded+'\n',encoding='utf-8')
    if not report['pass']:
        raise SystemExit(1)

if __name__=='__main__':
    main()
