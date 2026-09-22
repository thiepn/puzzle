#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const app=read('app.js');
const sw=read('sw.js');
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};

assert.match(app,/const APP_VERSION = '\d+\.\d+\.\d+';/,'release app version missing');checks++;
has(app,'const P19_VERSION=19;','Phase 19 runtime version missing');
has(app,'const MAX_HISTORY_ENTRIES = 10000;','durable history bound missing');
has(app,'async trimHistory(limit=MAX_HISTORY_ENTRIES)','history compaction API missing');
has(app,"p18Emit({type:'db-write',store:'history',key:'__prune__'",'history pruning does not propagate across tabs');
has(app,'if(state.history.length>MAX_HISTORY_ENTRIES)','live history memory bound missing');
has(app,"await db.trimHistory(MAX_HISTORY_ENTRIES)",'boot-time legacy history compaction missing');

for(const [needle,label] of [
  ['const p19Counters={','endurance counters missing'],
  ['function p19MemorySnapshot()','heap diagnostics missing'],
  ['function p19RuntimeSnapshot()','runtime diagnostics missing'],
  ['async function p19StorageSnapshot()','storage diagnostics missing'],
  ['async function p19CompactHistory(','history endurance hook missing'],
  ['async function p19Settle()','settle hook missing'],
  ['window.__PA_ENDURANCE__','endurance diagnostic surface missing'],
  ['p19Counters.timerStarts++','timer start instrumentation missing'],
  ['p19Counters.timerStops++','timer stop instrumentation missing'],
  ['p19Counters.pointerCleanups++','pointer cleanup instrumentation missing'],
  ['p19Counters.gameRenders++','game-render instrumentation missing'],
  ['p19Counters.routeRenders++','route-render instrumentation missing'],
  ['p19Counters.lifecycleSuspends++','lifecycle suspend instrumentation missing'],
  ['p19Counters.lifecycleResumes++','lifecycle resume instrumentation missing'],
  ["playerFreshLimit:256",'player-fuzz fresh cache bound missing'],
  ['syncSeenLimit:P18_SEEN_LIMIT','cross-tab seen-cache bound missing']
]) has(app,needle,label);

const appVersion=app.match(/const APP_VERSION = '([^']+)';/)?.[1];
const swVersion=sw.match(/const APP_VERSION = '([^']+)';/)?.[1];
const cacheVersion=Number(sw.match(/const CACHE_VERSION = 'v(\d+)';/)?.[1]||0);
assert.equal(swVersion,appVersion,'service worker app version mismatch');checks++;
assert.ok(cacheVersion>=31,'service worker regressed below Phase 19 cache generation');checks++;

console.log(JSON.stringify({pass:true,phase:19,checks},null,2));
