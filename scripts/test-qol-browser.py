#!/usr/bin/env python3
"""QoL release keyboard-navigation and mobile-UI certification."""
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
    report={'pass':False,'release':'1.14.0'}

    def check(condition,kind,details=None):
        if not condition:
            failures.append({'kind':kind,'details':details})

    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)

        # Desktop keyboard-navigation certification.
        desktop=browser.new_context(viewport={'width':1280,'height':860},service_workers='block')
        page=desktop.new_page()
        phase={'value':'desktop-boot'}
        page.on('pageerror',lambda exc: page_errors.append({'at':phase['value'],'error':str(exc)}))
        page.goto(opt.base_url,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_function("() => document.body && /1\.14\.0/.test(document.querySelector('script[src="app.js"]') ? window.__PA_RECOVERY__?.appVersion || '1.14.0' : '')",timeout=30000)

        phase['value']='quick-switcher'
        page.keyboard.press('Control+k')
        page.locator('.search-input').wait_for(timeout=5000)
        page.locator('.search-input').fill('sudoku')
        selected=page.locator('.search-result[aria-selected="true"]')
        check(selected.count()==1,'switcher-selected-count',selected.count())
        page.keyboard.press('Enter')
        page.wait_for_function('() => document.querySelector(".game-page")?.dataset.playGame==="sudoku"',timeout=30000)
        report['ctrlKOpensSudoku']=True

        phase['value']='game-escape-options'
        page.keyboard.press('Escape')
        page.locator('.modal').wait_for(timeout=5000)
        modal_title=page.locator('#modal-title').inner_text()
        check('Sudoku' in modal_title and 'Options' in modal_title,'escape-did-not-open-game-options',modal_title)
        page.locator('[data-modal-close]').click()

        phase['value']='continue-shortcut'
        page.locator('[data-game-back]').click()
        page.wait_for_function('() => location.hash==="#/home" && document.querySelector(".discovery-home")',timeout=30000)
        page.evaluate('() => document.activeElement?.blur?.()')
        page.keyboard.press('c')
        page.wait_for_function('() => document.querySelector(".game-page")?.dataset.playGame==="sudoku"',timeout=30000)
        report['continueShortcut']=True

        phase['value']='go-chords'
        page.locator('[data-game-back]').click()
        page.wait_for_function('() => location.hash==="#/home"',timeout=30000)
        page.evaluate('() => document.activeElement?.blur?.()')
        for second,target in [('l','#/learn'),('s','#/stats'),('o','#/settings'),('p','#/home')]:
            page.keyboard.press('g')
            page.keyboard.press(second)
            page.wait_for_function('(h)=>location.hash===h',arg=target,timeout=8000)
            page.evaluate('() => document.activeElement?.blur?.()')
        report['goChordRoutes']=4

        phase['value']='random-shortcut'
        page.keyboard.press('r')
        page.wait_for_function('() => location.hash.startsWith("#/game/") && !!document.querySelector(".game-page")',timeout=30000)
        random_game=page.locator('.game-page').get_attribute('data-play-game')
        check(bool(random_game),'random-shortcut-no-game')
        page.locator('[data-game-back]').click()
        page.wait_for_function('() => location.hash==="#/home"',timeout=30000)

        phase['value']='spatial-library-navigation'
        first=page.locator('.catalog-game-grid .game-card__open').nth(0)
        second=page.locator('.catalog-game-grid .game-card__open').nth(1)
        first.focus()
        first_id=page.evaluate('() => document.activeElement?.dataset?.gameOpen || null')
        page.keyboard.press('ArrowRight')
        moved_id=page.evaluate('() => document.activeElement?.dataset?.gameOpen || null')
        check(first_id is not None and moved_id is not None and first_id!=moved_id,'library-arrow-navigation',{'first':first_id,'after':moved_id})
        report['libraryArrowFrom']=first_id
        report['libraryArrowTo']=moved_id

        phase['value']='bottom-nav-arrow'
        page.locator('.nav-link[data-route="home"]').focus()
        page.keyboard.press('ArrowRight')
        nav_route=page.evaluate('() => document.activeElement?.dataset?.route || null')
        check(nav_route=='learn','primary-nav-arrow-navigation',nav_route)
        desktop.close()

        # Mobile density and app-shell certification.
        mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block')
        m=mobile.new_page()
        m.on('pageerror',lambda exc: page_errors.append({'at':'mobile','error':str(exc)}))
        m.goto(opt.base_url,wait_until='domcontentloaded',timeout=30000)
        m.wait_for_function('() => document.querySelector(".discovery-home")',timeout=30000)

        mobile_metrics=m.evaluate("""() => {
          const css=el=>getComputedStyle(el);
          const nav=document.querySelector('.main-nav');
          const navLink=document.querySelector('.nav-link');
          const navIcon=document.querySelector('.nav-icon');
          const sound=document.querySelector('[data-action="sound-toggle"]');
          const card=document.querySelector('.catalog-game-grid .game-card');
          const desc=card?.querySelector('.game-card__description');
          const portal=document.querySelector('.category-portal');
          return {
            navPosition:css(nav).position,
            navBottom:css(nav).bottom,
            navHeight:nav.getBoundingClientRect().height,
            navLinkDisplay:css(navLink).display,
            navIconDisplay:css(navIcon).display,
            soundDisplay:css(sound).display,
            cardHeight:card?.getBoundingClientRect().height||0,
            descriptionDisplay:desc?css(desc).display:null,
            portalHeight:portal?.getBoundingClientRect().height||0
          };
        }""")
        report['mobileHome']=mobile_metrics
        check(mobile_metrics['navPosition']=='fixed','mobile-nav-not-fixed',mobile_metrics)
        check(mobile_metrics['navIconDisplay']!='none','mobile-nav-icons-hidden',mobile_metrics)
        check(mobile_metrics['soundDisplay']=='none','mobile-topbar-not-decluttered',mobile_metrics)
        check(mobile_metrics['descriptionDisplay']=='none','mobile-card-description-visible',mobile_metrics)
        check(mobile_metrics['cardHeight']<=175,'mobile-card-too-tall',mobile_metrics)
        check(mobile_metrics['portalHeight']<=105,'mobile-category-portal-too-tall',mobile_metrics)

        phase['value']='mobile-search'
        m.keyboard.press('/')
        m.locator('.search-input').wait_for(timeout=5000)
        m.locator('.search-input').fill('stats')
        search_metrics=m.evaluate("""() => {
          const panel=document.querySelector('.search-panel'),results=document.querySelector('.search-results');
          return {
            panelPosition:getComputedStyle(panel).position,
            resultsOverflow:getComputedStyle(results).overflowY,
            selected:document.querySelectorAll('.search-result[aria-selected="true"]').length
          };
        }""")
        report['mobileSearch']=search_metrics
        check(search_metrics['panelPosition']=='fixed','mobile-search-not-fixed',search_metrics)
        check(search_metrics['selected']==1,'mobile-search-no-selected-result',search_metrics)
        m.keyboard.press('Escape')

        phase['value']='mobile-bottom-sheet'
        m.keyboard.press('?')
        m.locator('.modal').wait_for(timeout=5000)
        modal_metrics=m.evaluate("""() => {
          const backdrop=document.querySelector('.modal-backdrop'),modal=document.querySelector('.modal');
          return {
            align:getComputedStyle(backdrop).alignItems,
            width:Math.round(modal.getBoundingClientRect().width),
            viewport:innerWidth,
            bottom:Math.round(innerHeight-modal.getBoundingClientRect().bottom)
          };
        }""")
        report['mobileModal']=modal_metrics
        check(modal_metrics['align']=='flex-end','mobile-modal-not-bottom-sheet',modal_metrics)
        check(abs(modal_metrics['width']-modal_metrics['viewport'])<=2,'mobile-modal-not-full-width',modal_metrics)
        m.keyboard.press('Escape')

        phase['value']='mobile-game-dock'
        m.evaluate("() => { location.hash='#/game/sudoku?seed=qol-mobile-sudoku&difficulty=Medium'; }")
        m.wait_for_function('() => document.querySelector(".game-page")?.dataset.playGame==="sudoku"',timeout=30000)
        game_metrics=m.evaluate("""() => {
          const dock=document.querySelector('.play-action-dock'),top=document.querySelector('.topbar');
          return {
            dockPosition:getComputedStyle(dock).position,
            dockBottom:getComputedStyle(dock).bottom,
            dockWidth:Math.round(dock.getBoundingClientRect().width),
            viewport:innerWidth,
            topbarDisplay:getComputedStyle(top).display,
            buttonMinHeights:[...dock.querySelectorAll('button')].map(b=>Math.round(b.getBoundingClientRect().height))
          };
        }""")
        report['mobileGame']=game_metrics
        check(game_metrics['dockPosition']=='sticky','mobile-game-dock-not-sticky',game_metrics)
        check(game_metrics['topbarDisplay']=='none','mobile-game-desktop-topbar-visible',game_metrics)
        check(all(h>=44 for h in game_metrics['buttonMinHeights']),'mobile-game-dock-touch-target-small',game_metrics)
        mobile.close()
        browser.close()

    report['pageErrors']=page_errors
    if page_errors:
        failures.append({'kind':'page-errors','details':page_errors})
    report['failures']=failures
    report['pass']=not failures
    encoded=json.dumps(report,indent=2)
    print(encoded)
    if opt.output:
        path=Path(opt.output);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(encoded+'\n',encoding='utf-8')
    if failures:
        raise SystemExit(1)

if __name__=='__main__':
    main()
