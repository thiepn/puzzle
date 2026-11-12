#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const app=read('app.js');
const css=read('styles.css');
const index=read('index.html');
const sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const doc=read('docs/MAINTENANCE_PASS3_REAL_DEVICE.md');
const template=JSON.parse(read('docs/real-device-evidence.template.json'));

let checks=0;
const ok=(value,label)=>{assert.ok(value,label);checks++;};
const has=(text,needle,label)=>ok(text.includes(needle),label);

has(index,'viewport-fit=cover','viewport-fit=cover missing');
ok(!/maximum-scale|user-scalable\s*=\s*no/i.test(index),'mobile zoom must remain available');
for(const needle of [
  'apple-mobile-web-app-capable',
  'apple-mobile-web-app-title',
  'apple-mobile-web-app-status-bar-style',
  'apple-touch-icon',
  'id="route-status"',
  'aria-live="polite"',
  'class="skip-link"'
]) has(index,needle,'mobile/accessibility metadata missing: '+needle);

ok(manifest.display==='standalone','manifest must request standalone display');
ok(manifest.start_url==='./#/home','manifest start_url drifted');
ok(manifest.scope==='./','manifest scope drifted');
ok(manifest.orientation==='any','manifest must allow rotation');
ok(manifest.icons?.some(i=>i.sizes==='192x192'),'192px install icon missing');
ok(manifest.icons?.some(i=>i.sizes==='512x512'),'512px install icon missing');

for(const inset of ['top','right','bottom','left'])has(css,'safe-area-inset-'+inset,'safe-area coverage missing: '+inset);
has(css,'100dvh','dynamic viewport support missing');
has(css,'@media (pointer: coarse)','coarse-pointer media query missing');
ok(/@media \(pointer: coarse\)[\s\S]*min-height:44px/.test(css),'coarse-pointer 44px target floor missing');
ok(/\.main-nav[\s\S]*env\(safe-area-inset-bottom\)/.test(css),'mobile navigation does not account for bottom safe area');
ok(/\.modal[\s\S]*env\(safe-area-inset-bottom\)/.test(css),'mobile modal does not account for bottom safe area');
ok(/\.play-action-dock[\s\S]*env\(safe-area-inset-bottom\)/.test(css),'game action dock does not account for bottom safe area');
has(css,'prefers-reduced-motion','reduced-motion support missing');
has(css,'forced-colors: active','forced-colors support missing');
has(css,':focus-visible','focus-visible styling missing');

for(const needle of [
  "navigator.serviceWorker.register('sw.js',{updateViaCache:'none'})",
  "registration.addEventListener?.('updatefound'",
  "registration.waiting",
  "registration.update()",
  "navigator.serviceWorker.addEventListener('controllerchange'",
  "window.addEventListener('pagehide'",
  "document.addEventListener('visibilitychange'",
  "window.addEventListener('pageshow'",
  "input.type='file';input.accept='.json,application/json'",
  "URL.createObjectURL(new Blob([text],{type:'application/json'}))",
  "a.download='puzzle-arcade-backup-'",
  "new FileReader()",
  "typeof navigator.vibrate==='function'",
  "state.settings.haptics!=='on'",
  "document.hidden"
]) has(app,needle,'real-device runtime prerequisite missing: '+needle);

has(sw,'self.skipWaiting()','service-worker waiting activation missing');
has(sw,'self.clients.claim()','service-worker client claim missing');
ok(/keys\.filter\(key => key\.startsWith\(CACHE_PREFIX\) && key !== CACHE\)/.test(sw),'service-worker old-cache cleanup missing');

has(doc,'Physical certification status: **PENDING**','Pass 3 must not falsely claim physical closure');
has(doc,'REMOTE/AUTOMATED READINESS PASS — PHYSICAL CLOSURE PENDING','honest pending sign-off language missing');
has(doc,'iOS Safari/PWA does not expose the Web Vibration API','iOS haptic expectation missing');
ok(template?.schemaVersion===1,'evidence template schema drifted');
ok(template?.appVersion==='1.14.0'&&template?.cacheVersion==='v33','evidence template release identity drifted');
ok(template?.devices?.some(d=>d.platform==='android'&&/talkback/i.test(d.screenReader||'')),'Android/TalkBack template missing');
ok(template?.devices?.some(d=>(d.platform==='ios'||d.platform==='ipados')&&/voiceover/i.test(d.screenReader||'')),'iOS/VoiceOver template missing');

console.log(JSON.stringify({
  pass:true,
  checks,
  appVersion:template.appVersion,
  cacheVersion:template.cacheVersion,
  physicalCertification:'pending',
  note:'Automated readiness is not physical-device evidence.'
},null,2));
