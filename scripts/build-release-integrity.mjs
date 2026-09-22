#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir=path.resolve(process.argv[2]||'.');
const manifestPath=path.join(dir,'release-manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const files={};
for(const name of manifest.coreFiles||[]){
  const target=path.join(dir,name);
  if(!fs.existsSync(target))throw new Error('Missing release core file: '+name);
  const body=fs.readFileSync(target);
  files[name]={sha256:crypto.createHash('sha256').update(body).digest('hex'),bytes:body.length};
}
const integrity={
  product:manifest.product,
  version:manifest.version,
  cacheVersion:manifest.cacheVersion,
  generatedFrom:'staged-release',
  files
};
fs.writeFileSync(path.join(dir,'release-integrity.json'),JSON.stringify(integrity,null,2)+'\n');
console.log(JSON.stringify({pass:true,version:manifest.version,files:Object.keys(files).length},null,2));
