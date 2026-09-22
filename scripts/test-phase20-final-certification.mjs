#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const exists=file=>fs.existsSync(new URL(file,root));
const app=read('app.js');
const sw=read('sw.js');
const index=read('index.html');
const styles=read('styles.css');
const pwa=JSON.parse(read('manifest.webmanifest'));
const release=JSON.parse(read('release-manifest.json'));
const workflow=read('.github/workflows/bootstrap.yml');
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};

const appVersion=app.match(/const APP_VERSION = '([^']+)';/)?.[1];
const buildPhase=app.match(/const BUILD_PHASE = '([^']+)';/)?.[1];
const swVersion=sw.match(/const APP_VERSION = '([^']+)';/)?.[1];
const cacheNumber=Number(sw.match(/const CACHE_VERSION = 'v(\d+)';/)?.[1]||0);
assert.match(appVersion||'',/^\d+\.\d+\.\d+$/,'release app version missing');checks++;
assert.ok(buildPhase,'release build phase missing');checks++;
has(app,'const P20_VERSION=20;','Phase 20 runtime version missing');
has(app,'const BACKUP_SCHEMA_VERSION = 1;','backup schema missing');
has(app,"const BACKUP_KIND = 'puzzle-arcade-backup';",'backup kind missing');
has(app,'const MAX_BACKUP_BYTES = 16 * 1024 * 1024;','backup size ceiling missing');
has(app,'async replaceAll(snapshot)','atomic replacement API missing');
has(app,"p18Emit({type:'restore'})",'cross-tab restore signal missing');
has(app,"payload.type==='reset'||payload.type==='restore'",'cross-tab restore receiver missing');
has(app,'async function p20CreateBackup()','backup creation missing');
has(app,'async function p20PrepareBackupText(text)','backup validation missing');
has(app,'async function p20ApplyPreparedBackup(prepared)','backup application missing');
has(app,'function p20Checksum(payload)','backup checksum missing');
has(app,"['__proto__','constructor','prototype'].includes(key)",'unsafe backup-key rejection missing');
has(app,'root.checksum!==p20Checksum(root.payload)','checksum validation missing');
has(app,'root.databaseSchema!==DB_VERSION','database-schema fail-closed check missing');
has(app,'root.kind!==BACKUP_KIND||root.schemaVersion!==BACKUP_SCHEMA_VERSION','backup-schema fail-closed check missing');
has(app,'game.generatorVersion&&raw?.puzzle?.generatorVersion!==game.generatorVersion','generator compatibility check missing');
has(app,'window.__PA_RECOVERY__','recovery certification surface missing');
has(app,'data-action="backup-export"','backup export UI missing');
has(app,'data-action="backup-import"','backup import UI missing');
has(app,'data-action="clear-data"','reset UI missing');

assert.equal(release.product,'Puzzle Arcade');checks++;
assert.equal(release.version,appVersion,'release-manifest version mismatch');checks++;
assert.equal(release.phase,buildPhase,'release-manifest phase mismatch');checks++;
assert.equal(release.cacheVersion,'v'+cacheNumber,'release-manifest cache mismatch');checks++;
assert.ok(cacheNumber>=32,'service worker regressed below Phase 20 cache generation');checks++;
assert.equal(release.databaseSchema,1);checks++;
assert.equal(release.backupSchema,1);checks++;
assert.equal(release.catalogGames,36);checks++;
assert.equal(release.releaseChannel,'stable');checks++;
assert.ok(Array.isArray(release.coreFiles)&&release.coreFiles.length===10,'release core-file manifest incomplete');checks++;
for(const file of release.coreFiles){assert.ok(exists(file),'release core file missing: '+file);checks++;}

assert.equal(swVersion,appVersion,'service worker version mismatch');checks++;

assert.equal(pwa.id,'./');checks++;
assert.equal(pwa.scope,'./');checks++;
assert.equal(pwa.start_url,'./#/home');checks++;
assert.equal(pwa.display,'standalone');checks++;

has(index,'Content-Security-Policy','CSP meta missing');
for(const directive of ["default-src 'self'","script-src 'self'","connect-src 'self'","worker-src 'self'","object-src 'none'","base-uri 'none'"]){
  has(index,directive,'CSP directive missing: '+directive);
}
assert.ok(!/(?:src|href)\s*=\s*["']https?:\/\//i.test(index),'remote runtime asset found in index.html');checks++;
assert.ok(!/@import\s+(?:url\()?["']?https?:\/\//i.test(styles),'remote stylesheet import found');checks++;
assert.ok(!/\b(?:eval\s*\(|new\s+Function\s*\()/.test(app),'dynamic code execution found in production app');checks++;

for(const file of [
  'SECURITY.md',
  'docs/MAINTENANCE_BASELINE.md',
  'docs/PHASE20_FINAL_CERTIFICATION.md',
  'scripts/test-recovery-browser.py',
  'scripts/build-release-integrity.mjs',
  'scripts/verify-deployed-release.mjs',
  '.github/workflows/maintenance-baseline.yml',
  '.github/dependabot.yml'
]){
  assert.ok(exists(file),'Phase 20 certification file missing: '+file);checks++;
}

has(workflow,'recovery-gate:','release workflow recovery gate missing');
has(workflow,'node scripts/build-release-integrity.mjs dist','deploy integrity generation missing');
has(workflow,'node scripts/verify-deployed-release.mjs "$base"','live deployed integrity verification missing');
assert.match(workflow,/certification-summary:[\s\S]*needs: \[release-gate, player-fuzz-gate, endurance-gate, recovery-gate, qol-gate, resilience-matrix\]/,'certification summary does not require every production gate');checks++;
assert.match(workflow,/deploy:[\s\S]*needs: \[release-gate, certification-summary\]/,'deployment does not require stable certification summary');checks++;

console.log(JSON.stringify({pass:true,phase:20,checks,version:release.version,coreFiles:release.coreFiles.length},null,2));
