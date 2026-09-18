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
src=src.slice(0,cut)+`globalThis.TEST={GAMES,state,byId,PLAY_GUIDES,playSession,canUndoGame,redoGame,playSignature,repairSavedActive,sanitizeSettings,baseGameShell,acceptedLadderPath,acceptedLadderGraph,acceptedWordSet,acceptedWordsOfLength,hiveDictionaryWords,isWordOnGrid,w6LadderGraph};})();`;
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
  const html=T.baseGameShell(T.byId[game.id],a,'<div>board</div>');ok(html.includes('data-game-pause')&&html.includes('data-play-guide')&&html.includes('data-play-difficulty'),`${game.id}: controls present`);
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
console.log(JSON.stringify({pass:true,games:games.length,generated,hintEngines:hints,assertions,slow},null,2));
