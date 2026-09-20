#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const dictionarySource=fs.readFileSync(new URL('../word-dictionary.js',import.meta.url),'utf8');
const box={window:{}};
vm.createContext(box);
vm.runInContext(dictionarySource,box);
const words=String(box.window.PA_ACCEPTED_WORDS||'').split(/\s+/).filter(Boolean);
const set=new Set(words);
const five=words.filter(w=>w.length===5);
const required=['trace','crate','stare','adieu','lions','loves'];
assert.ok(words.length>=100000,`accepted-word dictionary unexpectedly small: ${words.length}`);
assert.ok(five.length>=7000,`five-letter dictionary unexpectedly small: ${five.length}`);
for(const word of required)assert.ok(set.has(word),`required common word missing: ${word}`);

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
for(const [label,needle] of [
  ['version',"const APP_VERSION = '1.5.0';"],
  ['Five Letters broad validation',"if(!isAcceptedWord(word))"],
  ['Word Ladder broad validation',"if(!isAcceptedWord(w))return toast('That word is not in the accepted English dictionary.')"],
  ['Word Ladder broad hint graph','acceptedLadderPath(cur,a.puzzle.target,new Set(a.state.chain.slice(0,-1)))'],
  ['Anagrams expanded answers','acceptedAnagrams(a.puzzle.letters.join(\'\'))'],
  ['Letter Hive broad validation',"if(!isAcceptedWord(w)||!wordUsesOnlyLetters(w,a.puzzle.letters))"],
  ['Word Grid broad validation','w.length>=3&&isAcceptedWord(w)'],
  ['Anagrams structure hint','vowel/consonant pattern'],
  ['Anagrams anchor hint','A useful anchor: position'],
  ['Anagrams chunk hint','A contiguous']
]) assert.ok(app.includes(needle),`${label} regression`);

console.log(JSON.stringify({
  pass:true,
  acceptedWords:words.length,
  fiveLetterWords:five.length,
  requiredWords:Object.fromEntries(required.map(w=>[w,set.has(w)])),
  wordEntryModes:['Five Letters','Word Ladder','Anagrams','Letter Hive','Word Grid']
},null,2));
