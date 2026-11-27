import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay } from '../src/engine/sim';
import { fmtMonth } from '../src/engine/core';
import { PROVS, GOODS } from '../src/engine/types';
const w = createWorld(Number(process.argv[2]??7)); bootstrap(w);
const g = (process.argv[3]??'ferro') as 'ferro';
let m=0; while(m<Number(process.argv[4]??8)){ if(stepDay(w)){m++;
 console.log(fmtMonth(w.day-1).padEnd(18), PROVS.map(id=>{const p=w.provinces[id]; return `${id.slice(0,4)} p${p.price[g].toFixed(2)} s${Math.round(p.stock[g])} d${Math.round(p.demandAvg[g])} in${Math.round(p.tradeIn[g])} out${Math.round(p.tradeOut[g])}`}).join(' | '));}}
