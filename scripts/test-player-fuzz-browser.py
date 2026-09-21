#!/usr/bin/env python3
"""Deterministic real-player sequence fuzzing for Puzzle Arcade Phase 17."""
import argparse
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

IDS=['five-letters','groups','word-ladder','anagrams','letter-hive','word-grid','theme-trail','word-pieces','mini-crossword','cryptogram','word-search','sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','make-24','mines','nonogram','loop','bridges','light-up','islands','hitori','binary','queens','number-path','tents','rectangles','dominoes','towers','fillomino','network','sliding-tiles','lights-out','untangle']

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--base-url',default='http://127.0.0.1:8080/')
    ap.add_argument('--games',default='')
    ap.add_argument('--difficulties',default='Medium')
    ap.add_argument('--steps',type=int,default=12)
    ap.add_argument('--cycles',type=int,default=1)
    ap.add_argument('--output',default='')
    ap.add_argument('--skip-corruption',action='store_true')
    ap.add_argument('--skip-completion',action='store_true')
    opt=ap.parse_args()
    games=[x.strip() for x in opt.games.split(',') if x.strip()] or IDS
    unknown=[x for x in games if x not in IDS]
    if unknown: raise SystemExit('Unknown games: '+','.join(unknown))
    difficulties=[x.strip() for x in opt.difficulties.split(',') if x.strip()]
    if any(x not in ['Easy','Medium','Hard'] for x in difficulties):
        raise SystemExit('Difficulties must be Easy,Medium,Hard')

    failures=[];page_errors=[];rows=[];total_actions=0;validations=0;reloads=0;recoveries=0;boundaries=0;next_transitions=0

    with sync_playwright() as p:
        launch={'headless':True}
        if os.environ.get('CHROMIUM_PATH'): launch['executable_path']=os.environ['CHROMIUM_PATH']
        browser=p.chromium.launch(**launch)
        page=browser.new_page(viewport={'width':1100,'height':820})
        context={'label':'startup'}
        page.on('pageerror',lambda exc: page_errors.append({'at':context['label'],'error':str(exc)}))
        page.goto(opt.base_url,wait_until='domcontentloaded')
        page.wait_for_function('() => window.__PA_PLAYER_FUZZ__?.version === 17',timeout=30000)

        def navigate(gid,difficulty,cycle):
            seed=f'p17-{gid}-{difficulty.lower()}-{cycle}'
            context['label']=f'{gid}/{difficulty}/navigate'
            page.evaluate('(x)=>location.hash=x',f'#/game/{gid}?seed={seed}&difficulty={difficulty}')
            page.wait_for_function('(x)=>document.querySelector(".game-page")?.dataset.playGame===x[0] && document.querySelector(".game-page")?.dataset.playSeed===x[1]',arg=[gid,seed],timeout=30000)
            page.wait_for_timeout(35)
            return seed

        def current_summary():
            return page.evaluate('() => window.__PA_PLAYER_FUZZ__.summary()')

        def validate(label):
            nonlocal validations
            context['label']=label
            out=page.evaluate('async () => await window.__PA_PLAYER_FUZZ__.validateCurrent()')
            validations+=1
            if not out.get('pass'):
                raise AssertionError(f'{label}: '+json.dumps(out,sort_keys=True))
            if not page.locator('.game-page').count():
                raise AssertionError(f'{label}: game page disappeared')
            return out

        def wait_hint():
            try:
                page.wait_for_function('() => { const b=document.querySelector("[data-game-hint]"); return !b || (!b.disabled && !/Thinking/.test(b.textContent)); }',timeout=12000)
            except PlaywrightTimeoutError:
                pass

        def safe_click(locator,timeout=1300):
            try:
                if locator.count() and locator.first.is_visible() and locator.first.is_enabled():
                    locator.first.click(timeout=timeout)
                    page.wait_for_timeout(25)
                    return True
            except Exception:
                return False
            return False

        def click_stage_candidate(step):
            candidates=page.locator('.game-stage button:not([disabled])')
            count=candidates.count()
            if not count:
                candidates=page.locator('.game-stage [role="button"]')
                count=candidates.count()
            if not count:return False
            start=(step*7+count//2)%count
            for off in range(min(count,8)):
                loc=candidates.nth((start+off)%count)
                try:
                    if not loc.is_visible():continue
                    attrs=loc.evaluate('(e)=>Array.from(e.attributes).map(a=>a.name)')
                    if any(x in attrs for x in ['data-next-puzzle','data-replay-puzzle','data-result-home','data-share-puzzle']):continue
                    loc.click(timeout=1200)
                    page.wait_for_timeout(30)
                    return True
                except Exception:
                    continue
            return False

        def keyboard_noise(step):
            targets=page.locator('.game-stage button:not([disabled]), .game-stage [role="button"], .game-stage input')
            if targets.count():
                try: targets.nth(step%targets.count()).focus()
                except Exception: pass
            keys=['ArrowRight','ArrowDown','1','x','Delete','Space','Enter','ArrowLeft']
            try:
                page.keyboard.press(keys[step%len(keys)])
                page.wait_for_timeout(30)
                return True
            except Exception:
                return False

        def mutation_probe(gid):
            before=current_summary()['digest']
            candidates=page.locator('.game-stage button:not([disabled])')
            for i in range(min(candidates.count(),12)):
                try:
                    loc=candidates.nth(i)
                    if not loc.is_visible():continue
                    loc.click(timeout=1000)
                    page.wait_for_timeout(25)
                    now=current_summary()
                    if now and now['digest']!=before:return True
                    if now and now.get('completed'):return True
                except Exception:
                    continue
            inputs=page.locator('.game-stage input:not([disabled])')
            if inputs.count():
                try:
                    loc=inputs.first
                    maxlen=loc.get_attribute('maxlength')
                    text='trace'
                    if maxlen and maxlen.isdigit():text=text[:int(maxlen)]
                    loc.fill(text)
                    page.wait_for_timeout(30)
                    if current_summary()['digest']!=before:return True
                except Exception:
                    pass
            roles=page.locator('.game-stage [role="button"]')
            for i in range(min(roles.count(),8)):
                try:
                    roles.nth(i).focus()
                    page.keyboard.press('ArrowRight')
                    page.wait_for_timeout(30)
                    if current_summary()['digest']!=before:return True
                except Exception:
                    continue
            # Last-resort legitimate keyboard entry for virtual-keyboard/cell games.
            for key in ['A','1','Space','ArrowDown']:
                try:
                    page.keyboard.press(key)
                    page.wait_for_timeout(25)
                    if current_summary()['digest']!=before:return True
                except Exception:
                    pass
            return current_summary()['digest']!=before

        def shared_action(kind,step):
            if kind=='click':
                return click_stage_candidate(step)
            if kind=='key':
                return keyboard_noise(step)
            if kind=='hint':
                if safe_click(page.locator('[data-game-hint]')):
                    wait_hint();return True
                return False
            if kind=='undo':
                return safe_click(page.locator('[data-play-undo]'))
            if kind=='redo':
                return safe_click(page.locator('[data-play-redo]'))
            if kind=='pause':
                b=page.locator('[data-game-pause]')
                if not safe_click(b):return False
                if page.locator('[data-resume-puzzle]').count():
                    if page.locator('.game-stage').get_attribute('inert') is None:
                        raise AssertionError('paused board missing inert')
                    safe_click(page.locator('[data-resume-puzzle]'))
                    if page.locator('.game-stage').get_attribute('inert') is not None:
                        raise AssertionError('resumed board still inert')
                return True
            if kind=='menu':
                if not safe_click(page.locator('[data-game-menu]')):return False
                page.locator('.modal').wait_for(timeout=2500)
                return safe_click(page.locator('[data-modal-close]'))
            if kind=='ctrlz':
                try: page.keyboard.press('Control+z');page.wait_for_timeout(25);return True
                except Exception:return False
            if kind=='redo-key':
                try: page.keyboard.press('Control+Shift+z');page.wait_for_timeout(25);return True
                except Exception:return False
            return False

        plan=['click','key','hint','undo','redo','pause','menu','click','ctrlz','redo-key','hint','click']

        for cycle in range(max(1,opt.cycles)):
          for difficulty in difficulties:
            for gid in games:
                row={'gameId':gid,'difficulty':difficulty,'cycle':cycle,'actions':[],'pass':False}
                try:
                    seed=navigate(gid,difficulty,cycle)
                    row['seed']=seed
                    initial=validate(f'{gid}/{difficulty}/initial')
                    row['initialDigest']=initial['stateDigest']
                    row['mutationObserved']=mutation_probe(gid)
                    if not row['mutationObserved']:
                        raise AssertionError('no durable state mutation observed through real controls')
                    validate(f'{gid}/{difficulty}/mutation-probe')

                    for step in range(max(1,opt.steps)):
                        summary=current_summary()
                        if summary and summary.get('completed'):break
                        kind=plan[step%len(plan)]
                        context['label']=f'{gid}/{difficulty}/step-{step}-{kind}'
                        before=summary['digest'] if summary else None
                        acted=shared_action(kind,step)
                        total_actions+=1 if acted else 0
                        wait_hint()
                        after=current_summary()
                        validate(context['label'])
                        row['actions'].append({'step':step,'kind':kind,'acted':acted,'changed':bool(after and after.get('digest')!=before),'completed':bool(after and after.get('completed'))})

                    persisted=page.evaluate('async()=>await window.__PA_PLAYER_FUZZ__.persistCurrent()')
                    if not persisted.get('pass'):raise AssertionError('autosave parity failed: '+json.dumps(persisted))
                    pre_reload=validate(f'{gid}/{difficulty}/pre-reload')['durableDigest']
                    if not pre_reload:raise AssertionError('durable pre-reload digest missing')
                    page.reload(wait_until='domcontentloaded')
                    page.wait_for_function('(id)=>window.__PA_PLAYER_FUZZ__?.version===17 && document.querySelector(".game-page")?.dataset.playGame===id',arg=gid,timeout=30000)
                    reloads+=1
                    post=validate(f'{gid}/{difficulty}/reload')
                    if post.get('durableDigest')!=pre_reload:
                        raise AssertionError(f'durable reload state mismatch {pre_reload} != {post.get("durableDigest")}')
                    row['reloadPreserved']=True

                    if not opt.skip_corruption and not current_summary().get('completed'):
                        corruption=page.evaluate('async()=>await window.__PA_PLAYER_FUZZ__.corruptPersisted()')
                        if not corruption.get('pass'):raise AssertionError('failed to inject persisted-state fuzz: '+json.dumps(corruption))
                        row['corruptionField']=corruption.get('field')
                        context['label']=f'{gid}/{difficulty}/corruption-recovery'
                        page.reload(wait_until='domcontentloaded')
                        page.wait_for_function('(id)=>window.__PA_PLAYER_FUZZ__?.version===17 && document.querySelector(".game-page")?.dataset.playGame===id',arg=gid,timeout=30000)
                        reloads+=1
                        try:
                            page.wait_for_function('() => Array.from(document.querySelectorAll(".toast")).some(x=>/Repaired damaged save fields/.test(x.textContent))',timeout=3500)
                        except PlaywrightTimeoutError:
                            raise AssertionError('damaged save recovered without recovery signal')
                        validate(f'{gid}/{difficulty}/corruption-recovery')
                        recoveries+=1
                        row['corruptionRecovered']=True

                    if not opt.skip_completion and not current_summary().get('completed'):
                        boundary=page.evaluate('async()=>await window.__PA_PLAYER_FUZZ__.finishBoundary()')
                        if not boundary.get('pass'):raise AssertionError('completion boundary failed: '+json.dumps(boundary))
                        page.locator('.result-panel--reward').wait_for(timeout=5000)
                        if page.locator('.game-page').get_attribute('data-play-completed')!='true':
                            raise AssertionError('completed DOM contract missing')
                        validate(f'{gid}/{difficulty}/completion-boundary')
                        boundaries+=1
                        completed_seed=page.locator('.game-page').get_attribute('data-play-seed')
                        saved=page.evaluate('async()=>await window.__PA_PLAYER_FUZZ__.persistCurrent()')
                        if not saved.get('pass'):raise AssertionError('completed result did not persist')
                        page.reload(wait_until='domcontentloaded')
                        try:
                            page.wait_for_function('(id)=>window.__PA_PLAYER_FUZZ__?.version===17 && document.querySelector(".game-page")?.dataset.playGame===id && document.querySelector(".result-panel--reward")',arg=gid,timeout=30000)
                        except PlaywrightTimeoutError:
                            debug=page.evaluate("""async () => {
                              const summary=window.__PA_PLAYER_FUZZ__?.summary?.()||null;
                              const persisted=window.__PA_PLAYER_FUZZ__?.persistedStatus?await window.__PA_PLAYER_FUZZ__.persistedStatus():null;
                              let checkpoint=null;
                              try {
                                if(summary?.gameId)checkpoint=JSON.parse(localStorage.getItem('pa:checkpoint:'+summary.gameId));
                              } catch {}
                              return {
                                href:location.href,
                                readyState:document.readyState,
                                summary,
                                persisted: persisted ? {
                                  pass:persisted.pass,
                                  currentDigest:persisted.currentDigest,
                                  storedDigest:persisted.storedDigest,
                                  storedCompleted:!!persisted.stored?.completed,
                                  storedOutcome:persisted.stored?.outcome||null,
                                  storedHasResult:!!persisted.stored?.result,
                                  storedUpdatedAt:persisted.stored?.updatedAt||0
                                } : null,
                                checkpoint: checkpoint ? {
                                  completed:!!checkpoint.completed,
                                  outcome:checkpoint.outcome||null,
                                  hasResult:!!checkpoint.result,
                                  updatedAt:checkpoint.updatedAt||0
                                } : null,
                                domCompleted:document.querySelector('.game-page')?.dataset.playCompleted||null,
                                resultPanel:!!document.querySelector('.result-panel--reward'),
                                appVersion:window.__PA_RESILIENCE__?.summary?.().appVersion||null
                              };
                            }""")
                            raise AssertionError('completed reload did not restore result state: '+json.dumps(debug,sort_keys=True))
                        reloads+=1
                        validate(f'{gid}/{difficulty}/completed-reload')
                        next_button=page.locator('[data-next-puzzle]')
                        if safe_click(next_button,2500):
                            page.wait_for_function('(x)=>document.querySelector(".game-page")?.dataset.playGame===x[0] && document.querySelector(".game-page")?.dataset.playSeed!==x[1] && document.querySelector(".game-page")?.dataset.playCompleted==="false"',arg=[gid,completed_seed],timeout=30000)
                            validate(f'{gid}/{difficulty}/next-puzzle')
                            next_transitions+=1
                            row['nextPuzzle']=True
                        row['completionBoundary']=True

                    row['pass']=True
                except Exception as exc:
                    failures.append({'gameId':gid,'difficulty':difficulty,'cycle':cycle,'at':context['label'],'error':str(exc)})
                    row['error']=str(exc)
                rows.append(row)

        browser.close()

    report={
      'pass':not failures and not page_errors,
      'version':17,
      'games':len(games),
      'difficulties':difficulties,
      'cycles':max(1,opt.cycles),
      'stepsPerSession':max(1,opt.steps),
      'sessions':len(rows),
      'sessionsPassed':sum(1 for x in rows if x.get('pass')),
      'realActions':total_actions,
      'validations':validations,
      'reloads':reloads,
      'corruptionRecoveries':recoveries,
      'completionBoundaries':boundaries,
      'nextPuzzleTransitions':next_transitions,
      'failures':failures,
      'pageErrors':page_errors,
      'rows':rows
    }
    encoded=json.dumps(report,indent=2)
    print(encoded)
    if opt.output:
        path=Path(opt.output);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(encoded+'\n',encoding='utf-8')
    if not report['pass']:raise SystemExit(1)

if __name__=='__main__':
    main()
