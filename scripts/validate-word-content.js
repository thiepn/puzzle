#!/usr/bin/env node
const path=require('path');
global.window=global;
require(path.resolve(__dirname,'..','word-content.js'));
const C=global.PA_WORD_CONTENT;
const errors=[];
const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const uniq=a=>new Set(a).size===a.length;
const sig=w=>[...w].sort().join('');
function validateStringSafety(value,path='content'){
  if(typeof value==='string'){
    assert(!/[<>]/.test(value),`${path}: HTML delimiter in content`);
    assert(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value),`${path}: control character in content`);
    return;
  }
  if(Array.isArray(value)) return value.forEach((v,i)=>validateStringSafety(v,`${path}[${i}]`));
  if(value&&typeof value==='object') Object.entries(value).forEach(([k,v])=>validateStringSafety(v,`${path}.${k}`));
}
validateStringSafety(C);
function pathExists(grid,n,word){
  const W=word.toUpperCase();
  const dfs=(i,k,used)=>{if(grid[i]!==W[k])return false;if(k===W.length-1)return true;used.add(i);const r=Math.floor(i/n),c=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc,j=rr*n+cc;if(rr>=0&&cc>=0&&rr<n&&cc<n&&!used.has(j)&&dfs(j,k+1,used)){used.delete(i);return true}}used.delete(i);return false};
  for(let i=0;i<grid.length;i++)if(dfs(i,0,new Set()))return true;return false;
}
function constructible(word,pieces){
  const memo=new Map();
  const rec=(rest,mask)=>{if(!rest)return true;const key=rest+'|'+mask;if(memo.has(key))return memo.get(key);for(let i=0;i<pieces.length;i++)if(!(mask&(1<<i))&&rest.startsWith(pieces[i])&&rec(rest.slice(pieces[i].length),mask|(1<<i)))return memo.set(key,true);memo.set(key,false);return false};
  return rec(word,0);
}
for(const key of ['groups','wordSearchThemes','themeTrailBoards','wordPieceBoards','anagramSets','hiveBoards','wordGridBoards','cryptograms','miniCrosswords']){
 const a=C[key]||[];assert(a.length>0,`${key}: empty`);const ids=a.map(x=>x.id).filter(Boolean);assert(ids.length===a.length,`${key}: missing id`);assert(uniq(ids),`${key}: duplicate id`);
}
C.groups.forEach(g=>{assert(g.members?.length===4,`${g.id}: groups size`);assert(uniq(g.members),`${g.id}: duplicate member`);});
C.wordSearchThemes.forEach(t=>{assert((t.words||[]).length>=8,`${t.id}: too few words`);assert(uniq(t.words),`${t.id}: duplicate word`);t.words.forEach(w=>assert(/^[A-Z]+$/.test(w),`${t.id}: invalid word ${w}`));});
C.themeTrailBoards.forEach(b=>{assert(b.grid?.length===25,`${b.id}: grid size`);assert(b.words.length===b.paths.length,`${b.id}: paths mismatch`);const seen=[];b.words.forEach((w,k)=>{const p=b.paths[k];assert(p.length===w.length,`${b.id}/${w}: path length`);p.forEach((cell,j)=>{assert(b.grid[cell]===w[j],`${b.id}/${w}: grid mismatch`);seen.push(cell);if(j){const a=p[j-1],r=Math.floor(a/5),c=a%5,rr=Math.floor(cell/5),cc=cell%5;assert(Math.max(Math.abs(r-rr),Math.abs(c-cc))===1,`${b.id}/${w}: nonadjacent path`)}})});assert(seen.length===25&&uniq(seen),`${b.id}: coverage`);});
C.wordPieceBoards.forEach(b=>{assert(b.answers.length>=6,`${b.id}: too few answers`);assert(uniq(b.answers),`${b.id}: duplicate answer`);b.answers.forEach(w=>assert(constructible(w,b.pieces),`${b.id}: ${w} not constructible`));});
C.anagramSets.forEach(a=>{assert(a.answers.length>=1,`${a.id}: no answers`);assert(uniq(a.answers),`${a.id}: duplicate answer`);a.answers.forEach(w=>assert(sig(w)===a.letters,`${a.id}: bad signature ${w}`));});
C.hiveBoards.forEach(h=>{const letters=[...h.letters];assert(letters.length===7&&uniq(letters),`${h.id}: not 7 unique letters`);assert(letters.includes(h.center),`${h.id}: center missing`);assert(h.answers.length>=12,`${h.id}: too few answers`);h.answers.forEach(w=>{assert(w.length>=4,`${h.id}: short ${w}`);assert(w.includes(h.center),`${h.id}: center absent ${w}`);assert([...w].every(ch=>letters.includes(ch)),`${h.id}: outside letter ${w}`)});});
C.wordGridBoards.forEach(b=>{const grid=Array.isArray(b.grid)?b.grid:[...b.grid];assert(grid.length===16,`${b.id}: grid size`);assert(b.answers.length>=12,`${b.id}: too few answers`);b.answers.forEach(w=>assert(pathExists(grid,4,w),`${b.id}: untraceable ${w}`));});
const cryptoTexts=C.cryptograms.map(x=>x.text);assert(uniq(cryptoTexts),'cryptograms: duplicate text');C.cryptograms.forEach(x=>assert(x.text.length>=25&&x.text.length<=140,`${x.id}: text length ${x.text.length}`));
C.miniCrosswords.forEach(b=>{assert(b.grid.length===25,`${b.id}: grid size`);assert(b.entries.length>=8,`${b.id}: too few entries`);assert(uniq(b.entries.map(e=>e.answer)),`${b.id}: duplicate answer`);b.entries.forEach(e=>{const got=e.cells.map(i=>b.grid[i]).join('');assert(got===e.answer,`${b.id}/${e.answer}: cell mismatch`);assert(typeof e.clue==='string'&&e.clue.trim().length>0,`${b.id}/${e.answer}: missing clue`);assert(['across','down'].includes(e.direction),`${b.id}: direction`)});});
const summary={version:C.version,counts:{lexicon:C.lexicon.length,groups:C.groups.length,wordSearchThemes:C.wordSearchThemes.length,themeTrailBoards:C.themeTrailBoards.length,wordPieceBoards:C.wordPieceBoards.length,anagramSets:C.anagramSets.length,hiveBoards:C.hiveBoards.length,wordGridBoards:C.wordGridBoards.length,cryptograms:C.cryptograms.length,miniCrosswords:C.miniCrosswords.length},errors:errors.length};
console.log(JSON.stringify(summary,null,2));if(errors.length){console.error(errors.slice(0,100).join('\n'));process.exit(1)}
