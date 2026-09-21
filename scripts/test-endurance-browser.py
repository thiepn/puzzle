#!/usr/bin/env python3
"""Phase 19 browser endurance certification for Puzzle Arcade."""
import argparse
import json
import math
import statistics
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

IDS=['five-letters','groups','word-ladder','anagrams','letter-hive','word-grid','theme-trail','word-pieces','mini-crossword','cryptogram','word-search','sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','make-24','mines','nonogram','loop','bridges','light-up','islands','hitori','binary','queens','number-path','tents','rectangles','dominoes','towers','fillomino','network','sliding-tiles','lights-out','untangle']

def percentile(values,q):
    if not values:
        return 0.0
    rows=sorted(values)
    pos=max(0,min(len(rows)-1,math.ceil(len(rows)*q)-1))
    return rows[pos]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--base-url',default='http://127.0.0.1:8080/')
    ap.add_argument('--cycles',type=int,default=3)
    ap.add_argument('--output',default='')
    ap.add_argument('--heap-growth-mb',type=float,default=96.0)
    ap.add_argument('--route-p95-ms',type=float,default=6500.0)
    ap.add_argument('--route-max-ms',type=float,default=12000.0)
    opt=ap.parse_args()
    cycles=max(1,opt.cycles)

    failures=[]
    page_errors=[]
    latencies=[]
    cycle_rows=[]
    lifecycle_rounds=0

    with sync_playwright() as p:
        browser=p.chromium.launch(
            headless=True,
            args=['--enable-precise-memory-info','--js-flags=--expose-gc']
        )
        context=browser.new_context(
            viewport={'width':1200,'height':820},
            service_workers='block'
        )
        page=context.new_page()
        phase={'label':'startup'}
        page.on('pageerror',lambda exc: page_errors.append({'at':phase['label'],'error':str(exc)}))
        page.goto(opt.base_url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_function('() => window.__PA_ENDURANCE__?.version===19',timeout=30000)

        def force_gc():
            try:
                page.evaluate('() => { if (typeof gc === "function") gc(); }')
                page.wait_for_timeout(40)
            except Exception:
                pass

        def snapshot():
            return page.evaluate('() => window.__PA_ENDURANCE__.snapshot()')

        def storage():
            return page.evaluate('async () => await window.__PA_ENDURANCE__.storage()')

        def settle():
            return page.evaluate('async () => await window.__PA_ENDURANCE__.settle()')

        def goto_home():
            phase['label']='home'
            page.evaluate("() => { location.hash='#/home'; }")
            page.wait_for_function('() => location.hash==="#/home" && document.querySelector(".discovery-home")',timeout=30000)
            return settle()

        def goto_game(gid,seed,measure=True):
            phase['label']=f'route:{gid}:{seed}'
            target=f'#/game/{gid}?seed={seed}&difficulty=Medium'
            started=time.perf_counter()
            page.evaluate('(h)=>{location.hash=h}',target)
            page.wait_for_function(
                '(x)=>window.__PA_ENDURANCE__?.version===19 && document.querySelector(".game-page")?.dataset.playGame===x[0] && document.querySelector(".game-page")?.dataset.playSeed===x[1]',
                arg=[gid,seed],
                timeout=30000
            )
            elapsed=(time.perf_counter()-started)*1000
            if measure:
                latencies.append(elapsed)
            return elapsed

        def interaction(step):
            # Real, low-risk UI work: hints exercise solver/render state, while a board
            # click or keyboard move exercises event teardown on the next route.
            try:
                if step%7==0:
                    hint=page.locator('[data-game-hint]')
                    if hint.count() and hint.first.is_visible() and hint.first.is_enabled():
                        hint.first.click(timeout=1200)
                        try:
                            page.wait_for_function(
                                '() => { const b=document.querySelector("[data-game-hint]"); return !b || (!b.disabled && !/Thinking/.test(b.textContent)); }',
                                timeout=12000
                            )
                        except PlaywrightTimeoutError:
                            pass
                        return 'hint'
                buttons=page.locator('.game-board-wrap button:not([disabled])')
                if buttons.count():
                    loc=buttons.nth(step%buttons.count())
                    if loc.is_visible():
                        if step%3==0:
                            loc.focus()
                            page.keyboard.press('ArrowRight')
                            page.wait_for_timeout(20)
                            return 'key'
                        loc.click(timeout=1000)
                        page.wait_for_timeout(20)
                        return 'click'
            except Exception:
                return 'ignored'
            return 'none'

        # Warm every puzzle family once so the measured baseline includes lazy
        # dictionaries, solver tables, and bounded generator caches.
        for i,gid in enumerate(IDS):
            goto_game(gid,f'p19-warm-{gid}',measure=False)
            interaction(i)
            if i%12==11:
                settle()
        goto_home()
        force_gc()
        baseline=snapshot()
        baseline_storage=storage()

        for cycle in range(cycles):
            cycle_lat=[]
            order=IDS if cycle%2==0 else list(reversed(IDS))
            for i,gid in enumerate(order):
                elapsed=goto_game(gid,f'p19-{cycle}-{gid}',measure=True)
                cycle_lat.append(elapsed)
                interaction(cycle*len(IDS)+i)
                if (i+1)%12==0:
                    settle()

            # Exercise page lifecycle listeners while a real puzzle is mounted.
            phase['label']=f'cycle-{cycle}-lifecycle'
            page.evaluate("""() => {
              const hide=typeof PageTransitionEvent==='function'
                ? new PageTransitionEvent('pagehide',{persisted:true})
                : new Event('pagehide');
              const show=typeof PageTransitionEvent==='function'
                ? new PageTransitionEvent('pageshow',{persisted:true})
                : new Event('pageshow');
              window.dispatchEvent(hide);
              window.dispatchEvent(show);
            }""")
            lifecycle_rounds+=1
            settle()

            home=goto_home()
            force_gc()
            snap=snapshot()
            store=storage()
            cycle_rows.append({
                'cycle':cycle,
                'routes':len(cycle_lat),
                'medianMs':round(statistics.median(cycle_lat),2),
                'p95Ms':round(percentile(cycle_lat,.95),2),
                'maxMs':round(max(cycle_lat),2),
                'runtime':snap,
                'storage':store
            })

        final=goto_home()
        force_gc()
        final=snapshot()
        final_storage=storage()

        # Certify real retention cleanup with a small bounded synthetic history set.
        phase['label']='history-compaction'
        page.evaluate("""async () => {
          const db=await new Promise((resolve,reject)=>{
            const req=indexedDB.open('puzzle-arcade',1);
            req.onsuccess=()=>resolve(req.result);
            req.onerror=()=>reject(req.error);
          });
          await new Promise((resolve,reject)=>{
            const tx=db.transaction('history','readwrite'),store=tx.objectStore('history');
            store.clear();
            const now=Date.now();
            for(let i=0;i<40;i++)store.put({
              id:'p19-history-'+i,
              gameId:'sudoku',
              puzzleIdentity:'sudoku:Medium:p19-history-'+i,
              outcome:'completed',
              difficulty:'Medium',
              durationMs:1000+i,
              metrics:{hintsUsed:0},
              endedAt:now-i
            });
            tx.oncomplete=resolve;
            tx.onerror=()=>reject(tx.error);
            tx.onabort=()=>reject(tx.error);
          });
          db.close();
        }""")
        compact=page.evaluate('async () => await window.__PA_ENDURANCE__.compactHistory(24)')
        compact_storage=storage()

        if compact.get('after')!=24 or compact.get('inMemory')!=24 or compact_storage.get('history')!=24:
            failures.append({'kind':'history-compaction','compact':compact,'storage':compact_storage})

        if page_errors:
            failures.append({'kind':'page-errors','errors':page_errors})

        if final.get('timerActive'):
            failures.append({'kind':'timer-leak','final':final})
        if final.get('pointerCleanupActive'):
            failures.append({'kind':'pointer-cleanup-leak','final':final})
        leaked={k:v for k,v in final.get('globalHandlers',{}).items() if v}
        if leaked:
            failures.append({'kind':'global-handler-leak','handlers':leaked})
        if final.get('overlayNodes',0)!=0 or final.get('toastNodes',0)!=0:
            failures.append({'kind':'transient-dom-leak','overlay':final.get('overlayNodes'),'toasts':final.get('toastNodes')})
        if final.get('domNodes',0)>baseline.get('domNodes',0)+250:
            failures.append({'kind':'dom-growth','baseline':baseline.get('domNodes'),'final':final.get('domNodes')})
        if final_storage.get('active',0)>36:
            failures.append({'kind':'active-storage-growth','active':final_storage.get('active')})
        if final_storage.get('history',0)>10000:
            failures.append({'kind':'history-storage-growth','history':final_storage.get('history')})

        caches=final.get('boundedCaches',{})
        if caches.get('syncSeen',0)>caches.get('syncSeenLimit',256):
            failures.append({'kind':'sync-cache-growth','cache':caches})
        if caches.get('playerFresh',0)>caches.get('playerFreshLimit',256):
            failures.append({'kind':'fresh-cache-growth','cache':caches})

        counters=final.get('counters',{})
        if counters.get('timerStarts',0)!=counters.get('timerStops',0):
            failures.append({'kind':'timer-balance','counters':counters})
        if counters.get('pointerCleanups',0)<len(IDS):
            failures.append({'kind':'cleanup-not-exercised','counters':counters})
        if counters.get('lifecycleSuspends',0)<lifecycle_rounds or counters.get('lifecycleResumes',0)<lifecycle_rounds:
            failures.append({'kind':'lifecycle-not-exercised','counters':counters,'rounds':lifecycle_rounds})

        p95=percentile(latencies,.95)
        maximum=max(latencies) if latencies else 0
        if p95>opt.route_p95_ms:
            failures.append({'kind':'route-p95','p95Ms':round(p95,2),'limitMs':opt.route_p95_ms})
        if maximum>opt.route_max_ms:
            failures.append({'kind':'route-max','maxMs':round(maximum,2),'limitMs':opt.route_max_ms})

        if cycle_rows:
            first=cycle_rows[0]['medianMs']
            last=cycle_rows[-1]['medianMs']
            if last>max(first*2.5,first+900):
                failures.append({'kind':'latency-drift','firstMedianMs':first,'lastMedianMs':last})

        base_mem=(baseline.get('memory') or {}).get('usedJSHeapSize')
        final_mem=(final.get('memory') or {}).get('usedJSHeapSize')
        heap_growth=None
        if isinstance(base_mem,(int,float)) and isinstance(final_mem,(int,float)):
            heap_growth=final_mem-base_mem
            if heap_growth>opt.heap_growth_mb*1024*1024:
                failures.append({
                    'kind':'heap-growth',
                    'baselineBytes':base_mem,
                    'finalBytes':final_mem,
                    'growthBytes':heap_growth,
                    'limitBytes':int(opt.heap_growth_mb*1024*1024)
                })

        report={
            'pass':not failures,
            'phase':19,
            'version':'1.12.0',
            'cycles':cycles,
            'games':len(IDS),
            'warmRoutes':len(IDS),
            'measuredRoutes':len(latencies),
            'routeMedianMs':round(statistics.median(latencies),2) if latencies else 0,
            'routeP95Ms':round(p95,2),
            'routeMaxMs':round(maximum,2),
            'heapGrowthBytes':heap_growth,
            'baseline':baseline,
            'baselineStorage':baseline_storage,
            'final':final,
            'finalStorage':final_storage,
            'historyCompaction':compact,
            'cycleRows':cycle_rows,
            'pageErrors':page_errors,
            'failures':failures
        }

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
