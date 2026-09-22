#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const workflowDir=new URL('../.github/workflows/',import.meta.url);
const workflowFiles=fs.readdirSync(workflowDir).filter(f=>/\.ya?ml$/.test(f)).sort();
const workflows=Object.fromEntries(workflowFiles.map(f=>[f,read('.github/workflows/'+f)]));
const bootstrap=workflows['bootstrap.yml'];
const maintenance=workflows['maintenance-baseline.yml'];
const generator=workflows['generator-stress.yml'];
const player=workflows['player-fuzz.yml'];
const endurance=workflows['endurance.yml'];
const dependabot=read('.github/dependabot.yml');
const requirements=read('.github/requirements-ci.txt').trim();
let checks=0;
const ok=(value,label)=>{assert.ok(value,label);checks++;};
const eq=(a,b,label)=>{assert.equal(a,b,label);checks++;};

eq(workflowFiles.join(','),'bootstrap.yml,endurance.yml,generator-stress.yml,maintenance-baseline.yml,player-fuzz.yml','unexpected workflow inventory drift');

const allWorkflowText=workflowFiles.map(f=>workflows[f]).join('\n');
const minimumActionMajors={
  'checkout':7,
  'setup-node':7,
  'setup-python':7,
  'upload-artifact':7,
  'configure-pages':6,
  'upload-pages-artifact':5,
  'deploy-pages':5,
};
for(const [name,min] of Object.entries(minimumActionMajors)){
  const refs=[...allWorkflowText.matchAll(new RegExp('actions/'+name+'@v(\\d+)','g'))].map(m=>Number(m[1]));
  ok(refs.length>0,'GitHub Action missing from workflows: '+name);
  ok(refs.every(v=>v>=min),'outdated GitHub Action major for '+name+': '+refs.join(','));
}

ok(/^playwright==\d+\.\d+\.\d+$/.test(requirements),'Playwright CI dependency is not exactly pinned');
ok(requirements==='playwright==1.63.0','Playwright baseline changed without CI hygiene review');

for(const [name,text] of Object.entries(workflows)){
  if(!text.includes('actions/setup-python@'))continue;
  const setupCount=(text.match(/actions\/setup-python@v\d+/g)||[]).length;
  const cacheCount=(text.match(/cache-dependency-path: \.github\/requirements-ci\.txt/g)||[]).length;
  eq(cacheCount,setupCount,name+' does not cache every Python toolchain setup');
  ok(!text.includes('pip install --disable-pip-version-check playwright'),name+' uses unpinned Playwright install');
  ok(text.includes('-r .github/requirements-ci.txt'),name+' does not install pinned CI requirements');
}

const topPermissions=bootstrap.match(/^permissions:\n([\s\S]*?)\n\nconcurrency:/m)?.[1]?.trim();
eq(topPermissions,'contents: read','bootstrap grants write/OIDC permissions globally');
ok(/deploy:[\s\S]*permissions:\n\s+contents: read\n\s+pages: write\n\s+id-token: write/.test(bootstrap),'deploy job lacks scoped Pages/OIDC permissions');

eq((bootstrap.match(/run: node scripts\/release-check\.mjs/g)||[]).length,1,'bootstrap duplicates cumulative static release-check');
for(const script of [
  'test-phase18-resilience.mjs',
  'test-phase19-endurance.mjs',
  'test-phase20-final-certification.mjs',
  'test-qol-contract.mjs',
  'test-maintenance-handoff.mjs',
  'test-docs-integrity.mjs'
]) ok(!bootstrap.includes('run: node scripts/'+script),'bootstrap re-runs static test already owned by release-check: '+script);

eq((maintenance.match(/run: node scripts\/release-check\.mjs/g)||[]).length,1,'maintenance workflow duplicates cumulative static release-check');
ok(!/run: node scripts\/test-(?:phase18|phase19|phase20|qol|maintenance|docs)/.test(maintenance),'maintenance workflow re-runs static tests outside release-check');

ok(/outputs:\n\s+runtime_changed:/.test(bootstrap),'release gate runtime-change output missing');
ok(/Detect production runtime changes/.test(bootstrap),'runtime deployment change detection missing');
ok(/deploy:[\s\S]*needs\.release-gate\.outputs\.runtime_changed == 'true'/.test(bootstrap),'docs/tooling-only pushes can still redeploy runtime');
ok(!/grep -q "const APP_VERSION/.test(bootstrap),'deployment smoke hard-codes app version instead of release manifest');
ok(!/grep -q "const CACHE_VERSION/.test(bootstrap),'deployment smoke hard-codes cache version instead of release manifest');

ok(/certification-summary:/.test(bootstrap),'stable certification-summary job missing');
ok(/certification-summary:[\s\S]*needs: \[release-gate, player-fuzz-gate, endurance-gate, recovery-gate, qol-gate, resilience-matrix\]/.test(bootstrap),'certification-summary does not aggregate every required gate');
ok(/deploy:[\s\S]*needs: \[release-gate, certification-summary\]/.test(bootstrap),'deploy bypasses stable certification summary');

const crons={
  generator:generator.match(/cron: '([^']+)'/)?.[1],
  player:player.match(/cron: '([^']+)'/)?.[1],
  endurance:endurance.match(/cron: '([^']+)'/)?.[1],
  maintenance:maintenance.match(/cron: '([^']+)'/)?.[1],
};
eq(crons.generator,'17 2 * * 0','generator deep-stress schedule drifted');
eq(crons.player,'17 4 * * 0','player deep-fuzz schedule drifted');
eq(crons.endurance,'17 6 * * 0','deep endurance schedule drifted');
eq(crons.maintenance,'41 5 * * 3','maintenance baseline schedule drifted');

for(const [name,text] of Object.entries({generator,player,endurance,maintenance})){
  ok(/concurrency:[\s\S]*cancel-in-progress: true/.test(text),name+' scheduled workflow lacks duplicate-run cancellation');
}

for(const [name,text] of Object.entries(workflows)){
  const uses=[...text.matchAll(/uses: actions\/upload-artifact@v\d+/g)];
  let from=0;
  for(let i=0;i<uses.length;i++){
    const idx=text.indexOf(uses[i][0],from);
    const fragment=text.slice(idx,idx+420);
    ok(fragment.includes('if-no-files-found: error'),name+' artifact upload can silently miss its report');
    from=idx+uses[i][0].length;
  }
}

ok(/package-ecosystem: "github-actions"/.test(dependabot),'Dependabot no longer tracks GitHub Actions');
ok(/package-ecosystem: "pip"/.test(dependabot),'Dependabot no longer tracks pinned Python CI dependencies');
ok(/groups:\n\s+github-actions:/.test(dependabot),'GitHub Actions updates are not grouped');
ok(/groups:\n\s+ci-python:/.test(dependabot),'Python CI updates are not grouped');

console.log(JSON.stringify({
  pass:true,
  workflows:workflowFiles,
  playwright:requirements,
  deepSchedules:crons,
  checks
},null,2));
