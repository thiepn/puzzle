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
const core=['index.html','styles.css','app.js','word-dictionary.js','word-content.js','manifest.webmanifest','sw.js','icon.svg','icon-192.png','icon-512.png'];
for(const f of core) must(fs.existsSync(path.join(ROOT,f)),`missing core file: ${f}`);
const run=(cmd,args)=>spawnSync(cmd,args,{cwd:ROOT,encoding:'utf8'});
for(const f of ['app.js','word-dictionary.js','word-content.js','sw.js','scripts/validate-word-content.js','scripts/test-word-entry.mjs','scripts/test-accessibility-controls.mjs','scripts/test-phase10-integration.mjs','scripts/test-sensory-feedback.mjs','scripts/test-learning-onboarding.mjs','scripts/test-difficulty-quality.mjs','scripts/test-variety-quality.mjs','scripts/test-generator-stress.mjs','scripts/test-completion-quality.mjs','scripts/test-player-fuzz.mjs','scripts/test-phase18-resilience.mjs']){const r=run('node',['--check',f]);must(r.status===0,`${f}: syntax failed: ${r.stderr.trim()}`);}
const content=run('node',['scripts/validate-word-content.js']);must(content.status===0,`word content validation failed: ${(content.stderr||content.stdout).trim()}`);
const swTest=run('node',['scripts/test-service-worker.mjs']);must(swTest.status===0,`service worker tests failed: ${(swTest.stderr||swTest.stdout).trim()}`);
const wordTest=run('node',['scripts/test-word-entry.mjs']);must(wordTest.status===0,`word-entry regression tests failed: ${(wordTest.stderr||wordTest.stdout).trim()}`);
const accessibilityTest=run('node',['scripts/test-accessibility-controls.mjs']);must(accessibilityTest.status===0,`accessibility/control regression tests failed: ${(accessibilityTest.stderr||accessibilityTest.stdout).trim()}`);
const integrationTest=run('node',['scripts/test-phase10-integration.mjs']);must(integrationTest.status===0,`Phase 10 integration tests failed: ${(integrationTest.stderr||integrationTest.stdout).trim()}`);
const sensoryTest=run('node',['scripts/test-sensory-feedback.mjs']);must(sensoryTest.status===0,`sensory feedback regression tests failed: ${(sensoryTest.stderr||sensoryTest.stdout).trim()}`);
const learningTest=run('node',['scripts/test-learning-onboarding.mjs']);must(learningTest.status===0,`learning/onboarding regression tests failed: ${(learningTest.stderr||learningTest.stdout).trim()}`);
const difficultyTest=run('node',['scripts/test-difficulty-quality.mjs']);must(difficultyTest.status===0,`difficulty/quality regression tests failed: ${(difficultyTest.stderr||difficultyTest.stdout).trim()}`);
const varietyTest=run('node',['scripts/test-variety-quality.mjs']);must(varietyTest.status===0,`variety/anti-repetition regression tests failed: ${(varietyTest.stderr||varietyTest.stdout).trim()}`);
const generatorStressTest=run('node',['scripts/test-generator-stress.mjs']);must(generatorStressTest.status===0,`generator stress contract regression failed: ${(generatorStressTest.stderr||generatorStressTest.stdout).trim()}`);
const completionTest=run('node',['scripts/test-completion-quality.mjs']);must(completionTest.status===0,`completion certification regression failed: ${(completionTest.stderr||completionTest.stdout).trim()}`);
const playerFuzzTest=run('node',['scripts/test-player-fuzz.mjs']);must(playerFuzzTest.status===0,`player state-fuzz contract regression failed: ${(playerFuzzTest.stderr||playerFuzzTest.stdout).trim()}`);
const resilienceTest=run('node',['scripts/test-phase18-resilience.mjs']);must(resilienceTest.status===0,`Phase 18 resilience regression failed: ${(resilienceTest.stderr||resilienceTest.stdout).trim()}`);
let contentSummary=null;try{contentSummary=JSON.parse(content.stdout)}catch{}
const app=read('app.js'), index=read('index.html'), sw=read('sw.js'), manifest=JSON.parse(read('manifest.webmanifest')), readme=read('README.md');
const version=app.match(/const APP_VERSION = '([^']+)';/)?.[1] || '';
const allowed={
  '1.0.0-rc.1':{cache:'v16',phase:'Wave 10 RC1'},
  '1.0.0':{cache:'v17',phase:'Wave 10 Stable'},
  '1.0.1':{cache:'v18',phase:'Audited Maintenance Build'},
  '1.0.2':{cache:'v19',phase:'Expanded Lexicon & Hint Fix'},
  '1.1.0':{cache:'v20',phase:'Play Experience'},
  '1.2.0':{cache:'v21',phase:'Accessibility, Controls & Device Polish'},
  '1.3.0':{cache:'v22',phase:'Integration, Final Certification & Ship'},
  '1.4.0':{cache:'v23',phase:'Audio, Haptics & Sensory Feedback'},
  '1.5.0':{cache:'v24',phase:'Onboarding, Tutorials & Learn Mode'},
  '1.6.0':{cache:'v25',phase:'Difficulty Calibration & Puzzle Quality'},
  '1.7.0':{cache:'v26',phase:'Variety, Novelty & Anti-Repetition'},
  '1.8.0':{cache:'v27',phase:'Generator Robustness, Stress Testing & Long-Run Reliability'},
  '1.9.0':{cache:'v28',phase:'Solvability, Hint Correctness & Completion Certification'},
  '1.10.0':{cache:'v29',phase:'Real Player Simulation, State Fuzzing & Interaction Sequence Reliability'},
  '1.11.0':{cache:'v30',phase:'Cross-Browser, Offline/PWA & Multi-Tab Resilience'}
};
must(!!allowed[version],`unexpected Wave 10 APP_VERSION: ${version || 'missing'}`);
const expected=allowed[version] || {cache:'__invalid__',phase:'Wave 10'};
must(/const DB_VERSION = 1;/.test(app),'IndexedDB schema version must be explicit');
must(app.includes(`const BUILD_PHASE = '${expected.phase}';`),'BUILD_PHASE does not match release identity');
if(version==='1.11.0'){
  must(/const P18_VERSION=18;/.test(app),'Phase 18 runtime contract missing');
  must(/new BroadcastChannel\('puzzle-arcade-resilience-v1'\)/.test(app),'Phase 18 BroadcastChannel transport missing');
  must(/addEventListener\('storage'/.test(app),'Phase 18 storage-event fallback missing');
  must(/navigator\.locks/.test(app)&&/P18_LOCK_PREFIX/.test(app),'Phase 18 write serialization missing');
  must(/const localVersion=Math\.max\(requestedVersion,Number\(active\.updatedAt\)\|\|0\);/.test(app),'Phase 18 queued-save revision refresh missing');
  must(/if\(remote&&\(remote\.updatedAt\|\|0\)>localVersion\)/.test(app),'Phase 18 stale-write guard missing');
  must(/pageshow/.test(app)&&/p18ResyncAfterRestore/.test(app),'Phase 18 BFCache resync missing');
  must(/SKIP_WAITING/.test(app)&&/controllerchange/.test(app),'Phase 18 controlled PWA upgrade missing');
}
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
notes.push(`content errors: ${contentSummary?.errors ?? 'unknown'}`);notes.push('playable games: 36');notes.push(`service worker: ${expected.cache}`);notes.push('Phase 13 difficulty/quality contract: enabled');notes.push('Phase 14 variety/anti-repetition contract: enabled');notes.push('Phase 15 generator robustness contract: enabled');notes.push('Phase 16 completion certification contract: enabled');notes.push('Phase 17 player state-fuzz contract: enabled');notes.push('Phase 18 cross-browser/PWA/multi-tab resilience contract: enabled');
const playTest=run('node',['scripts/test-play-experience.mjs']);must(playTest.status===0,`play-experience regression tests failed: ${(playTest.stderr||playTest.stdout).trim()}`);
const out={phase:expected.phase,appVersion:version,errors,notes,pass:errors.length===0};console.log(JSON.stringify(out,null,2));process.exit(errors.length?1:0);
