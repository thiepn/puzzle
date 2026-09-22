#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const base=(process.argv[2]||'').replace(/\/+$/,'');
if(!/^https?:\/\//.test(base))throw new Error('Usage: node scripts/verify-deployed-release.mjs <base-url>');
const expected=JSON.parse(fs.readFileSync(new URL('../release-manifest.json',import.meta.url),'utf8'));
const nonce=Date.now().toString(36);
async function get(name,binary=false){
  const res=await fetch(base+'/'+name+'?cert='+nonce,{cache:'no-store',redirect:'follow'});
  if(!res.ok)throw new Error(name+' returned HTTP '+res.status);
  return binary?Buffer.from(await res.arrayBuffer()):await res.text();
}
const remoteManifest=JSON.parse(await get('release-manifest.json'));
for(const key of ['product','version','phase','cacheVersion','databaseSchema','backupSchema','catalogGames','releaseChannel']){
  if(remoteManifest[key]!==expected[key])throw new Error('release-manifest mismatch for '+key);
}
if(JSON.stringify(remoteManifest.coreFiles)!==JSON.stringify(expected.coreFiles))throw new Error('release core file list mismatch');
const integrity=JSON.parse(await get('release-integrity.json'));
if(integrity.version!==expected.version||integrity.cacheVersion!==expected.cacheVersion)throw new Error('release integrity identity mismatch');
for(const name of expected.coreFiles){
  const body=await get(name,true),row=integrity.files?.[name];
  if(!row)throw new Error('integrity entry missing: '+name);
  const hash=crypto.createHash('sha256').update(body).digest('hex');
  if(hash!==row.sha256)throw new Error('deployed SHA-256 mismatch: '+name);
  if(body.length!==row.bytes)throw new Error('deployed byte-size mismatch: '+name);
}
const app=(await get('app.js')).toString();
const sw=(await get('sw.js')).toString();
const index=(await get('index.html')).toString();
const pwa=JSON.parse(await get('manifest.webmanifest'));
if(!app.includes("const APP_VERSION = '"+expected.version+"';"))throw new Error('deployed app version mismatch');
if(!app.includes("const BUILD_PHASE = '"+expected.phase+"';"))throw new Error('deployed build phase mismatch');
if(!sw.includes("const APP_VERSION = '"+expected.version+"';"))throw new Error('deployed service-worker version mismatch');
if(!sw.includes("const CACHE_VERSION = '"+expected.cacheVersion+"';"))throw new Error('deployed cache version mismatch');
if(!/Content-Security-Policy/.test(index)||!/default-src 'self'/.test(index))throw new Error('deployed CSP missing');
if(pwa.start_url!=='./#/home'||pwa.scope!=='./'||pwa.display!=='standalone')throw new Error('deployed PWA manifest mismatch');
console.log(JSON.stringify({pass:true,base,version:expected.version,coreFiles:expected.coreFiles.length},null,2));
