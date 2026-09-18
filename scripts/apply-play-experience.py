from pathlib import Path
import hashlib
root=Path(__file__).resolve().parent.parent
expected={'app.js':'ea0c9905b4bf948447fc130d8c8dab86258f51f09b3c183b6aec1c1d59e25c04','styles.css':'67e23c43fbfacdfb137aae4d2f2f2638e91d04bbbacf775d344f0bd89fc64c13','sw.js':'2e8e774ebb9dad1b029d9de9a5e8ed09fee1ae1fe8e0a93e5e7793e736a212fe'}
for name,digest in expected.items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest, f'Unexpected source revision: {name}'
s=(root/'app.js').read_text()
def replace(a,b):
 global s
 assert s.count(a)==1, (a[:90],s.count(a))
 s=s.replace(a,b)
def section(a,b,new):
 global s
 i=s.index(a);j=s.index(b,i);s=s[:i]+new+'\n\n'+s[j:]
replace("const APP_VERSION = '1.0.2';", "const APP_VERSION = '1.1.0';")
replace("const BUILD_PHASE = 'Expanded Lexicon & Hint Fix';", "const BUILD_PHASE = 'Play Experience';")
replace("    const el=document.createElement('div'); el.className='toast'; el.textContent=msg; toastRoot.appendChild(el);", "    if(state.currentActive&&/^Hint [1-4]\\/4 · /.test(String(msg))&&state.currentActive.state._proofHintView){playSession(state.currentActive).feedback='';return;}\n    if(state.currentActive)gameFeedback(msg);\n    const el=document.createElement('div'); el.className='toast'; el.textContent=msg; toastRoot.appendChild(el);")
replace("      playMode:['relaxed','challenge'].includes(v.playMode)?v.playMode:'relaxed',", "      playMode:['relaxed','challenge'].includes(v.playMode)?v.playMode:'relaxed',\n      difficulties:Object.fromEntries(Object.entries(v.difficulties&&typeof v.difficulties==='object'?v.difficulties:{}).filter(([id,d])=>Object.hasOwn(GAMES,id)&&typeof d==='string').map(([id,d])=>[id,normalizeDifficulty(GAMES[id],d)])),")
replace("    if (active.completed || document.hidden || retiredActives.has(active)) return;", "    if (active.completed || document.hidden || retiredActives.has(active) || playSession(active).paused) return;")
replace("      outcome,difficulty:active.difficulty,durationMs,metrics,endedAt:Date.now()};", "      outcome,difficulty:active.difficulty,durationMs,metrics:{...metrics,hintsUsed:active.hintsUsed||0},endedAt:Date.now()};")
replace("  function baseGameShell(g, active, boardHtml, extraHtml=''){", (root/'scripts/play-experience-source.js').read_text()+"\n  function baseGameShell(g, active, boardHtml, extraHtml=''){")
section("  function baseGameShell(g, active, boardHtml, extraHtml=''){", "  function gameMenu(game, active){", r'''  function baseGameShell(g, active, boardHtml, extraHtml=''){
    const game=GAMES[g.id],ui=playSession(active),favorite=state.favorites.includes(g.id),difficulties=game.difficulties||['Standard'];
    return `<div class="game-page" data-play-game="${g.id}" data-play-seed="${esc(active.seed)}" data-play-category="${g.category}">
      <div class="game-top"><button class="game-back" data-game-back aria-label="Back to puzzles">←</button><div class="game-title"><small>${esc(CATEGORIES[g.category].label)} puzzles</small><h1>${esc(g.name)}</h1></div><button class="game-menu" data-game-menu aria-label="Game menu">•••</button></div>
      <p class="game-objective">${esc(game.rules.objective)}</p>
      <div class="play-commandbar" role="group" aria-label="Puzzle controls">
        <label class="play-difficulty"><span>Difficulty</span><select data-play-difficulty aria-label="Difficulty for a new puzzle" title="Changing difficulty starts a new puzzle">${difficulties.map(d=>`<option ${active.difficulty===d?'selected':''}>${esc(d)}</option>`).join('')}</select></label>
        ${typeof game.undo==='function'?`<div class="play-history"><button data-play-undo title="Undo (Ctrl/⌘ Z)" ${canUndoGame(game,active)?'':'disabled'}>↶ <span>Undo</span></button><button data-play-redo title="Redo (Ctrl/⌘ Shift Z)" ${!active.completed&&ui.redo.length?'':'disabled'}>↷ <span>Redo</span></button></div>`:''}
        <button class="play-hint-button" data-game-hint ${active.completed||ui.paused||ui.busy?'disabled':''}>${ui.busy?'Thinking…':'Hint'}</button>
        <button data-play-guide aria-expanded="${ui.guide}" aria-controls="play-guide">Guide</button>
        <button data-game-pause ${active.completed?'disabled':''}>${ui.paused?'Resume':'Pause'}</button>
      </div>
      ${playGuide(game,active)}
      <div class="play-feedback" data-play-feedback role="status" aria-live="polite" ${ui.feedback?'':'hidden'}>${esc(ui.feedback)}</div>
      <div class="play-hint-zone">${proofHintPanel(active)}${active.state._proofHintView?'<button class="hint-dismiss" data-hint-dismiss aria-label="Hide hint">Hide hint</button>':''}</div>
      <div class="game-layout"><section class="game-stage ${ui.paused?'is-paused':''}" ${ui.paused?'inert':''}><div class="game-board-wrap">${boardHtml}</div>${extraHtml}</section>
        <aside class="game-side"><div class="play-session-summary"><div class="side-stat"><label>${ui.paused?'Paused':'Time'}</label><div class="timer" data-timer>${formatTime(activeDuration(active))}</div></div><div class="side-stat play-progress"><label>Progress</label><strong>${esc(safeProgressLabel(active))}</strong></div></div>
          <p class="play-start-tip">${esc(PLAY_GUIDES[g.id][0])}</p><button class="small-button" data-game-rules>Full rules</button><button class="small-button" data-game-favorite aria-pressed="${favorite}">${favorite?'★ Favorite':'☆ Favorite'}</button>
          <p class="play-save-note">${state.settings.playMode==='challenge'?'Challenge mode':'Relaxed mode'} · Autosaved locally</p>
        </aside>
        ${ui.paused?'<div class="pause-cover" role="region" aria-label="Puzzle paused"><strong>Take your time.</strong><p>The clock is paused and your progress is saved.</p><button class="primary-button" data-resume-puzzle>Resume puzzle</button></div>':''}
      </div></div>`;
  }
  function bindGameShell(game,active){
    $('[data-game-back]').onclick=()=>go('home');$('[data-game-menu]').onclick=()=>gameMenu(game,active);
    $$('[data-game-rules]').forEach(b=>b.onclick=()=>showRules(game));
    $('[data-game-hint]').onclick=()=>requestGameHint(game,active);
    $('[data-game-favorite]').onclick=()=>{toggleFavorite(game.id);const b=$('[data-game-favorite]');if(b){const on=state.favorites.includes(game.id);b.textContent=on?'★ Favorite':'☆ Favorite';b.setAttribute('aria-pressed',String(on));}};
    $('[data-play-difficulty]').onchange=e=>newGame(game.id,e.target.value);
    $('[data-play-guide]').onclick=()=>{playSession(active).guide=!playSession(active).guide;game.render(active);$('[data-play-guide]')?.focus({preventScroll:true});};
    $('[data-game-pause]').onclick=()=>pauseGame(game,active);const resume=$('[data-resume-puzzle]');if(resume)resume.onclick=()=>pauseGame(game,active);
    const undo=$('[data-play-undo]'),redo=$('[data-play-redo]');if(undo)undo.onclick=()=>game.undo(active);if(redo)redo.onclick=()=>redoGame(game,active);
    const dismiss=$('[data-hint-dismiss]');if(dismiss)dismiss.onclick=()=>dismissGameHint(active);
    startTimer(active);
  }''')
replace("    routeToGame(id,seedString(),normalizeDifficulty(game,difficulty));", "    rememberDifficulty(game,difficulty);routeToGame(id,seedString(),normalizeDifficulty(game,difficulty));")
replace("const requestedSeed=sanitizeSharedSeed(rawSeed), requestedDiff=normalizeDifficulty(game,rawDiff);", "const requestedSeed=sanitizeSharedSeed(rawSeed), requestedDiff=normalizeDifficulty(game,rawDiff||state.settings.difficulties?.[game.id]);")
replace("    const wordArray=v=>arr(v,null,w=>alpha(w)&&allowedWords.includes(w))&&unique(v);", "    const wordArray=v=>arr(v,null,w=>alpha(w)&&(allowedWords.includes(w)||(game.id==='letter-hive'&&w.length>=4&&isAcceptedWord(w)&&w.includes(p.center)&&wordUsesOnlyLetters(w,p.letters))||(game.id==='word-grid'&&w.length>=3&&isAcceptedWord(w)&&isWordOnGrid(w,p.grid,p.n))))&&unique(v);")
replace("chain:v=>arr(v,null,x=>typeof x==='string'&&/^[a-z]+$/.test(x)&&x.length===p.length)&&v.length>0&&v[0]===p.start&&v.every((x,i)=>i===0||(w6LadderGraph(p.length).get(v[i-1])||[]).includes(x)),", "chain:v=>arr(v,null,x=>typeof x==='string'&&/^[a-z]+$/.test(x)&&x.length===p.length&&(isAcceptedWord(x)||x===p.start))&&v.length>0&&unique(v)&&v[0]===p.start&&v.every((x,i)=>i===0||oneLetterDiff(v[i-1],x)),")
replace("    const out={...fresh,state:repaired,startedAt:null};", "    const out={...fresh,state:repaired,startedAt:null};\n    if(Number.isInteger(raw.hintsUsed)&&raw.hintsUsed>=0&&raw.hintsUsed<=100000)out.hintsUsed=raw.hintsUsed;\n    if(game.id==='groups'&&Array.isArray(raw.triedGroups))out.triedGroups=raw.triedGroups.filter(x=>typeof x==='string'&&x.length<=500).slice(-200);")
replace("  function acceptedLadderPath(start,target){", "  function acceptedLadderPath(start,target,blocked=new Set()){")
i=s.index("  function acceptedLadderPath(");j=s.index("  function w6LadderPairs",i);s=s[:i]+s[i:j].replace("if(prev.has(nx))continue;prev.set(nx,w);","if(prev.has(nx)||blocked.has(nx))continue;prev.set(nx,w);")+s[j:]
replace("path=acceptedLadderPath(cur,a.puzzle.target);if(!path||path.length<2)return toast('No hint available.');", "path=acceptedLadderPath(cur,a.puzzle.target,new Set(a.state.chain.slice(0,-1)));if(!path||path.length<2)return toast('No route remains without revisiting a word. Undo a step and try another branch.');")
replace("  installGameLifecycle();", "  installPlayExperience();\n  installGameLifecycle();")
replace("          if(active?.completed||retiredActives.has(active))return;", "          if(active?.completed||retiredActives.has(active)||playSession(active).paused)return;")
replace("        enhanceDenseBoard(game,active);", "        enhanceDenseBoard(game,active);\n        setupPlayExperience(game,active);")
replace("        enhanceBoardAccessibility(game,active);", "        enhanceBoardAccessibility(game,active);\n        const undoKeys=window.onkeydown;window.onkeydown=e=>{if(!e.defaultPrevented&&!overlayRoot.firstChild&&!active.completed&&!playSession(active).paused&&(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable=\"true\"]')){const k=e.key.toLowerCase();if(k==='z'||k==='y'){e.preventDefault();if(k==='y'||e.shiftKey)redoGame(game,active);else if(canUndoGame(game,active))game.undo(active);return;}}undoKeys?.(e);};")
replace("    if(active&&!active.completed&&!retiredActives.has(active)){active.startedAt=Date.now();startTimer(active);}", "    if(active&&!active.completed&&!retiredActives.has(active)&&!playSession(active).paused){active.startedAt=Date.now();startTimer(active);}")
replace("<span>Time</span></div>${metricsHtml}</div><div class=\"result-actions\">", "<span>Time</span></div>${metricsHtml}<div><strong>${active.hintsUsed||0}</strong><span>Hint steps</span></div></div><p class=\"result-next-copy\">${active.outcome==='failed'?'A fresh puzzle is ready when you are.':active.hintsUsed?'Solved with assistance. Try the next puzzle using what you learned.':'Puzzle complete. Keep this difficulty or choose a different challenge.'}</p><div class=\"result-actions\">")
section("  async function renderHome(ticket=routeGeneration) {", "  function safeProgressLabel(a)", r'''  async function renderHome(ticket=routeGeneration){
    stopTimer();state.currentGame=null;state.currentActive=null;updateNav('home');document.title='Puzzle Arcade';
    state.active=sanitizeActiveList(await activeRecords());if(!routeIsCurrent(ticket))return;
    const available=ALL_GAMES.filter(g=>g.status==='available'),activeSorted=[...state.active].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,4);
    const filtered=available.filter(g=>state.category==='all'||(state.category==='favorites'?state.favorites.includes(g.id):g.category===state.category));
    main.innerHTML=`<div class="page play-library"><section class="hero-row"><div><p class="page-kicker">Your puzzle arcade</p><h1 class="hero-title">Pick a puzzle.<br>Keep going.</h1><p class="hero-copy">36 games. Unlimited puzzles. No accounts, lives, or daily lockouts.</p></div><button class="random-button" data-action="random">↻ Surprise me</button></section>
      ${activeSorted.length?`<section class="section"><div class="section-head"><div><h2>Pick up where you left off</h2></div></div><div class="continue-row">${activeSorted.map(a=>`<button class="continue-card" data-game="${a.gameId}"><strong>${esc(byId[a.gameId].name)}</strong><span>${esc(a.difficulty)} · ${esc(safeProgressLabel(a))}</span></button>`).join('')}</div></section>`:''}
      <section class="section"><div class="library-search-row"><h2>Find your next puzzle</h2><label class="library-search"><span class="sr-only">Search games</span><input type="search" data-library-search placeholder="Search games or skills…" value="${esc(state.libraryQuery||'')}" autocomplete="off"></label></div>
      <div class="filterbar" aria-label="Game categories">${['all','word','number','logic','spatial','favorites'].map(c=>{const count=c==='all'?available.length:c==='favorites'?state.favorites.length:available.filter(g=>g.category===c).length;return `<button class="filter ${state.category===c?'is-active':''}" data-category-filter="${c}" aria-pressed="${state.category===c}">${c==='all'?'All':c==='favorites'?'Favorites':CATEGORIES[c].label} <span>${count}</span></button>`;}).join('')}</div>
      <p class="library-count" data-catalog-count aria-live="polite"></p><div class="game-grid" data-catalog-grid>${filtered.map(gameCard).join('')}</div><p class="library-empty" data-library-empty hidden>No games match this search. Try a shorter name or another category.</p></section></div>`;
    bindCommon();const search=$('[data-library-search]');const filter=()=>{state.libraryQuery=search.value;const q=search.value.trim().toLowerCase();let count=0;$$('[data-catalog-grid] .game-card').forEach(el=>{const g=byId[el.dataset.game],show=!q||`${g.name} ${g.description} ${CATEGORIES[g.category].label}`.toLowerCase().includes(q);el.hidden=!show;if(show)count++;});$('[data-catalog-count]').textContent=`${count} ${count===1?'game':'games'}`;$('[data-library-empty]').hidden=count>0;};search.oninput=filter;filter();
  }''')
replace("<div class=\"game-card__meta\">${CATEGORIES[g.category].label} · ${g.status==='available'?'Play now':'Planned'}</div>", "<p class=\"game-card__description\">${esc(g.description)}</p><div class=\"game-card__meta\">${CATEGORIES[g.category].label} · ${state.active.some(a=>a.gameId===g.id)?'Continue puzzle':'Play now'}</div>")
replace("    const avail=ALL_GAMES.filter(g=>g.status==='available');", "    const avail=ALL_GAMES.filter(g=>g.status==='available'&&(state.category==='all'||(state.category==='favorites'?state.favorites.includes(g.id):g.category===state.category)));")
replace("    openGame(g.id, true);", "    openGame(g.id, false);")
css=(root/'styles.css').read_text()+(root/'scripts/play-experience-source.css').read_text()
sw=(root/'sw.js').read_text().replace('1.0.2','1.1.0').replace("'v19'","'v20'")
outputs={'app.js':s,'styles.css':css,'sw.js':sw}
verified={'app.js':'bad538983593ce1677134706f3d6ae941d604a7d2b12d5a168c98095af31982f','styles.css':'08b6f8eacffd56f1fe162a7479bf944bcebb9d55434b9d9bbb626eafd942b796','sw.js':'a6afc48a399fba07c6e4f76f0524d470375fe35c2c7b335ff2097434ae11f512'}
for name,content in outputs.items():
 digest=hashlib.sha256(content.encode()).hexdigest()
 assert digest==verified[name], f'Output differs from locally tested source: {name} {digest}'
for name,content in outputs.items():(root/name).write_text(content)
p=root/'scripts/test-word-entry.mjs'
t=p.read_text().replace("const APP_VERSION = '1.0.2';","const APP_VERSION = '1.1.0';").replace('acceptedLadderPath(cur,a.puzzle.target)','acceptedLadderPath(cur,a.puzzle.target,new Set(a.state.chain.slice(0,-1)))')
p.write_text(t)
p=root/'scripts/release-check.mjs';t=p.read_text();t=t.replace("  '1.0.2':{cache:'v19',phase:'Expanded Lexicon & Hint Fix'}", "  '1.0.2':{cache:'v19',phase:'Expanded Lexicon & Hint Fix'},\n  '1.1.0':{cache:'v20',phase:'Play Experience'}")
t=t.replace('const out={phase:expected.phase', "const playTest=run('node',['scripts/test-play-experience.mjs']);must(playTest.status===0,`play-experience regression tests failed: ${(playTest.stderr||playTest.stdout).trim()}`);\nconst out={phase:expected.phase")
p.write_text(t)
p=root/'README.md';t=p.read_text().replace('**Stable release: 1.0.0 · Wave 10 · PWA cache v17**','**Current release: 1.1.0 · Play Experience · PWA cache v20**').replace('The current PWA cache is **v16**.','The historical Wave 6 build used PWA cache v16; the current release uses v20.')
t=t.replace('## Catalog — 36 / 36 playable','## Play Experience 1.1.0\n\nAll 36 games now share a board-first workbench, an individual strategy/control guide, visible difficulty selection, persistent hints and feedback, pause/resume, and clearer results. Native undo games gain redo and keyboard shortcuts. The library adds inline search, category counts, favorites filtering, and resume-first random play.\n\nWord progress repair now agrees with the expanded dictionary. Word Ladder uses dictionary-wide par and non-repeating hint routes; Groups rejects duplicate mistakes and explains near misses; Five Letters rejects repeated guesses; Nonogram gains marking and keyboard controls; Cryptogram gains letter frequencies; Sudoku gains matching-digit emphasis. See `docs/PLAY_EXPERIENCE.md` for scope and verification commands.\n\n## Catalog — 36 / 36 playable')
p.write_text(t)
p=root/'CHANGELOG.md';t=p.read_text();p.write_text('# 1.1.0 — Play Experience\n\nShared controls and individual guides across all 36 games; undo/redo; persistent hints; pause; search and resume improvements; dictionary-compatible progress recovery; Word Ladder, Groups, Five Letters, Sudoku, Nonogram, and Cryptogram improvements. Regression and HTTP browser tests added. Runtime cache v20; storage schema remains 1.\n\n'+t)
(root/'RELEASE_NOTES.md').write_text('# Puzzle Arcade 1.1.0 — Play Experience\n\nThe existing 36-game catalog is preserved. This release improves the shared play interface and learning flow, fixes accepted-word save recovery, and adds focused game improvements. No accounts, runtime dependencies, paid features, or new games.\n\nRun `node scripts/release-check.mjs` and `python scripts/test-play-browser.py` against a local HTTP server. CI must pass before deployment. See `docs/PLAY_EXPERIENCE.md` for scope, test coverage, and remaining verification limits.\n')
print('Applied exact locally tested runtime hashes and release metadata.')
