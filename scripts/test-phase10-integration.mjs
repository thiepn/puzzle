#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
const app=read('app.js'),css=read('styles.css'),browser=read('scripts/test-play-browser.py');
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};

has(app,"const APP_VERSION = '1.3.0';",'integrated release version missing');
has(app,"const BUILD_PHASE = 'Integration, Final Certification & Ship';",'Phase 10 identity missing');

// Cumulative Phase 1-8 systems must survive integration.
has(app,'discovery-home','Phase 3 discovery home missing');
has(app,'game-chrome','Phase 2 game chrome missing');
has(app,'applyIndividualGamePolish','Phase 5 individual polish missing');
has(app,'applyMotionGameFeel','Phase 6 motion system missing');
has(app,'resultRewardSummary','Phase 7 result/reward logic missing');
has(app,'statsRecord','Phase 8 stats record logic missing');
has(css,'.stats-page','Phase 8 stats styles missing');
has(css,'.game-chrome','game chrome styles missing');

// Phase 9 must be layered onto the cumulative build.
has(app,'function applyAccessibilitySettings','Phase 9 accessibility settings missing');
has(app,'function showControlsHelp','Phase 9 controls help missing');
has(app,"state.settings.motion==='reduced'","Phase 9 motion preference is not connected to Phase 6");
has(app,"setAttribute('aria-current','page')",'route semantics missing');
has(app,"if(e.key==='Escape'&&overlayRoot.firstChild)",'reliable Escape dismissal missing');
has(app,"if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!a.state.path.length)",'trace keyboard activation missing');
has(css,'@media (forced-colors: active)','forced-colors support missing');
has(css,'@media (pointer: coarse)','coarse-pointer support missing');
has(css,'html[data-contrast="high"]','high-contrast mode missing');
has(css,'html[data-controls="large"]','large-controls mode missing');

for(let i=1;i<=8;i++){
  const matches=fs.readdirSync(new URL('docs/',root)).filter(name=>name.startsWith('V1_2_PHASE'+i+'_'));
  assert.equal(matches.length,1,'Phase '+i+' documentation missing');checks++;
}
assert.ok(fs.existsSync(new URL('docs/PHASE9_ACCESSIBILITY.md',root)),'Phase 9 documentation missing');checks++;

has(browser,'Phase 6 motion contract','Phase 6 browser coverage missing');
has(browser,'Phase 7: finish a real generated Sudoku','Phase 7 browser coverage missing');
has(browser,'Phase 8: populate a representative local record','Phase 8 browser coverage missing');
has(browser,'Phase 9 accessibility/control behavior','Phase 9 browser coverage missing');

assert.ok(!/(^|[^$])\$\('\.nav-link'\)\.forEach/m.test(app),'single-element selector used as navigation collection');checks++;
assert.ok(!/(^|[^$])\$\('\[data-motion-choice\]'\)\.forEach/m.test(app),'single-element selector used as motion collection');checks++;
assert.ok(!/(^|[^$])\$\('\[data-action="controls"\]'\)\.forEach/m.test(app),'single-element selector used as controls collection');checks++;

console.log(JSON.stringify({pass:true,checks},null,2));
