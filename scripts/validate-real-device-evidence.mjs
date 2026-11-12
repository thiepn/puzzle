#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args=process.argv.slice(2);
const allowPending=args.includes('--allow-pending');
const file=args.find(a=>!a.startsWith('--'));
if(!file){
  console.error('Usage: node scripts/validate-real-device-evidence.mjs <evidence.json> [--allow-pending]');
  process.exit(2);
}

const fail=[];
const must=(ok,msg)=>{if(!ok)fail.push(msg);};
let root;
try{root=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));}catch(error){
  console.error(JSON.stringify({pass:false,errors:['Evidence file is not readable valid JSON: '+error.message]},null,2));
  process.exit(1);
}

const statuses=new Set(['pass','fail','unsupported','not-tested']);
const requiredChecks=['install','standaloneLaunch','installedUpdate','offlineRelaunch','touch','rotation','safeAreas','backupExport','backupRestore','screenReader','haptics'];

must(root?.schemaVersion===1,'schemaVersion must be 1');
must(root?.product==='Puzzle Arcade','product must be Puzzle Arcade');
must(typeof root?.appVersion==='string'&&root.appVersion.length>0,'appVersion missing');
must(typeof root?.cacheVersion==='string'&&root.cacheVersion.length>0,'cacheVersion missing');
must(Array.isArray(root?.devices)&&root.devices.length>=2,'devices must contain at least Android and iOS/iPadOS evidence');

if(!allowPending){
  const time=Date.parse(root?.testedAt);
  must(Number.isFinite(time),'testedAt must be a real ISO-8601 timestamp');
  must(typeof root?.tester==='string'&&root.tester.trim()&&root.tester!=='REPLACE','tester must identify the manual test run');
}

const ids=new Set();
let android=0,ios=0;
for(const [index,device] of (root.devices||[]).entries()){
  const prefix='devices['+index+']';
  must(typeof device?.id==='string'&&device.id.length>0,prefix+'.id missing');
  if(device?.id){
    must(!ids.has(device.id),'duplicate device id: '+device.id);
    ids.add(device.id);
  }
  must(['android','ios','ipados'].includes(device?.platform),prefix+'.platform must be android, ios, or ipados');
  if(device?.platform==='android')android++;
  if(device?.platform==='ios')ios++;
  must(device?.installMode==='installed-pwa',prefix+'.installMode must be installed-pwa');
  for(const field of ['deviceModel','osVersion','browser','browserVersion','screenReader']){
    must(typeof device?.[field]==='string'&&device[field].trim().length>0,prefix+'.'+field+' missing');
    if(!allowPending)must(device?.[field]!=='REPLACE',prefix+'.'+field+' is still a placeholder');
  }
  if(device?.platform==='android')must(/talkback/i.test(device?.screenReader||''),prefix+' Android evidence must use TalkBack');
  if(device?.platform==='ios'||device?.platform==='ipados')must(/voiceover/i.test(device?.screenReader||''),prefix+' Apple evidence must use VoiceOver');

  must(device?.checks&&typeof device.checks==='object'&&!Array.isArray(device.checks),prefix+'.checks missing');
  for(const name of requiredChecks){
    const status=device?.checks?.[name];
    must(statuses.has(status),prefix+'.checks.'+name+' has invalid status');
    if(!allowPending){
      must(status!=='not-tested',prefix+'.checks.'+name+' is not-tested');
      must(status!=='fail',prefix+'.checks.'+name+' failed');
      if(status==='unsupported'){
        must(name==='haptics'&&(device.platform==='ios'||device.platform==='ipados'),
          prefix+'.checks.'+name+' may be unsupported only for iOS/iPadOS haptics');
      }
    }
  }

  const updateTo=device?.updateTo;
  if(!allowPending||device?.checks?.installedUpdate==='pass'){
    must(typeof device?.updateFrom?.appVersion==='string'&&device.updateFrom.appVersion.length>0,prefix+'.updateFrom.appVersion missing');
    must(typeof device?.updateFrom?.cacheVersion==='string'&&device.updateFrom.cacheVersion.length>0,prefix+'.updateFrom.cacheVersion missing');
    must(updateTo?.appVersion===root.appVersion,prefix+'.updateTo.appVersion must match evidence appVersion');
    must(updateTo?.cacheVersion===root.cacheVersion,prefix+'.updateTo.cacheVersion must match evidence cacheVersion');
  }
}

must(android>=1,'at least one Android installed-PWA device is required');
must(ios>=1,'at least one iPhone/iOS installed-PWA device is required; iPadOS may be additional evidence');

const out={
  pass:fail.length===0,
  allowPending,
  product:root?.product,
  appVersion:root?.appVersion,
  cacheVersion:root?.cacheVersion,
  devices:(root?.devices||[]).map(d=>({id:d.id,platform:d.platform,checks:d.checks})),
  errors:fail
};
console.log(JSON.stringify(out,null,2));
process.exit(fail.length?1:0);
