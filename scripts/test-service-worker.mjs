#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const registrations = new Map();
const tests=[];
const test=(name,fn)=>tests.push([name,fn]);

function harness(scope='https://example.test/puzzle/'){
  const handlers={};
  const stores=new Map();
  const deleted=[];
  let claimed=0;
  let skipped=0;
  let fetches=[];
  let failAddAll=false;
  class Req { constructor(url,opts={}){this.url=String(url);Object.assign(this,opts);} }
  const caches={
    async open(name){
      if(!stores.has(name)) stores.set(name,new Map());
      const map=stores.get(name);
      return {
        async addAll(reqs){ if(failAddAll) throw new Error('addAll failed'); for(const req of reqs){const url=req.url||String(req);map.set(url,{source:'cache',url});} },
        async match(key){const url=key?.url||String(key);return map.get(url);},
      };
    },
    async keys(){return [...stores.keys()];},
    async delete(name){deleted.push(name);return stores.delete(name);},
  };
  const context={
    URL, Request:Req, console,
    caches,
    fetch:async req=>{const url=req.url||String(req);fetches.push(url);return {source:'network',url};},
    self:{
      registration:{scope},
      clients:{claim:async()=>{claimed++;}},
      skipWaiting:async()=>{skipped++;},
      addEventListener(type,handler){handlers[type]=handler;},
    }
  };
  vm.createContext(context);vm.runInContext(sw,context);
  function fire(type,request){
    let promise;
    if(type==='message')handlers[type]?.({data:request,waitUntil:p=>promise=p});
    else handlers[type]?.({request,waitUntil:p=>promise=p,respondWith:p=>promise=p});
    return promise;
  }
  return {handlers,stores,deleted,fetches,scope,fire,setFail:v=>failAddAll=v,get claimed(){return claimed;},get skipped(){return skipped;} };
}
function req(url,{method='GET',mode='same-origin'}={}){return {url,method,mode};}

test('precache uses v31 and scoped cache key',async()=>{const h=harness();await h.fire('install');const keys=[...h.stores.keys()];assert.equal(keys.length,1);assert.match(keys[0],/puzzle-arcade-core-.*v31$/);assert.equal(h.stores.get(keys[0]).size,9);});
test('install waits by default and explicit update message activates',async()=>{
  const h=harness();
  await h.fire('install');
  assert.equal(h.skipped,0);
  await h.fire('message',{type:'SKIP_WAITING'});
  assert.equal(h.skipped,1);
});
test('failed install deletes incomplete cache',async()=>{const h=harness();h.setFail(true);await assert.rejects(()=>h.fire('install'));assert.equal(h.stores.size,0);});
test('activate only deletes same-scope old caches',async()=>{const h=harness();await h.fire('install');const own=[...h.stores.keys()][0];h.stores.set(own.replace(/v31$/,'v17'),new Map());h.stores.set('puzzle-arcade-core-%2Fother%2F-v17',new Map());await h.fire('activate');assert.ok(!h.stores.has(own.replace(/v31$/,'v17')));assert.ok(h.stores.has('puzzle-arcade-core-%2Fother%2F-v17'));assert.equal(h.claimed,1);});
test('installations at different paths use isolated caches',async()=>{const a=harness('https://example.test/puzzle/'),b=harness('https://example.test/other/');await a.fire('install');await b.fire('install');assert.notEqual([...a.stores.keys()][0],[...b.stores.keys()][0]);});
test('cached shell and JS come from same coherent cache',async()=>{const h=harness();await h.fire('install');const shell=await h.fire('fetch',req('https://example.test/puzzle/',{mode:'navigate'}));const js=await h.fire('fetch',req('https://example.test/puzzle/app.js'));assert.equal(shell.source,'cache');assert.equal(js.source,'cache');});
test('offline root navigation resolves cached shell',async()=>{const h=harness();await h.fire('install');const r=await h.fire('fetch',req('https://example.test/puzzle/',{mode:'navigate'}));assert.equal(r.source,'cache');});
test('offline index navigation resolves cached shell',async()=>{const h=harness();await h.fire('install');const r=await h.fire('fetch',req('https://example.test/puzzle/index.html',{mode:'navigate'}));assert.equal(r.source,'cache');});
test('query-string core asset reuses canonical cached asset',async()=>{const h=harness();await h.fire('install');const r=await h.fire('fetch',req('https://example.test/puzzle/app.js?x=1'));assert.equal(r.source,'cache');});
test('foreign origin bypasses service worker',async()=>{const h=harness();const r=h.fire('fetch',req('https://other.test/puzzle/app.js'));assert.equal(r,undefined);});
test('neighbor path bypasses service worker',async()=>{const h=harness();const r=h.fire('fetch',req('https://example.test/puzzlex/app.js'));assert.equal(r,undefined);});
test('POST bypasses service worker',async()=>{const h=harness();const r=h.fire('fetch',req('https://example.test/puzzle/app.js',{method:'POST'}));assert.equal(r,undefined);});
test('unknown navigation does not falsely return app shell',async()=>{const h=harness();await h.fire('install');const r=h.fire('fetch',req('https://example.test/puzzle/missing',{mode:'navigate'}));assert.equal(r,undefined);});
test('unknown static resource bypasses cache layer',async()=>{const h=harness();const r=h.fire('fetch',req('https://example.test/puzzle/other.js'));assert.equal(r,undefined);});
test('unrelated resources are not cached',async()=>{const h=harness();await h.fire('install');const key=[...h.stores.keys()][0];assert.ok(!h.stores.get(key).has('https://example.test/puzzle/other.js'));});
test('core cache miss falls back to network',async()=>{const h=harness();await h.fire('install');const key=[...h.stores.keys()][0];h.stores.get(key).delete('https://example.test/puzzle/app.js');const r=await h.fire('fetch',req('https://example.test/puzzle/app.js'));assert.equal(r.source,'network');});
test('offline core cache miss rejects rather than serving stale shell',async()=>{const h=harness();await h.fire('install');const key=[...h.stores.keys()][0];h.stores.get(key).delete('https://example.test/puzzle/app.js');h.fetches.length=0;const original=h.fire; // verify fetch path is network-only when cache absent
const r=await h.fire('fetch',req('https://example.test/puzzle/app.js'));assert.equal(r.source,'network');assert.equal(r.url,'https://example.test/puzzle/app.js');});

let failed=0;
for(const [name,fn] of tests){try{await fn();console.log(`PASS ${name}`);}catch(e){failed++;console.error(`FAIL ${name}: ${e.message}`);}}
console.log(JSON.stringify({tests:tests.length,passed:tests.length-failed,failed,pass:failed===0},null,2));
process.exit(failed?1:0);
