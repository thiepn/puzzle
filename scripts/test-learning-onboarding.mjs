#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
const app=read('app.js'),css=read('styles.css'),index=read('index.html');
const ids=["five-letters","groups","word-ladder","anagrams","letter-hive","word-grid","theme-trail","word-pieces","mini-crossword","cryptogram","word-search","sudoku","killer-sudoku","kakuro","unequal","arithmetic-cages","make-24","mines","nonogram","loop","bridges","light-up","islands","hitori","binary","queens","number-path","tents","rectangles","dominoes","towers","fillomino","network","sliding-tiles","lights-out","untangle"];
let checks=0;
const ok=(value,label)=>{assert.ok(value,label);checks++;};
const block=(start,end)=>{
  const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,'missing block: '+start);checks++;
  return app.slice(a,b);
};
const guide=block('const PLAY_GUIDES = {','const LEARN_CHECKS = {');
const practice=block('const LEARN_CHECKS = {','function firstPlayCoach(');

for(const id of ids){
  const key=id.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&');
  ok(new RegExp("(?:'"+key+"'|\\b"+key+")\\s*:").test(guide),'PLAY_GUIDES missing '+id);
  ok(new RegExp("(?:'"+key+"'|\\b"+key+")\\s*:").test(practice),'LEARN_CHECKS missing '+id);
}
ok(ids.length===36,'expected 36 catalog games');

ok(index.includes('data-route="learn"'),'Learn primary navigation missing');
ok(/const BUILD_PHASE = '[^']+';/.test(app),'release build identity missing');
ok(app.includes("firstPlayCoach:'on'"),'first-play coach default missing');
ok(app.includes('function sanitizeLearning('),'learning state sanitation missing');
ok(app.includes('function learningStatus('),'learning status helper missing');
ok(app.includes('function showLearnTutorial('),'tutorial flow missing');
ok(app.includes("CATEGORIES[byId[game.id]?.category||'logic'].label"),'tutorial must resolve category from catalog metadata');
ok(app.includes('function renderLearn('),'Learn library renderer missing');
ok(app.includes('function firstPlayCoach('),'first-play coach renderer missing');
ok(app.includes('data-dismiss-learn-coach'),'coach skip control missing');
ok(app.includes('data-menu-learn'),'game-menu Learn entry missing');
ok(app.includes('data-first-play-choice'),'onboarding setting missing');
ok(app.includes('data-action="reset-learning"'),'learning reset action missing');
ok(app.includes("route==='learn'"),'Learn route missing');
ok(app.includes('data-learn-answer'),'interactive practice answers missing');
ok(app.includes('data-learn-finish disabled'),'practice completion gate missing');
ok(app.includes('await completeLearning(game.id)'),'tutorial completion persistence missing');
ok(app.includes('await setLearningProgress(game.id,step)'),'tutorial resume persistence missing');
ok(app.includes('Lessons never modify your real puzzle.'),'safe tutorial copy missing');

ok(css.includes('/* Phase 12 — Onboarding, tutorials & Learn mode. */'),'Phase 12 CSS layer missing');
ok(css.includes('.first-play-coach'),'first-play coach styles missing');
ok(css.includes('.learn-grid'),'Learn library styles missing');
ok(css.includes('.learn-practice'),'practice UI styles missing');
ok(css.includes('.learn-options button.is-correct'),'correct-answer state missing');
ok(css.includes('.learn-options button.is-wrong'),'incorrect-answer state missing');

console.log(JSON.stringify({pass:true,checks,games:ids.length},null,2));
