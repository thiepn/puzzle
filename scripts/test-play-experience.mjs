#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const ROOT=new URL('../',import.meta.url),read=f=>fs.readFileSync(new URL(f,ROOT),'utf8');
const noop=()=>{},el={dataset:{},style:{},classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop,appendChild:noop,remove:noop,setAttribute:noop,innerHTML:'',firstChild:null};
const store={};const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};
const box={console,structuredClone,URL,URLSearchParams,Date,Math,Map,Set,WeakMap,WeakSet,Uint32Array,Uint8Array,Int8Array,Int32Array,performance,crypto:webcrypto,document:{querySelector:()=>el,querySelectorAll:()=>[],createElement:()=>({...el}),addEventListener:noop,documentElement:el,body:el,hidden:false},location:{hash:'',protocol:'https:'},navigator:{},window:{matchMedia:()=>({matches:false,addEventListener:noop}),addEventListener:noop},localStorage,setTimeout:noop,clearTimeout:noop,setInterval:noop,clearInterval:noop,requestAnimationFrame:noop,CSS:{escape:x=>x}};
vm.createContext(box);for(const f of ['word-dictionary.js','word-content.js'])vm.runInContext(read(f),box);
let src=read('app.js');const cut=src.lastIndexOf("  document.addEventListener('click',e=>{");assert.ok(cut>0);
src=src.slice(0,cut)+`globalThis.TEST={GAMES,state,byId,PLAY_GUIDES,playSession,canUndoGame,redoGame,playSignature,repairSavedActive,sanitizeSettings,baseGameShell,acceptedLadderPath,acceptedLadderGraph,acceptedWordSet,acceptedWordsOfLength,hiveDictionaryWords,isWordOnGrid,w6LadderGraph,resultRewardSummary,nextResultDifficulty,resultPanel,statsRecord,statsDayKey,statsHumanDuration};})();`;
vm.runInContext(src,box);const T=box.TEST,plain=x=>JSON.parse(JSON.stringify(x));
let assertions=0;const ok=(condition,message)=>{assert.ok(condition,message);assertions++;};
const games=Object.values(T.GAMES);ok(games.length===36,'36 games retained');ok(Object.keys(T.PLAY_GUIDES).length===36,'each game has an individual guide');
let generated=0,hints=0;const slow=[];
for(const game of games){
 ok(T.PLAY_GUIDES[game.id]?.length===3,`${game.id}: missing coach, controls, or strategy`);
 for(const difficulty of game.difficulties||['Standard'])for(let seed=0;seed<2;seed++){
  const start=performance.now(),a=await game.create(`play-experience-${seed}`,difficulty),fresh=await game.create(`play-experience-${seed}`,difficulty);
  assert.deepEqual(plain(a.puzzle),plain(fresh.puzzle),`${game.id} deterministic puzzle`);assertions++;
  const restored=T.repairSavedActive(game,structuredClone(a),fresh);ok(restored,`${game.id} ${difficulty}: save restores`);
  assert.deepEqual(plain(restored.state),plain(a.state),`${game.id} ${difficulty}: progress survives repair`);assertions++;
  const html=T.baseGameShell(T.byId[game.id],a,'<div>board</div>');ok(html.includes('data-game-pause')&&html.includes('data-game-hint')&&html.includes('data-play-difficulty')&&html.includes('play-action-dock')&&html.includes('game-status-cluster'),`${game.id}: phase 2 chrome present`);
  generated++;if(performance.now()-start>1000)slow.push({game:game.id,difficulty,ms:Math.round(performance.now()-start)});
 }
 const a=await game.create('play-hint-check',game.defaultDifficulty);await game.hint(a);ok(!a.completed,`${game.id}: requesting a hint must not complete the puzzle`);hints++;
}
// Expanded accepted words must not be dropped by the save-repair layer.
for(const id of ['letter-hive','word-grid']){
 const game=T.GAMES[id];let witnessed=false;
 for(let seed=0;seed<12&&!witnessed;seed++){
  const a=await game.create(`dictionary-restore-${seed}`,'Easy');
  const candidates=id==='letter-hive'?T.hiveDictionaryWords(a.puzzle.center,a.puzzle.letters):[...T.acceptedWordsOfLength(3),...T.acceptedWordsOfLength(4)].map(w=>w.toUpperCase());
  const word=candidates.find(w=>!a.puzzle.answers.includes(w)&&(id==='letter-hive'||T.isWordOnGrid(w,a.puzzle.grid,a.puzzle.n)));
  if(!word)continue;a.state.found=[word];if(id==='letter-hive')a.state.score=game.points(word);
  const repaired=T.repairSavedActive(game,a,await game.create(a.seed,a.difficulty));ok(repaired?.state.found.includes(word),`${id}: broad word ${word} survives reload`);witnessed=true;
 }
 ok(witnessed,`${id}: tested a word outside the curated answer pool`);
}
{
 const game=T.GAMES['word-ladder'];let witnessed=false;
 for(let seed=0;seed<12&&!witnessed;seed++){
  const a=await game.create(`ladder-restore-${seed}`,'Easy'),start=a.puzzle.start;
  const extra=T.acceptedLadderGraph(start.length).get(start).find(w=>w!==a.puzzle.target&&!(T.w6LadderGraph(start.length).get(start)||[]).includes(w));
  if(!extra)continue;a.state.chain.push(extra);const repaired=T.repairSavedActive(game,a,await game.create(a.seed,a.difficulty));ok(repaired.state.chain.includes(extra),'Word Ladder: broad next word survives reload');witnessed=true;
  ok(a.puzzle.optimal===T.acceptedLadderPath(a.puzzle.start,a.puzzle.target).length-1,'Word Ladder par uses broad dictionary');
  const blocked=new Set([extra]),path=T.acceptedLadderPath(start,a.puzzle.target,blocked);ok(!path||!path.includes(extra),'Word Ladder hint never revisits a blocked word');
 }
 ok(witnessed,'tested a broad-dictionary ladder step');
}
// Repeated guesses do not consume an attempt.
{
 const g=T.GAMES['five-letters'],a=await g.create('repeat-word','Easy');a.state.guesses=[{word:'TRACE',states:g.evaluateGuess(a.puzzle.answer,'TRACE')}];a.state.current='TRACE';await g.key(a,'ENTER');ok(a.state.guesses.length===1,'duplicate Wordle guess rejected without losing a turn');
}
// Duplicate unsuccessful group submissions retain the original mistake count, including after restore.
{
 const g=T.GAMES.groups,a=await g.create('repeat-group','Easy');a.state.selected=[...a.puzzle.tiles.filter(t=>t.groupId==='g0').slice(0,3),a.puzzle.tiles.find(t=>t.groupId==='g1')].map(t=>t.id);
 await g.submit(a);ok(a.state.mistakes===1,'first incorrect group counts once');await g.submit(a);ok(a.state.mistakes===1,'duplicate group not penalized');const b=T.repairSavedActive(g,a,await g.create(a.seed,a.difficulty));await g.submit(b);ok(b.state.mistakes===1,'duplicate group detection survives restore');
}
// Undo and redo preserve notes and board state rather than recomputing an answer.
{
 const g=T.GAMES.sudoku,a=await g.create('undo-redo-notes','Easy'),i=a.state.selected,original=plain(a.state.board);a.state.notes[i]=[1,2];await g.enter(a,a.puzzle.solution[i]);const placed=plain(a.state);
 ok(T.canUndoGame(g,a),'undo enabled after an edit');await g.undo(a);assert.deepEqual(plain(a.state.board),original);assertions++;ok(a.state.notes[i].includes(2),'undo restores notes');ok(T.playSession(a).redo.length===1,'redo snapshot created');await T.redoGame(g,a);assert.deepEqual(plain(a.state),placed);assertions++;
 T.playSession(a).paused=true;const before=plain(a.state);await g.enter(a,0);assert.deepEqual(plain(a.state),before,'paused game ignores mutations');assertions++;
}
{
 const g=T.GAMES.sudoku,a=await g.create('hint-count','Easy');a.hintsUsed=7;const b=T.repairSavedActive(g,a,await g.create(a.seed,a.difficulty));ok(b.hintsUsed===7,'hint count survives reopening');
 const settings=T.sanitizeSettings({theme:'dark',difficulties:{sudoku:'Hard',nonexistent:'Hard','word-grid':'<script>'}});ok(settings.difficulties.sudoku==='Hard'&&!settings.difficulties.nonexistent,'remembered difficulty sanitized');
}

// Phase 7 result recognition must reflect real history rather than fabricated rewards.
{
 const oldHistory=T.state.history;
 const g=T.GAMES.sudoku,now=Date.now(),current={result:{id:'current',gameId:'sudoku',outcome:'completed',difficulty:'Easy',durationMs:60000,metrics:{hintsUsed:0},endedAt:now},outcome:'completed',durationMs:60000,difficulty:'Easy',hintsUsed:0,state:{}};
 T.state.history=[
  current.result,
  {id:'prev-sudoku',gameId:'sudoku',outcome:'completed',difficulty:'Easy',durationMs:90000,metrics:{hintsUsed:1},endedAt:now-1000},
  {id:'prev-groups',gameId:'groups',outcome:'completed',difficulty:'Easy',durationMs:80000,metrics:{hintsUsed:0},endedAt:now-2000},
 ];
 let reward=T.resultRewardSummary(current,g);
 ok(reward.newBest,'Phase 7: faster same-difficulty solve earns New fastest');
 ok(reward.clean,'Phase 7: zero-hint completion earns Clean solve');
 ok(reward.streak===3,'Phase 7: current consecutive completion streak is counted');
 ok(reward.badges.some(x=>x.kind==='best'),'Phase 7: fastest badge rendered from history');
 ok(T.nextResultDifficulty(g,current)==='Medium','Phase 7: next difficulty steps upward');
 const html=T.resultPanel(current,g,'');
 ok(html.includes('result-badges')&&html.includes('Share result')&&html.includes('data-result-challenge'),'Phase 7: result panel contains rewards and next actions');

 const firstHard={...current,difficulty:'Hard',result:{...current.result,id:'hard-current',difficulty:'Hard',endedAt:now+1000}};
 T.state.history=[firstHard.result,...T.state.history.filter(h=>h.id!=='current')];
 reward=T.resultRewardSummary(firstHard,g);
 ok(reward.firstDifficulty,'Phase 7: first solve at a difficulty is recognized');
 ok(T.nextResultDifficulty(g,firstHard)===null,'Phase 7: hardest difficulty does not invent another tier');

 const failed={...current,result:{...current.result,id:'failed-current',outcome:'failed',endedAt:now+2000},outcome:'failed'};
 T.state.history=[failed.result,{id:'before-fail',gameId:'groups',outcome:'completed',difficulty:'Easy',durationMs:10000,metrics:{},endedAt:now+1000}];
 reward=T.resultRewardSummary(failed,g);
 ok(reward.streak===0&&!reward.clean&&!reward.newBest,'Phase 7: failed attempt earns no completion rewards');

 const milestone={...current,result:{...current.result,id:'milestone-current',endedAt:now+5000}};
 T.state.history=[milestone.result,
  {id:'m1',gameId:'groups',outcome:'completed',difficulty:'Easy',durationMs:1,metrics:{},endedAt:now+4000},
  {id:'m2',gameId:'anagrams',outcome:'completed',difficulty:'Easy',durationMs:1,metrics:{},endedAt:now+3000},
  {id:'m3',gameId:'nonogram',outcome:'completed',difficulty:'Easy',durationMs:1,metrics:{},endedAt:now+2000},
  {id:'m4',gameId:'network',outcome:'completed',difficulty:'Easy',durationMs:1,metrics:{},endedAt:now+1000},
 ];
 reward=T.resultRewardSummary(milestone,g);
 ok(reward.totalSolved===5&&reward.badges.some(x=>x.kind==='milestone'),'Phase 7: real solve-count milestone is recognized');
 T.state.history=oldHistory;
}


// Phase 8 local record aggregation must be deterministic and purely history-derived.
{
 const now=new Date();now.setHours(12,0,0,0);const t=now.getTime(),day=86400000;
 const history=[
  {id:'s1',gameId:'sudoku',outcome:'completed',difficulty:'Easy',durationMs:60000,metrics:{hintsUsed:0},endedAt:t},
  {id:'s2',gameId:'sudoku',outcome:'completed',difficulty:'Easy',durationMs:45000,metrics:{hintsUsed:1},endedAt:t-1000},
  {id:'g1',gameId:'groups',outcome:'completed',difficulty:'Medium',durationMs:80000,metrics:{hintsUsed:0},endedAt:t-day},
  {id:'u1',gameId:'untangle',outcome:'failed',difficulty:'Hard',durationMs:30000,metrics:{hintsUsed:0},endedAt:t-2*day},
  {id:'n1',gameId:'nonogram',outcome:'completed',difficulty:'Hard',durationMs:120000,metrics:{hintsUsed:2},endedAt:t-3*day},
 ];
 const record=T.statsRecord(history);
 ok(record.completed.length===4,'Phase 8: only completed results count as solves');
 ok(record.attempts===5,'Phase 8: attempts include ended runs');
 ok(record.clean.length===2,'Phase 8: clean solves use zero hint steps');
 ok(record.currentStreak===3,'Phase 8: current streak stops at first non-completion');
 ok(record.bestStreak===3,'Phase 8: best streak derived from chronological history');
 ok(record.uniqueGames===3,'Phase 8: unique solved games excludes failed-only games');
 const sudoku=record.games.find(g=>g.gameId==='sudoku');
 ok(sudoku.solves===2&&sudoku.bests.Easy.durationMs===45000,'Phase 8: per-game fastest time retained by difficulty');
 ok(Math.round(sudoku.avgHints*10)===5,'Phase 8: average hints derived from completed solves');
 ok(record.categories.find(c=>c.id==='word').solves===1,'Phase 8: family solve totals are correct');
 ok(record.categories.find(c=>c.id==='number').games===1,'Phase 8: family game coverage is unique');
 ok(record.days.length===28&&record.days.at(-1).count===2,'Phase 8: 28-day activity bins local-day solves');
 ok(T.statsHumanDuration(3661000)==='1h 1m','Phase 8: long solve time has readable duration format');
}

console.log(JSON.stringify({pass:true,games:games.length,generated,hintEngines:hints,assertions,slow},null,2));
