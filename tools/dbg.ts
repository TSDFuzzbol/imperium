import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay } from '../src/engine/sim';
import { fmtMonth } from '../src/engine/core';
import { STRATA } from '../src/engine/types';
const w = createWorld(Number(process.argv[2]??11)); bootstrap(w);
const id = (process.argv[3]??'dornhelm') as 'dornhelm';
let m=0; while(m<Number(process.argv[4]??14)){ if(stepDay(w)){m++; const p=w.provinces[id];
 console.log(fmtMonth(w.day-1), STRATA.map(s=>{const x=p.strata[s];return `${s.slice(0,4)} inc${(x.income/x.pop).toFixed(3)} w${(x.wealth/x.pop).toFixed(2)} h${(x.hunger*100).toFixed(0)} m${x.humor.toFixed(0)}`}).join(' | '), 'pr', Object.entries(p.price).map(([g,v])=>g+(v as number).toFixed(2)).join(' '));}}
