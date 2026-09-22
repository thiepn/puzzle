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
has(app,"$$('.nav-link').forEach",'navigation collection binding missing');
has(app,"$$('[data-motion-choice]').forEach",'motion controls collection binding missing');
has(app,"$$('[data-contrast-choice]').forEach",'contrast controls collection binding missing');
has(app,"$$('[data-controls-choice]').forEach",'control-size collection binding missing');
has(app,"$$('[data-action=\"controls\"]').forEach",'controls-help collection binding missing');
has(app,'aria-keyshortcuts="Control+Z Meta+Z"','undo shortcut semantics missing');
has(app,"if(e.key==='?'","keyboard help shortcut missing");
has(app,"if(e.key==='Escape'&&overlayRoot.firstChild)",'global Escape overlay close missing');
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
has(css,'--on-accent: #fffdf8;','light on-accent token missing');
has(css,'html[data-theme="dark"] {','explicit dark theme missing');
has(css,'color-scheme: dark;','dark native-control color scheme missing');
has(css,'.mine-cell[data-n="1"]{color:var(--number)}','Minesweeper number colors must use theme tokens');
assert.ok(!/\bcolor\s*:\s*(?:#(?:fff|ffffff)|white)\b/i.test(css),'literal white text color bypasses theme-aware on-accent token');checks++;

const hexVars=block=>Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(m=>[m[1],m[2]]));
const rootBlock=css.match(/^:root\s*\{([\s\S]*?)\n\}/)?.[1]||'';
const darkBlock=css.match(/html\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1]||'';
const lightVars=hexVars(rootBlock),darkVars=hexVars(darkBlock);
const luminance=hex=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
const ratio=(a,b)=>{const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05);};
for(const [mode,vars] of [['light',lightVars],['dark',darkVars]]) {
  for(const token of ['word','number','logic','spatial','success','danger','warning','hint','focus']) {
    assert.ok(ratio(vars[token],vars['paper-bright'])>=4.5,`${mode} --${token} fails 4.5:1 against --paper-bright`);checks++;
    assert.ok(ratio(vars['on-accent'],vars[token])>=4.5,`${mode} --on-accent fails 4.5:1 against --${token}`);checks++;
  }
}


console.log(JSON.stringify({pass:true,checks},null,2));
