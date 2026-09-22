#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const exists=file=>fs.existsSync(new URL(file,root));

const app=read('app.js');
const sw=read('sw.js');
const release=JSON.parse(read('release-manifest.json'));
const status=JSON.parse(read('docs/RELEASE_STATUS.json'));
const baseline=read('docs/MAINTENANCE_BASELINE.md');
const handoff=read('docs/MAINTENANCE_HANDOFF.md');
const checklist=read('docs/RELEASE_CHECKLIST.md');
const rollback=read('docs/ROLLBACK.md');
const workflow=read('.github/workflows/bootstrap.yml');
const maintenanceWorkflow=read('.github/workflows/maintenance-baseline.yml');
let checks=0;

const ok=(value,label)=>{assert.ok(value,label);checks++;};
const eq=(a,b,label)=>{assert.equal(a,b,label);checks++;};

const appVersion=app.match(/const APP_VERSION = '([^']+)';/)?.[1];
const cacheVersion=sw.match(/const CACHE_VERSION = '([^']+)';/)?.[1];
const dbVersion=Number(app.match(/const DB_VERSION = (\d+);/)?.[1]||0);
const backupVersion=Number(app.match(/const BACKUP_SCHEMA_VERSION = (\d+);/)?.[1]||0);

ok(/^1\.14\.\d+$/.test(appVersion||''),'maintenance release left the supported 1.14.x line without an explicit baseline update');
const cacheNumber=Number(String(cacheVersion||'').replace(/^v/,''));
ok(Number.isInteger(cacheNumber)&&cacheNumber>=33,'maintenance cache generation regressed below v33');
eq(dbVersion,1,'maintenance baseline DB schema changed unexpectedly');
eq(backupVersion,1,'maintenance baseline backup schema changed unexpectedly');

eq(release.version,appVersion,'release manifest version does not match app version');
eq(release.cacheVersion,cacheVersion,'release manifest cache does not match service worker');
eq(release.databaseSchema,1,'release manifest DB schema changed');
eq(release.backupSchema,1,'release manifest backup schema changed');
eq(release.catalogGames,36,'catalog changed during maintenance handoff');

eq(status.productDevelopmentMode,'MAINTENANCE_BASELINE','project is not marked maintenance mode');
eq(status.maintenanceHandoff,'COMPLETE','maintenance handoff is not marked complete');
eq(status.maintenanceBaselineVersion,'1.14.0','maintenance status version mismatch');
eq(status.maintenanceBaselineCacheVersion,33,'maintenance status cache mismatch');

for(const file of [
  'docs/MAINTENANCE_BASELINE.md',
  'docs/MAINTENANCE_HANDOFF.md',
  'docs/RELEASE_CHECKLIST.md',
  'docs/ROLLBACK.md',
  'SECURITY.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/accessibility.yml',
  '.github/ISSUE_TEMPLATE/performance.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/workflows/maintenance-baseline.yml',
  '.github/dependabot.yml'
]) ok(exists(file),'maintenance handoff artifact missing: '+file);

for(const gate of [
  'release-gate',
  'player-fuzz-gate',
  'endurance-gate',
  'recovery-gate',
  'qol-gate',
  'resilience-matrix'
]) ok(workflow.includes(gate+':')||workflow.includes(gate),'required release gate missing: '+gate);

ok(/QoL keyboard\/mobile certification/.test(baseline),'maintenance baseline does not require QoL gate');
ok(/There is no “skip CI because urgent” path\./.test(handoff),'emergency maintenance path can bypass CI');
ok(/No red required gate may be bypassed/.test(checklist),'release checklist does not protect required gates');
ok(/Never reuse an old cache generation for new bytes\./.test(rollback),'rollback cache-safety rule missing');
ok(/schedule:\s*[\s\S]*cron:/.test(maintenanceWorkflow),'maintenance workflow is not scheduled');
ok(/test-qol-browser\.py/.test(maintenanceWorkflow),'maintenance workflow does not retain QoL certification');
ok(/test-recovery-browser\.py/.test(maintenanceWorkflow),'maintenance workflow does not retain recovery certification');
ok(/browser: \[chromium, firefox, webkit\]/.test(maintenanceWorkflow),'maintenance workflow lost cross-browser resilience');
ok(/package-ecosystem: "github-actions"/.test(read('.github/dependabot.yml')),'GitHub Actions dependency monitoring missing');

const pr=read('.github/PULL_REQUEST_TEMPLATE.md');
ok(/Storage \/ backup impact/.test(pr),'PR template lacks storage compatibility review');
ok(/Required gates/.test(pr),'PR template lacks gate checklist');
ok(/Rollback/.test(pr),'PR template lacks rollback section');

const bug=read('.github/ISSUE_TEMPLATE/bug_report.yml');
ok(/Reproduction steps/.test(bug)&&/Browser and version/.test(bug),'bug issue form lacks reproduction/browser evidence');
ok(/multiple Puzzle Arcade tabs/.test(bug),'bug issue form lacks multi-tab evidence');
ok(/Measurable symptom/.test(read('.github/ISSUE_TEMPLATE/performance.yml')),'performance form lacks measurable evidence requirement');
ok(/Accessibility problem/.test(read('.github/ISSUE_TEMPLATE/accessibility.yml')),'accessibility issue form missing');

console.log(JSON.stringify({
  pass:true,
  mode:status.productDevelopmentMode,
  baselineFloor:{appVersion:'1.14.0',cacheVersion:'v33',dbVersion:1,backupVersion:1,catalogGames:36},
  current:{appVersion,cacheVersion,dbVersion,backupVersion,catalogGames:release.catalogGames},
  checks
},null,2));
