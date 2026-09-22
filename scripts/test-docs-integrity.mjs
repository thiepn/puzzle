#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const exists=file=>fs.existsSync(new URL(file,root));

const readme=read('README.md');
const app=read('app.js');
const sw=read('sw.js');
const release=JSON.parse(read('release-manifest.json'));
let checks=0;
const ok=(value,label)=>{assert.ok(value,label);checks++;};

const appVersion=app.match(/const APP_VERSION = '([^']+)';/)?.[1];
const cacheVersion=sw.match(/const CACHE_VERSION = '([^']+)';/)?.[1];

ok(readme.includes(`**Current release: ${appVersion} · ${release.phase} · PWA cache ${cacheVersion}**`),
  'README current-release line does not match runtime/release manifest');

const refs=[...new Set(
  [...readme.matchAll(/\`((?:docs|scripts|content)\/[A-Za-z0-9_./-]+|(?:SECURITY|THIRD_PARTY_NOTICES)\.md|release-manifest\.json)\`/g)]
    .map(m=>m[1])
)];
for(const ref of refs)ok(exists(ref),'README references missing repository file: '+ref);

for(const stale of [
  'current release uses v21',
  'The current build passed 10,800',
  'docs/PRODUCTION_CONFIG.md',
  'docs/SECURITY.md',
  'docs/PRIVACY.md',
  'docs/STORAGE_SCHEMA.md',
  'docs/DEPLOYMENT.md',
  'docs/THIRD_PARTY_NOTICES.md',
  'scripts/build-standalone.py',
  'cd endless-puzzle-arcade'
]) ok(!readme.includes(stale),'stale README maintenance reference remains: '+stale);

ok(readme.includes('cd puzzle\npython -m http.server 8080'),'local run instructions do not use current repository folder');
ok(readme.includes('formal maintenance mode'),'README no longer states maintenance mode');
ok(readme.includes('Current operational documentation:'),'README maintenance operations index missing');

console.log(JSON.stringify({
  pass:true,
  release:{appVersion,cacheVersion},
  checkedReferences:refs.length,
  checks
},null,2));
