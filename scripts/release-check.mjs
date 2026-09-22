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
for(const f of ['app.js','word-dictionary.js','word-content.js','sw.js','scripts/validate-word-content.js','scripts/test-word-entry.mjs','scripts/test-accessibility-controls.mjs','scripts/test-phase10-integration.mjs','scripts/test-sensory-feedback.mjs','scripts/test-learning-onboarding.mjs','scripts/test-difficulty-quality.mjs','scripts/test-variety-quality.mjs','scripts/test-generator-stress.mjs','scripts/test-completion-quality.mjs','scripts/test-player-fuzz.mjs','scripts/test-phase18-resilience.mjs','scripts/test-phase19-endurance.mjs','scripts/test-phase20-final-certification.mjs','scripts/test-qol-contract.mjs','scripts/test-maintenance-handoff.mjs','scripts/build-release-integrity.mjs','scripts/verify-deployed-release.mjs']){const r=run('node',['--check',f]);must(r.status===0,`${f}: syntax failed: ${r.stderr.trim()}`);}
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
const enduranceTest=run('node',['scripts/test-phase19-endurance.mjs']);must(enduranceTest.status===0,`Phase 19 endurance regression failed: ${(enduranceTest.stderr||enduranceTest.stdout).trim()}`);
const finalCertTest=run('node',['scripts/test-phase20-final-certification.mjs']);must(finalCertTest.status===0,`Phase 20 final certification regression failed: ${(finalCertTest.stderr||finalCertTest.stdout).trim()}`);
const qolTest=run('node',['scripts/test-qol-contract.mjs']);must(qolTest.status===0,`QoL keyboard/mobile regression failed: ${(qolTest.stderr||qolTest.stdout).trim()}`);
const maintenanceTest=run('node',['scripts/test-maintenance-handoff.mjs']);must(maintenanceTest.status===0,`maintenance handoff regression failed: ${(maintenanceTest.stderr||maintenanceTest.stdout).trim()}`);
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
  '1.11.0':{cache:'v30',phase:'Cross-Browser, Offline/PWA & Multi-Tab Resilience'},
  '1.12.0':{cache:'v31',phase:'Performance, Memory & Long-Session Endurance'},
  '1.13.0':{cache:'v32',phase:'Final Production Hardening, Release Certification & Maintenance Baseline'},
  '1.14.0':{cache:'v33',phase:'QoL, Keyboard Navigation & Mobile UI Polish'}
};
must(!!allowed[version],`unexpected Wave 10 APP_VERSION: ${version || 'missing'}`);
const expected=allowed[version] || {cache:'__invalid__',phase:'Wave 10'};
must(/const DB_VERSION = 1;/.test(app),'IndexedDB schema version must be explicit');
must(app.includes(`const BUILD_PHASE = '${expected.phase}';`),'BUILD_PHASE does not match release identity');
if(['1.11.0','1.12.0','1.13.0','1.14.0'].includes(version)){
  must(/const P18_VERSION=18;/.test(app),'Phase 18 runtime contract missing');
  must(/new BroadcastChannel\('puzzle-arcade-resilience-v1'\)/.test(app),'Phase 18 BroadcastChannel transport missing');
  must(/addEventListener\('storage'/.test(app),'Phase 18 storage-event fallback missing');
  must(/navigator\.locks/.test(app)&&/P18_LOCK_PREFIX/.test(app),'Phase 18 write serialization missing');
  must(/const localVersion=Math\.max\(requestedVersion,Number\(active\.updatedAt\)\|\|0\);/.test(app),'Phase 18 queued-save revision refresh missing');
  must(/const remoteVersion=Number\(remote\?\.updatedAt\)\|\|0;/.test(app)&&/localVersion\+1,remoteVersion\+1/.test(app),'Phase 18 locked revisions are not globally monotonic');
  must(/const remoteNewer=!!\(remote&&\(remote\.updatedAt\|\|0\)>localVersion\);/.test(app),'Phase 18 newer remote-state detection missing');
  must(/const remoteDifferentSession=!!\(remote&&\(remote\.seed!==active\.seed\|\|remote\.difficulty!==active\.difficulty\)\);/.test(app),'Phase 18 different-session conflict detection missing');
  must(/if\(\(remoteDifferentSession\|\|remoteNewer\)&&!replaceExisting\)/.test(app),'Phase 18 stale-write guard missing');
  must(/function p18MarkReplacementIntent\(gameId,seed\)/.test(app),'Phase 18 replacement intent marker missing');
  must(/navigation\?\.type==='reload'\|\|navigation\?\.type==='back_forward'/.test(app),'Phase 18 stale reload suppression missing');
  must(/addEventListener\('hashchange'/.test(app)&&/p18MarkReplacementIntent\(parts\[1\],seed\)/.test(app),'Phase 18 explicit seeded hash navigation missing');
  must(/saveActive\(active,\{replaceExisting:!previous\|\|damaged\|\|outdated\|\|explicitReplacement\}\)/.test(app),'Phase 18 intent-gated replacement path missing');
  must(/const differentSession=remote\.seed!==current\.seed\|\|remote\.difficulty!==current\.difficulty;/.test(app),'Phase 18 durable session-identity adoption missing');
  must(/pageshow/.test(app)&&/p18ResyncAfterRestore/.test(app),'Phase 18 BFCache resync missing');
  must(/SKIP_WAITING/.test(app)&&/controllerchange/.test(app),'Phase 18 controlled PWA upgrade missing');
}
if(['1.12.0','1.13.0','1.14.0'].includes(version)){
  must(/const P19_VERSION=19;/.test(app),'Phase 19 runtime contract missing');
  must(/const MAX_HISTORY_ENTRIES = 10000;/.test(app),'Phase 19 history bound missing');
  must(/async trimHistory\(limit=MAX_HISTORY_ENTRIES\)/.test(app),'Phase 19 history compaction missing');
  must(/window\.__PA_ENDURANCE__/.test(app),'Phase 19 endurance diagnostics missing');
  must(/p19Counters\.timerStarts\+\+/.test(app)&&/p19Counters\.timerStops\+\+/.test(app),'Phase 19 timer instrumentation missing');
  must(/p19Counters\.pointerCleanups\+\+/.test(app),'Phase 19 cleanup instrumentation missing');
  must(/p19Counters\.routeRenders\+\+/.test(app)&&/p19Counters\.gameRenders\+\+/.test(app),'Phase 19 render instrumentation missing');
  must(/await db\.trimHistory\(MAX_HISTORY_ENTRIES\)/.test(app),'Phase 19 boot history compaction missing');
}
if(['1.13.0','1.14.0'].includes(version)){
  must(/const P20_VERSION=20;/.test(app),'Phase 20 runtime contract missing');
  must(/const BACKUP_SCHEMA_VERSION = 1;/.test(app),'Phase 20 backup schema missing');
  must(/const MAX_BACKUP_BYTES = 16 \* 1024 \* 1024;/.test(app),'Phase 20 backup size ceiling missing');
  must(/async replaceAll\(snapshot\)/.test(app),'Phase 20 atomic replacement missing');
  must(/async function p20CreateBackup\(\)/.test(app),'Phase 20 backup creation missing');
  must(/async function p20PrepareBackupText\(text\)/.test(app),'Phase 20 backup validation missing');
  must(/async function p20ApplyPreparedBackup\(prepared\)/.test(app),'Phase 20 backup restore missing');
  must(/window\.__PA_RECOVERY__/.test(app),'Phase 20 recovery certification surface missing');
  must(/p18Emit\(\{type:'restore'\}\)/.test(app),'Phase 20 cross-tab restore propagation missing');
  must(/data-action="backup-export"/.test(app)&&/data-action="backup-import"/.test(app),'Phase 20 backup UI missing');
  const releaseManifest=JSON.parse(read('release-manifest.json'));
  must(releaseManifest.version===version,'release-manifest version mismatch');
  must(releaseManifest.cacheVersion===expected.cache,'release-manifest cache mismatch');
  must(releaseManifest.databaseSchema===1&&releaseManifest.backupSchema===1,'release-manifest schema mismatch');
  must(releaseManifest.catalogGames===36,'release-manifest catalog mismatch');
  must(Array.isArray(releaseManifest.coreFiles)&&releaseManifest.coreFiles.length===10,'release-manifest core-file list incomplete');
  must(fs.existsSync(path.join(ROOT,'SECURITY.md')),'SECURITY.md missing');
  must(fs.existsSync(path.join(ROOT,'docs/MAINTENANCE_BASELINE.md')),'maintenance baseline missing');
  must(fs.existsSync(path.join(ROOT,'docs/PHASE20_FINAL_CERTIFICATION.md')),'Phase 20 final certification document missing');
}
if(version==='1.14.0'){
  must(/function qolLatestActive\(\)/.test(app),'QoL latest-active helper missing');
  must(/function qolCommandItems\(\)/.test(app),'QoL quick switcher missing');
  must(/function qolMoveFocus\(current,key,items\)/.test(app),'QoL spatial keyboard navigation missing');
  must(/e\.key\.toLowerCase\(\)==='k'/.test(app)&&/e\.key==='\/'/.test(app),'QoL search shortcuts missing');
  must(/const routes=\{p:'home',l:'learn',s:'stats',o:'settings'\}/.test(app),'QoL G chord routes missing');
  must(/if\(key==='c'\)/.test(app)&&/if\(key==='r'\)/.test(app),'QoL quick resume/random shortcuts missing');
  must(/QoL release 1\.14/.test(read('styles.css')),'QoL mobile style baseline missing');
  must(/class="nav-icon"/.test(index),'QoL mobile nav icons missing');
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
notes.push(`content errors: ${contentSummary?.errors ?? 'unknown'}`);notes.push('playable games: 36');notes.push(`service worker: ${expected.cache}`);notes.push('Phase 13 difficulty/quality contract: enabled');notes.push('Phase 14 variety/anti-repetition contract: enabled');notes.push('Phase 15 generator robustness contract: enabled');notes.push('Phase 16 completion certification contract: enabled');notes.push('Phase 17 player state-fuzz contract: enabled');notes.push('Phase 18 cross-browser/PWA/multi-tab resilience contract: enabled');notes.push('Phase 19 performance/memory/endurance contract: enabled');notes.push('Phase 20 recovery/deployment/maintenance certification contract: enabled');notes.push('QoL keyboard/mobile certification contract: enabled');notes.push('Maintenance handoff contract: enabled');
const playTest=run('node',['scripts/test-play-experience.mjs']);must(playTest.status===0,`play-experience regression tests failed: ${(playTest.stderr||playTest.stdout).trim()}`);
const out={phase:expected.phase,appVersion:version,errors,notes,pass:errors.length===0};console.log(JSON.stringify(out,null,2));process.exit(errors.length?1:0);
