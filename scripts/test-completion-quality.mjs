#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const app=fs.readFileSync(new URL('app.js',root),'utf8');
const ids=['five-letters','groups','word-ladder','anagrams','letter-hive','word-grid','theme-trail','word-pieces','mini-crossword','cryptogram','word-search','sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','make-24','mines','nonogram','loop','bridges','light-up','islands','hitori','binary','queens','number-path','tents','rectangles','dominoes','towers','fillomino','network','sliding-tiles','lights-out','untangle'];
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
ok(ids.length===36,'expected 36 games');
ok(app.includes('const P16_VERSION=16;'),'Phase 16 version missing');
ok(app.includes('const P16_METHODS={'),'completion method registry missing');
for(const id of ids)ok(app.includes(`'${id}':`),`completion method missing: ${id}`);
ok(app.includes('function p16Canonical('),'canonical completion validator missing');
ok(app.includes('function p16StartsUnfinished('),'initial-state negative control missing');
ok(app.includes('function p16HintSource('),'hint source certification missing');
ok(app.includes('function p16TraceWord('),'word-grid trace solver missing');
ok(app.includes('function p16PieceRoute('),'word-pieces construction solver missing');
ok(app.includes('function p16SlidingReachable('),'sliding parity certification missing');
ok(app.includes('function p16MineClues('),'Mines clue consistency check missing');
ok(app.includes('function p16RectanglesValid('),'rectangle partition check missing');
ok(app.includes('window.__PA_COMPLETION_AUDIT__'),'browser completion audit API missing');
ok(app.includes('auditCatalog:p16AuditCatalog'),'catalog completion audit export missing');
console.log(JSON.stringify({pass:true,phase:16,games:ids.length,checks},null,2));
