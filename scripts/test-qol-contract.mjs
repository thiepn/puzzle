#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
const app=read('app.js'),css=read('styles.css'),index=read('index.html'),workflow=read('.github/workflows/bootstrap.yml'),release=JSON.parse(read('release-manifest.json'));
let checks=0;
const has=(text,needle,label)=>{assert.ok(text.includes(needle),label);checks++;};

has(app,"const APP_VERSION = '1.14.0';",'QoL release version missing');
has(app,"const BUILD_PHASE = 'QoL, Keyboard Navigation & Mobile UI Polish';",'QoL build phase missing');
has(app,'function qolLatestActive()','latest-active QoL helper missing');
has(app,'function qolResumeLatest()','quick resume shortcut missing');
has(app,'function qolCommandItems()','quick switcher commands missing');
has(app,'role="combobox"','quick switcher combobox semantics missing');
has(app,"if(e.key==='ArrowDown')",'quick switcher down navigation missing');
has(app,"if(e.key==='ArrowUp')",'quick switcher up navigation missing');
has(app,"if(e.key==='Enter')",'quick switcher enter activation missing');
has(app,'function qolMoveFocus(current,key,items)','spatial key navigation missing');
has(app,"qolBindKeyGroup('.game-grid','.game-card__open')",'library card arrow navigation missing');
has(app,"qolBindKeyGroup('.filterbar','.filter')",'filter arrow navigation missing');
has(app,"qolBindKeyGroup('.main-nav','.nav-link')",'primary nav arrow navigation missing');
has(app,"e.key.toLowerCase()==='k'",'Ctrl/Cmd-K shortcut missing');
has(app,"e.key==='/'",'slash quick-search shortcut missing');
has(app,"const routes={p:'home',l:'learn',s:'stats',o:'settings'}",'G chord navigation missing');
has(app,"if(key==='c')",'continue shortcut missing');
has(app,"if(key==='r')",'random shortcut missing');
has(app,"if(e.key==='Escape'&&route==='game'","game Escape options shortcut missing");

has(index,'class="nav-icon"','mobile nav icons missing');
has(index,'aria-keyshortcuts="G P"','navigation shortcut semantics missing');
has(index,'aria-keyshortcuts="Control+K Meta+K /"','quick switcher shortcut semantics missing');

for(const [needle,label] of [
  ['/* QoL release 1.14 — keyboard navigation + mobile-first density','QoL style section missing'],
  ['.search-result.is-selected','quick switcher selected state missing'],
  ['--mobile-nav-h: 64px','mobile bottom nav sizing missing'],
  ['.nav-icon {','mobile nav icon styling missing'],
  ['.top-actions [data-action="sound-toggle"]','mobile topbar declutter missing'],
  ['.catalog-game-grid {','mobile catalog density missing'],
  ['.modal-backdrop {','mobile bottom-sheet modal override missing'],
  ['position: sticky;','mobile sticky action dock missing'],
  ['.play-action-dock {','mobile game action dock override missing'],
  ['.home-mini-grid {','mobile horizontal mini-card rail missing']
]) has(css,needle,label);

has(workflow,'qol-gate:','QoL browser gate missing from CI');
has(workflow,'needs: [release-gate, player-fuzz-gate, endurance-gate, recovery-gate, qol-gate, resilience-matrix]','deployment does not require QoL gate');
assert.ok(release.certificationGates?.includes('qol-gate'),'release manifest does not include QoL gate');checks++;

console.log(JSON.stringify({pass:true,release:'1.14.0',checks},null,2));
