#!/usr/bin/env python3
"""Real Chromium route/control checks; --isolated-dom is a rendering-only local fallback."""
import argparse,json,re,os
from pathlib import Path
from playwright.sync_api import sync_playwright

args=argparse.ArgumentParser()
args.add_argument('--base-url',default='http://127.0.0.1:8080/')
args.add_argument('--isolated-dom',action='store_true')
args.add_argument('--quick',action='store_true')
args.add_argument('--output',default='test-results/play-browser')
opt=args.parse_args()
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(opt.output);OUT.mkdir(parents=True,exist_ok=True)
IDS=['five-letters','groups','word-ladder','anagrams','letter-hive','word-grid','theme-trail','word-pieces','mini-crossword','cryptogram','word-search','sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','make-24','mines','nonogram','loop','bridges','light-up','islands','hitori','binary','queens','number-path','tents','rectangles','dominoes','towers','fillomino','network','sliding-tiles','lights-out','untangle']
errors=[];routes=0;controls=0;hints=0
with sync_playwright() as p:
    launch={'headless':True}
    if os.environ.get('CHROMIUM_PATH'):launch['executable_path']=os.environ['CHROMIUM_PATH']
    browser=p.chromium.launch(**launch)
    page=browser.new_page(viewport={'width':1365,'height':900})
    page.on('pageerror',lambda e:errors.append(str(e)))
    if opt.isolated_dom:
        html=re.sub(r'<script[^>]*src=[^>]*></script>','',(ROOT/'index.html').read_text())
        html=re.sub(r'<link[^>]*>','',html)
        page.set_content(html);page.add_style_tag(content=(ROOT/'styles.css').read_text())
        page.evaluate('''() => { const values=Object.create(null); const api={getItem:k=>values[k]??null,setItem:(k,v)=>values[k]=String(v),removeItem:k=>delete values[k],clear:()=>Object.keys(values).forEach(k=>delete values[k]),key:i=>Object.keys(values)[i]??null}; Object.defineProperty(window,'localStorage',{value:new Proxy(api,{get:(t,k)=>k==='length'?Object.keys(values).length:k in t?t[k]:values[k],ownKeys:()=>Object.keys(values),getOwnPropertyDescriptor:(t,k)=>k in values?{enumerable:true,configurable:true,value:values[k]}:undefined})}); }''')
        for name in ['word-dictionary.js','word-content.js','app.js']:page.evaluate((ROOT/name).read_text())
    else:page.goto(opt.base_url)
    def navigate(route):
        page.evaluate('(route)=>location.hash="#/"+route',route)
    if not opt.quick:
        page.set_viewport_size({'width':1365,'height':900})
        navigate('home');page.locator('.discovery-hero').wait_for()
        assert page.locator('.category-portal').count()==4
        assert page.locator('[data-catalog-grid] .game-card').count()==36
        assert page.locator('.continue-spotlight').is_visible()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),'desktop home overflow'
        page.screenshot(path=str(OUT/'home-1365.png'),full_page=True)
    if not opt.quick:
        family_reps={'word':'groups','number':'sudoku','logic':'nonogram','spatial':'untangle'}
        page.set_viewport_size({'width':1365,'height':900})
        for family,gid in family_reps.items():
            navigate(f'game/{gid}?seed=family-system&difficulty=Easy')
            page.wait_for_function('(x)=>document.querySelector(".game-page")?.dataset.playGame===x[0]&&document.querySelector(".game-page")?.dataset.playCategory===x[1]',arg=[gid,family])
            badge=page.evaluate('getComputedStyle(document.querySelector(".game-category-label"),"::before").content')
            pattern=page.evaluate('getComputedStyle(document.querySelector(".game-stage"),"::before").backgroundImage')
            assert badge not in ('none','normal','""'),(family,'missing family badge')
            assert pattern!='none',(family,'missing family stage pattern')
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),f'desktop family overflow: {gid}'
            page.screenshot(path=str(OUT/f'family-{family}-1365.png'),full_page=True)
    for width in ([] if opt.quick else [1365,390]):
        page.set_viewport_size({'width':width,'height':900 if width>700 else 844})
        for gid in IDS:
            for diff in ['Easy','Medium','Hard']:
                navigate(f'game/{gid}?seed=browser-{width}-{diff}&difficulty={diff}')
                page.wait_for_function('(id)=>location.hash.includes("/"+id+"?")&&document.querySelector(".game-page")?.dataset.playGame===id&&document.querySelector(".game-page")?.dataset.playSeed===new URLSearchParams(location.hash.split("?")[1]).get("seed")&&document.querySelector("[data-play-difficulty]")?.value===new URLSearchParams(location.hash.split("?")[1]).get("difficulty")',arg=gid)
                page.wait_for_timeout(55)
                assert page.locator('[data-play-difficulty]').input_value()==diff,(gid,diff)
                assert page.locator('.game-title-line h1').inner_text().strip(),gid
                overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth+2')
                if overflow:errors.append(f'page horizontal overflow: {gid} {diff} {width}px')
                routes+=1
            assert page.locator('.play-action-dock').is_visible(),gid
            page.locator('[data-game-menu]').click()
            page.locator('[data-menu-guide]').click()
            assert page.locator('#play-guide').is_visible(),gid
            assert len(page.locator('#play-guide').inner_text())>100,gid
            page.locator('[data-game-menu]').click()
            page.locator('[data-menu-guide]').click()
            assert not page.locator('#play-guide').is_visible(),gid
            page.locator('[data-game-pause]').click()
            assert page.locator('.game-stage').get_attribute('inert') is not None,gid
            assert page.locator('[data-resume-puzzle]').is_visible(),gid
            page.locator('[data-resume-puzzle]').click()
            assert page.locator('.game-stage').get_attribute('inert') is None,gid
            controls+=1
            if width==1365 and gid in ['sudoku','groups','nonogram','untangle']:
                page.screenshot(path=str(OUT/f'{gid}-{width}.png'),full_page=True)
            if width==390:
                page.locator('[data-game-hint]').click()
                page.wait_for_function('() => !document.querySelector("[data-game-hint]")?.disabled',timeout=15000)
                hints+=1
                if gid in ['cryptogram','nonogram','sudoku','groups','anagrams','untangle','kakuro','word-grid','network','bridges','five-letters']:
                    page.screenshot(path=str(OUT/f'{gid}-{width}.png'),full_page=True)
    print('Route matrix finished; checking interactions',flush=True)
    # Play complete input/undo/resume loops rather than only checking render output.
    def open_game(gid,diff='Easy',seed='interaction-check'):
        print('Interaction',gid,flush=True)
        navigate(f'game/{gid}?seed={seed}&difficulty={diff}')
        page.wait_for_function('(x)=>document.querySelector(".game-page")?.dataset.playGame===x[0]&&document.querySelector(".game-page")?.dataset.playSeed===x[1]',arg=[gid,seed])
    page.set_viewport_size({'width':390,'height':844})
    open_game('sudoku')
    cell=page.locator('[data-cell]:not(.given)').first
    idx=cell.get_attribute('data-cell');cell.click()
    page.locator('[data-num="1"]').click()
    page.wait_for_function('(i)=>document.querySelector(`[data-cell="${i}"]`).textContent.trim()==="1"',arg=idx)
    assert page.locator('[data-play-undo]').is_enabled()
    page.locator('[data-play-undo]').click()
    page.wait_for_function('(i)=>document.querySelector(`[data-cell="${i}"]`).textContent.trim()===""',arg=idx)
    assert page.locator('[data-play-redo]').is_enabled()
    page.locator('[data-play-redo]').click()
    page.wait_for_function('(i)=>document.querySelector(`[data-cell="${i}"]`).textContent.trim()==="1"',arg=idx)
    page.keyboard.press('Control+z');page.wait_for_timeout(80)
    assert page.locator(f'[data-cell="{idx}"]').inner_text().strip()==''
    page.keyboard.press('Control+Shift+z');page.wait_for_timeout(80)
    assert page.locator(f'[data-cell="{idx}"]').inner_text().strip()=='1'
    page.locator('[data-game-pause]').click();clock=page.locator('[data-timer]').inner_text();page.wait_for_timeout(1200)
    assert page.locator('[data-timer]').inner_text()==clock
    page.locator('[data-resume-puzzle]').click()
    navigate('home');page.locator('[data-library-search]').wait_for();open_game('sudoku')
    assert page.locator(f'[data-cell="{idx}"]').inner_text().strip()=='1'
    if not opt.isolated_dom:
        page.reload();page.locator('[data-cell]').first.wait_for()
        assert page.locator(f'[data-cell="{idx}"]').inner_text().strip()=='1'
    page.locator('[data-play-undo]').click();page.wait_for_timeout(70)
    page.locator('[data-num="2"]').click();page.wait_for_timeout(70)
    assert page.locator('[data-play-redo]').is_disabled()
    open_game('nonogram')
    page.locator('[data-nono="0"]').click(button='right');page.wait_for_timeout(70)
    assert 'marked' in page.locator('[data-nono="0"]').get_attribute('class')
    page.locator('[data-play-undo]').click();page.wait_for_timeout(70)
    assert 'marked' not in page.locator('[data-nono="0"]').get_attribute('class')
    page.locator('[data-play-redo]').click();page.wait_for_timeout(70)
    assert 'marked' in page.locator('[data-nono="0"]').get_attribute('class')
    page.locator('[data-nono="1"]').focus();page.keyboard.press('f');page.keyboard.press('Space');page.wait_for_timeout(70)
    assert 'filled' in page.locator('[data-nono="1"]').get_attribute('class')
    open_game('groups')
    page.locator('[data-group-tile]').first.click()
    selected=page.locator('[data-group-tile].selected').get_attribute('data-group-tile')
    page.locator('[data-play-shuffle]').click()
    assert page.locator('[data-group-tile].selected').get_attribute('data-group-tile')==selected
    open_game('anagrams')
    tile=page.locator('[data-anagram-tile]').first
    letter=tile.inner_text().strip()
    tile.click()
    page.wait_for_function('(letter)=>document.querySelector(".anagram-answer").textContent.trim()===letter',arg=letter)
    entered=page.locator('.anagram-answer').inner_text()
    page.locator('[data-play-shuffle]').click()
    assert page.locator('.anagram-answer').inner_text()==entered
    for stage in range(1,5):
        page.locator('[data-game-hint]').click()
        page.wait_for_function('() => !document.querySelector("[data-game-hint]")?.disabled')
        assert f'Hint {stage}/4' in page.locator('[data-proof-hint]').inner_text()
    page.locator('[data-hint-dismiss]').click()
    assert not page.locator('[data-proof-hint]').is_visible()
    open_game('cryptogram')
    page.locator('.cipher-frequency summary').click()
    assert page.locator('.cipher-frequency b').count()>0

    # Phase 3 discovery hierarchy and full-library fallback remain usable at a narrow width.
    page.set_viewport_size({'width':320,'height':800});navigate('home');page.locator('[data-library-search]').wait_for()
    assert page.locator('.discovery-hero').is_visible()
    assert page.locator('.category-portal').count()==4
    assert page.locator('.continue-spotlight').is_visible()
    assert page.locator('.home-mini-card').count()>=1
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),'320px home overflow'
    page.screenshot(path=str(OUT/'home-active-320.png'),full_page=True)
    page.locator('[data-library-search]').fill('sudoku')
    page.wait_for_function('() => [...document.querySelectorAll("[data-catalog-grid] .game-card")].filter(el=>!el.hidden).length===2')
    assert page.locator('[data-catalog-grid] .game-card:visible').count()==2
    page.locator('[data-library-search]').fill('no such puzzle')
    page.wait_for_function('() => !document.querySelector("[data-library-empty]")?.hidden')
    assert page.locator('[data-library-empty]').is_visible()
    page.locator('[data-library-search]').fill('')
    page.wait_for_function('() => [...document.querySelectorAll("[data-catalog-grid] .game-card")].filter(el=>!el.hidden).length===36')
    page.locator('[data-discover-category="spatial"]').click()
    page.wait_for_function('() => document.querySelector("[data-category-filter=spatial]")?.getAttribute("aria-pressed")=="true"')
    assert page.locator('[data-catalog-grid] .game-card:visible').count()==4
    for gid in ['sudoku','cryptogram','five-letters','nonogram','kakuro']:
        open_game(gid,'Hard','small-screen');page.wait_for_timeout(100)
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),f'320px overflow: {gid}'
    browser.close()
result={'pass':not errors,'routes':routes,'gameControlChecks':controls,'browserHintChecks':hints,'interactionScenarios':['undo/redo','undo/redo shortcuts','redo invalidation','pause clock','navigate/restore','Nonogram right-click and keyboard','tile shuffle preserves input','progressive hints and dismissal','cipher frequency'],'errors':errors,'environment':'isolated DOM with mocked storage' if opt.isolated_dom else 'HTTP origin with real browser storage'}
(OUT/'results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
raise SystemExit(1 if errors else 0)
