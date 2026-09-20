#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const app=fs.readFileSync(new URL('app.js',root),'utf8');
const ids=["five-letters","groups","word-ladder","anagrams","letter-hive","word-grid","theme-trail","word-pieces","mini-crossword","cryptogram","word-search","sudoku","killer-sudoku","kakuro","unequal","arithmetic-cages","make-24","mines","nonogram","loop","bridges","light-up","islands","hitori","binary","queens","number-path","tents","rectangles","dominoes","towers","fillomino","network","sliding-tiles","lights-out","untangle"];
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const start=app.indexOf('const P14_SIGNALS={'),end=app.indexOf('};',start);
ok(start>=0&&end>start,'Phase 14 signal registry missing');
const block=app.slice(start,end);
for(const id of ids)ok(block.includes("'"+id+"'"),'variety signal missing '+id);
ok(ids.length===36,'expected 36 games');
ok(app.includes('const P14_VERSION=14;'),'Phase 14 version missing');
ok(app.includes('function p14Fingerprint('),'fingerprint engine missing');
ok(app.includes('function p14Novelty('),'novelty comparator missing');
ok(app.includes('function p14NearDuplicate('),'near-duplicate detector missing');
ok(app.includes('function p14RecentFingerprints('),'recent-puzzle window missing');
ok(app.includes('function p14ChooseFromSeeds('),'candidate selection missing');
ok(app.includes('async function p14SelectSeed('),'new-puzzle anti-repeat selector missing');
ok(app.includes('varietyFingerprint:p14Fingerprint(active)'),'history fingerprint persistence missing');
ok(app.includes("state.history.slice(0,5)"),'random-game cooldown missing');
ok(app.includes('window.__PA_VARIETY_AUDIT__'),'browser variety audit API missing');
ok(app.includes("game.id==='mines'"),'Mines simulated-selection path missing');
console.log(JSON.stringify({pass:true,checks,games:ids.length,phase:14},null,2));
