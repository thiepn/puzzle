#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const app=read('app.js');
const sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};
const lacks=(text,needle,label)=>{assert.ok(!text.includes(needle),label);checks++;};

has(app,"const APP_VERSION = '1.11.0';",'Phase 18 app version missing');
has(app,"const BUILD_PHASE = 'Cross-Browser, Offline/PWA & Multi-Tab Resilience';",'Phase 18 build identity missing');
has(app,'const P18_VERSION=18;','Phase 18 runtime version missing');
has(app,'window.__PA_RESILIENCE__','Phase 18 diagnostic surface missing');

// Cross-browser compatibility fallbacks.
has(app,'function cloneValue(value)','structured-clone compatibility helper missing');
has(app,"typeof globalThis.structuredClone === 'function'",'native structuredClone fast path missing');
has(app,'JSON.parse(JSON.stringify(value))','structuredClone JSON fallback missing');
has(app,'function cssEscape(value)','CSS.escape compatibility helper missing');
has(app,"if(globalThis.CSS?.escape)",'native CSS.escape fast path missing');
has(app,"'ResizeObserver' in window",'ResizeObserver feature detection missing');
has(app,"window.addEventListener('resize',update,{passive:true})",'ResizeObserver fallback missing');
has(app,'globalThis.crypto?.getRandomValues','secure random feature detection missing');

// Cross-tab transport + serialization.
has(app,"new BroadcastChannel('puzzle-arcade-resilience-v1')",'BroadcastChannel transport missing');
has(app,"window.addEventListener('storage'",'storage-event fallback missing');
has(app,'const P18_SYNC_KEY=','cross-tab pulse key missing');
has(app,'navigator.locks','Web Locks path missing');
has(app,'const P18_LOCK_PREFIX=','lease fallback missing');
has(app,'async function p18WithLease(','localStorage lease implementation missing');
has(app,'async function p18WithActiveLock(','per-puzzle serialization missing');
has(app,'const requestedVersion=Number(active.updatedAt)||0;','queued-save requested revision capture missing');
has(app,'const localVersion=Math.max(requestedVersion,Number(active.updatedAt)||0);','queued same-tab revision refresh missing');
has(app,'const remoteNewer=!!(remote&&(remote.updatedAt||0)>localVersion);','newer remote-state detection missing');
has(app,'if(remoteNewer&&!replaceExisting)','newer remote state stale-write guard missing');
has(app,'function p18MarkReplacementIntent(gameId,seed)','replacement intent marker missing');
has(app,'function p18ConsumeReplacementIntent(gameId,seed)','replacement intent consumer missing');
has(app,"navigation?.type==='reload'||navigation?.type==='back_forward'",'stale reload replacement suppression missing');
has(app,'saveActive(active,{replaceExisting:!previous||damaged||outdated||explicitReplacement})','intent-gated fresh-session replacement path missing');
has(app,'p18NormalizeGameRoute(active)','durable route normalization missing');
has(app,'saveActive(fresh,{replaceExisting:true})','replay replacement path missing');
has(app,"toast('This puzzle changed in another tab. Loaded the newest saved state.')",'remote-state adoption feedback missing');
has(app,"p18Emit({type:'reset'})",'cross-tab reset propagation missing');

// Lifecycle / BFCache / network resilience.
has(app,"window.addEventListener('pageshow'",'BFCache resynchronization missing');
has(app,"window.addEventListener('online'",'online recovery signal missing');
has(app,"window.addEventListener('offline'",'offline state signal missing');
has(app,"document.documentElement.dataset.network=offline?'offline':'online'",'network state surface missing');

// Controlled PWA updates: install remains atomic, activation is explicit when a client already exists.
has(app,"navigator.serviceWorker.register('sw.js',{updateViaCache:'none'})",'service-worker cache-bypass update registration missing');
has(app,"postMessage({type:'SKIP_WAITING',appVersion:APP_VERSION})",'controlled service-worker activation handshake missing');
has(app,"navigator.serviceWorker.addEventListener('controllerchange'",'controller upgrade reload missing');
has(sw,"const APP_VERSION = '1.11.0';",'service worker app version mismatch');
has(sw,"const CACHE_VERSION = 'v30';",'service worker cache generation mismatch');
has(sw,"event.data?.type !== 'SKIP_WAITING'",'service worker explicit activation listener missing');
lacks(sw,"self.addEventListener('install', event => {\n  self.skipWaiting",'service worker must not force activation during install');

// Installability contract remains scoped and standalone.
assert.equal(manifest.id,'./');checks++;
assert.equal(manifest.scope,'./');checks++;
assert.equal(manifest.start_url,'./#/home');checks++;
assert.equal(manifest.display,'standalone');checks++;
assert.ok(manifest.icons.some(x=>x.sizes==='192x192')&&manifest.icons.some(x=>x.sizes==='512x512'),'install icons incomplete');checks++;

console.log(JSON.stringify({pass:true,phase:18,checks},null,2));
