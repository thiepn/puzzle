#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const app=fs.readFileSync(new URL('app.js',root),'utf8');
const ids=["five-letters","groups","word-ladder","anagrams","letter-hive","word-grid","theme-trail","word-pieces","mini-crossword","cryptogram","word-search","sudoku","killer-sudoku","kakuro","unequal","arithmetic-cages","make-24","mines","nonogram","loop","bridges","light-up","islands","hitori","binary","queens","number-path","tents","rectangles","dominoes","towers","fillomino","network","sliding-tiles","lights-out","untangle"];
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const methodStart=app.indexOf('const P13_METHODS={');
const methodEnd=app.indexOf('};',methodStart);
ok(methodStart>=0&&methodEnd>methodStart,'Phase 13 method registry missing');
const methods=app.slice(methodStart,methodEnd);
for(const id of ids)ok(methods.includes("'"+id+"'"),'difficulty method missing '+id);
ok(ids.length===36,'expected 36 games');
ok(/const APP_VERSION = '[0-9]+[.][0-9]+[.][0-9]+';/.test(app),'release version missing');
ok(app.includes('const P13_VERSION=13;'),'Phase 13 runtime identity missing');
ok(app.includes('function p13Signal('),'property-based difficulty signal engine missing');
ok(app.includes('function p13ShapeProblems('),'quality/triviality gate missing');
ok(app.includes('P13_UNIQUENESS_REQUIRED'),'uniqueness acceptance contract missing');
ok(app.includes('function p13TierPass('),'tier acceptance gate missing');
ok(app.includes('secondaryReasoningSignal'),'non-size reasoning signal missing');
ok(app.includes('sourceSeed=attempt===0?seed'),'backward-compatible primary-seed generation missing');
ok(app.includes("seed+':p13:'+attempt"),'deterministic fallback generation missing');
ok(app.includes('window.__PA_DIFFICULTY_AUDIT__'),'browser certification API missing');
ok(app.includes('auditCatalog:p13AuditCatalog'),'catalog audit export missing');
ok(app.includes("id==='mines'"),'deferred Mines certification missing');
ok(app.includes("mines.build=function(a,first)"),'post-first-click Mines certification missing');

console.log(JSON.stringify({pass:true,checks,games:ids.length,phase:13},null,2));
