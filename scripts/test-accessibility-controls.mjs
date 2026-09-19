#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const app=read('app.js'),css=read('styles.css'),index=read('index.html');
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};

has(index,'class="skip-link"','skip link missing');
has(index,'id="route-status"','route live region missing');
has(index,'data-action="controls"','controls help entry missing');
assert.ok(!/maximum-scale|user-scalable\s*=\s*no/i.test(index),'viewport zoom must remain available');checks++;

for(const key of ["motion:['system','reduced']","contrast:['system','high']","controls:['standard','large']"]) {
  has(app,key,'sanitized accessibility setting missing: '+key);
}
has(app,'function applyAccessibilitySettings','accessibility preference application missing');
has(app,"setAttribute('aria-current','page')",'active route semantics missing');
has(app,"$('.nav-link').forEach",'navigation collection binding missing');
has(app,"$('[data-motion-choice]').forEach",'motion controls collection binding missing');
has(app,"$('[data-contrast-choice]').forEach",'contrast controls collection binding missing');
has(app,"$('[data-controls-choice]').forEach",'control-size collection binding missing');
has(app,"$('[data-action=\"controls\"]').forEach",'controls-help collection binding missing');
has(app,'aria-keyshortcuts="Control+Z Meta+Z"','undo shortcut semantics missing');
has(app,"if(e.key==='?'","keyboard help shortcut missing");
has(app,"if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!a.state.path.length)","trace keyboard activation missing");
has(app,'aria-label="${esc(g.name)} puzzle board"','game board region label missing');
has(app,"result?.focus({preventScroll:true})",'completion focus management missing');

has(css,'.sr-only {','screen-reader-only utility missing');
has(css,'html[data-motion="reduced"]','explicit reduced-motion mode missing');
has(css,'@media (prefers-contrast: more)','system high-contrast support missing');
has(css,'@media (forced-colors: active)','forced-colors support missing');
has(css,'@media (pointer: coarse)','coarse-pointer target support missing');
has(css,'html[data-controls="large"]','large-controls mode missing');
has(css,'100dvh','dynamic viewport support missing');

console.log(JSON.stringify({pass:true,checks},null,2));
