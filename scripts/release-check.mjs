#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const errors=[]; const notes=[];
const must=(ok,msg)=>{if(!ok)errors.push(msg)};
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const core=['index.html','styles.css','app.js','word-content.js','manifest.webmanifest','sw.js','icon.svg','icon-192.png','icon-512.png'];
for(const f of core) must(fs.existsSync(path.join(ROOT,f)),`missing core file: ${f}`);
const run=(cmd,args)=>spawnSync(cmd,args,{cwd:ROOT,encoding:'utf8'});
for(const f of ['app.js','word-content.js','sw.js','scripts/validate-word-content.js']){const r=run('node',['--check',f]);must(r.status===0,`${f}: syntax failed: ${r.stderr.trim()}`);}
const content=run('node',['scripts/validate-word-content.js']);must(content.status===0,`word content validation failed: ${(content.stderr||content.stdout).trim()}`);
const swTest=run('node',['scripts/test-service-worker.mjs']);must(swTest.status===0,`service worker tests failed: ${(swTest.stderr||swTest.stdout).trim()}`);
let contentSummary=null;try{contentSummary=JSON.parse(content.stdout)}catch{}
const app=read('app.js'), index=read('index.html'), sw=read('sw.js'), manifest=JSON.parse(read('manifest.webmanifest')), readme=read('README.md');
const version=app.match(/const APP_VERSION = '([^']+)';/)?.[1] || '';
const allowed={
  '1.0.0-rc.1':{cache:'v16',phase:'Wave 10 RC1'},
  '1.0.0':{cache:'v17',phase:'Wave 10 Stable'},
  '1.0.1':{cache:'v18',phase:'Audited Maintenance Build'}
};
must(!!allowed[version],`unexpected Wave 10 APP_VERSION: ${version || 'missing'}`);
const expected=allowed[version] || {cache:'__invalid__',phase:'Wave 10'};
must(/const DB_VERSION = 1;/.test(app),'IndexedDB schema version must be explicit');
must(!/console\.(log|debug|warn|error)\s*\(/.test(app),'production app.js contains console logging');
must(!/\beval\s*\(/.test(app),'production app.js contains global eval-like call');
must(!/new\s+Function\s*\(/.test(app),'production app.js contains new Function');
must(!/\b(TODO|FIXME|HACK|TEMP|XXX)\b/.test(app),'production app.js contains release TODO marker');
must(!/Foundation build/i.test(app+readme),'stale Foundation build copy remains');
must(/sanitizeSharedSeed/.test(app)&&/MAX_SHARED_SEED_LENGTH = 96/.test(app),'shared seed input is not bounded');
must(/normalizeDifficulty/.test(app),'shared difficulty input is not normalized');
const seedFn=app.match(/function sanitizeSharedSeed\(value\)\{[^}]+\}/)?.[0];
must(!!seedFn,'sanitizeSharedSeed function missing');
if(seedFn){const box={};vm.createContext(box);vm.runInContext(`const MAX_SHARED_SEED_LENGTH=96; ${seedFn}; this.clean=sanitizeSharedSeed`,box);must(box.clean('abc-123_X.y~z')==='abc-123_X.y~z','safe shared seed rejected');must(box.clean('<script>')===null,'HTML-like shared seed accepted');must(box.clean('a'.repeat(97))===null,'oversized shared seed accepted');must(box.clean('white space')===null,'whitespace shared seed accepted');}
must(/Content-Security-Policy/.test(index),'index.html missing CSP');
must(!/<script(?![^>]+src=)[^>]*>/i.test(index),'index.html contains inline script despite strict CSP');
must(/script-src 'self'/.test(index),'CSP does not restrict scripts to self');
must(!/<script[^>]+src=["']https?:/i.test(index),'external script reference in index.html');
must(!/<link[^>]+href=["']https?:/i.test(index),'external stylesheet/resource link in index.html');
must(manifest.id==='./','manifest id must be stable ./');
must(manifest.display==='standalone','manifest display must be standalone');
must(manifest.start_url==='./#/home','manifest start_url unexpected');
must(Array.isArray(manifest.icons)&&manifest.icons.some(i=>i.sizes==='192x192')&&manifest.icons.some(i=>i.sizes==='512x512'),'manifest install icons incomplete');
must(/CACHE_FAMILY = 'puzzle-arcade-core-';/.test(sw),'service worker cache family missing');
must(/encodeURIComponent\(SCOPE.pathname\)/.test(sw),'service worker cache is not installation-scope isolated');
must(/startsWith\(CACHE_PREFIX\)/.test(sw),'service worker must only delete Puzzle Arcade caches');
must(/isShellNavigation/.test(sw),'service worker navigation fallback is not scoped to app shell');
must(sw.includes(expected.cache),`service worker must use ${expected.cache} for ${version}`);
const playableMatch=app.match(/const playableIds = \[([^\]]+)\]/s);must(!!playableMatch,'playableIds missing');
if(playableMatch){const ids=[...playableMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);must(ids.length===36,`expected 36 playable games, got ${ids.length}`);must(new Set(ids).size===36,'duplicate playable game id');}
const badNames=[];function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const fp=path.join(dir,ent.name),rel=path.relative(ROOT,fp);if(ent.isDirectory()){if(['node_modules','__pycache__','.git','test-results','dist'].includes(ent.name))continue;walk(fp);} else if(/(?:^|\/)(?:backup|tmp|debug|harness)(?:[-_.]|$)|\.bak$/i.test(rel))badNames.push(rel);}}walk(ROOT);must(badNames.length===0,`release tree contains debug/backup residue: ${badNames.join(', ')}`);
const prodFiles=['app.js','styles.css','index.html','sw.js'];for(const f of prodFiles){const t=read(f);const urls=[...t.matchAll(/https?:\/\/[^\s'"<>]+/g)].map(m=>m[0]).filter(u=>!u.includes('www.w3.org/2000/svg'));must(urls.length===0,`${f} contains unexpected external URL: ${urls.join(', ')}`);}
notes.push(`content errors: ${contentSummary?.errors ?? 'unknown'}`);notes.push('playable games: 36');notes.push(`service worker: ${expected.cache}`);
const out={phase:expected.phase,appVersion:version,errors,notes,pass:errors.length===0};console.log(JSON.stringify(out,null,2));process.exit(errors.length?1:0);
