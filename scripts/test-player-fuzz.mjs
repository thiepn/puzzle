#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const ids=['five-letters','groups','word-ladder','anagrams','letter-hive','word-grid','theme-trail','word-pieces','mini-crossword','cryptogram','word-search','sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','make-24','mines','nonogram','loop','bridges','light-up','islands','hitori','binary','queens','number-path','tents','rectangles','dominoes','towers','fillomino','network','sliding-tiles','lights-out','untangle'];
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};

ok(ids.length===36,'expected 36 games');
ok(app.includes('const P17_VERSION=17;'),'Phase 17 version missing');
ok(app.includes('const P17_METHODS={'),'player-fuzz method registry missing');
for(const id of ids)ok(app.includes(`'${id}':`),`player-fuzz method missing: ${id}`);
for(const needle of [
  'function p17StateDigest(',
  'function p17DurableStateDigest(',
  'async function p17ValidateActive(',
  'async function p17PersistCurrent(',
  'async function p17PersistedStatus(',
  'async function p17CorruptPersisted(',
  'async function p17FinishBoundary(',
  'function p17SessionSummary(',
  'window.__PA_PLAYER_FUZZ__'
]) ok(app.includes(needle),`missing Phase 17 contract: ${needle}`);
ok(app.includes('repairSavedActive(game,cloneValue(active),fresh)'),'Phase 17 does not validate against production save repair');
ok(app.includes("errors.push('puzzle witness stopped satisfying Phase 16')"),'Phase 17 does not retain Phase 16 witness');
ok(app.includes("localStorage.removeItem('pa:checkpoint:'+active.gameId)"),'corruption probe does not isolate the persisted record');
ok(app.includes('phase17Boundary:true'),'completion boundary probe missing');

console.log(JSON.stringify({pass:true,phase:17,games:ids.length,checks},null,2));
