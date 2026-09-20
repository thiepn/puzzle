#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
const app=read('app.js'),css=read('styles.css'),index=read('index.html');
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};

has(app,"const APP_VERSION = '1.4.0';",'Phase 11 release version missing');
has(app,"const BUILD_PHASE = 'Audio, Haptics & Sensory Feedback';",'Phase 11 build identity missing');
has(index,'data-action="sound-toggle"','persistent sound toggle missing');
has(index,'aria-pressed="true"','sound toggle pressed semantics missing');

for(const key of ["sound:['on','off']","haptics:['on','off']","soundVolume:Number.isFinite"]) {
  has(app,key,'sensory setting sanitation missing: '+key);
}
has(app,'const SENSORY_CATEGORY_BASE=','category sound identity missing');
has(app,'window.AudioContext||window.webkitAudioContext','Web Audio feature detection missing');
has(app,"typeof navigator.vibrate==='function'",'haptic feature detection missing');
has(app,"state.settings.sound!=='on'",'sound mute guard missing');
has(app,"state.settings.haptics!=='on'",'haptic disable guard missing');
has(app,'function sensoryTone(','local synthesis engine missing');
has(app,'function sensoryCue(','central sensory cue router missing');
has(app,'function syncSensoryChrome(','sound chrome sync missing');
has(app,'document.addEventListener(\'pointerdown\',unlockSensoryAudio','user-gesture audio unlock missing');
has(app,'document.addEventListener(\'keydown\',unlockSensoryAudio','keyboard audio unlock missing');

for(const kind of ['error','complete','progress','hint','undo','redo','pause','resume','preview']) {
  has(app,`kind==='${kind}'`,'sensory cue missing: '+kind);
}
assert.ok(!app.includes("sensoryCue('move'"),'ordinary puzzle movement must remain silent');checks++;
assert.ok(!/\.(mp3|wav|ogg|m4a|aac)(?:['"`?]|$)/i.test(app+index+css),'Phase 11 must not add packaged audio assets');checks++;

has(app,'data-sound-choice','sound settings UI missing');
has(app,'data-sound-volume','sound volume control missing');
has(app,'data-haptics-choice','haptic settings UI missing');
has(app,'data-action="sensory-test"','sensory preview control missing');
has(app,'sensorySupport().haptics','unsupported-haptics UI handling missing');
has(app,"$$('[data-action=\"sound-toggle\"]').forEach",'sound quick-toggle binding missing');
has(app,"$$('[data-action=\"sensory-test\"]').forEach",'sensory test binding missing');

has(app,"sensoryCue(a.outcome==='failed'?'error':'complete',game)",'result sensory distinction missing');
has(app,"sensoryCue('hint',game)",'hint cue integration missing');
has(app,"sensoryCue('undo',game)",'undo cue integration missing');
has(app,"sensoryCue('redo',game)",'redo cue integration missing');
has(app,"sensoryCue(ui.paused?'pause':'resume',game)",'pause/resume cue integration missing');

has(css,'/* Phase 11 — Audio, haptics & sensory feedback. */','Phase 11 CSS layer missing');
has(css,'.sound-toggle[data-sound-state="off"]::after','visual mute cue missing');
has(css,'.sensory-volume','volume control styling missing');
has(css,'@media (forced-colors: active)','forced-colors support must remain present');

console.log(JSON.stringify({pass:true,checks},null,2));
