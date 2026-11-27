import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay } from '../src/engine/sim';
import { fmtMonth } from '../src/engine/core';
import { PROVS } from '../src/engine/types';
import { lowerHumor, lowerHunger, totalPop } from '../src/engine/systems/people';
const seed = Number(process.argv[2] ?? 7);
const months = Number(process.argv[3] ?? 24);
const w = createWorld(seed); bootstrap(w);
let m = 0;
const r = (x:number,d=0)=>x.toFixed(d);
while (m < months) {
  if (stepDay(w)) {
    m++;
    const pop = PROVS.reduce((a,id)=>a+totalPop(w.provinces[id]),0);
    console.log(`${fmtMonth(w.day-1).padEnd(20)} pop ${r(pop/1000)}k coin ${r(w.treasury.coin)} in ${r(w.treasury.lastIncome)} out ${r(w.treasury.lastExpense)} gran ${r(w.granary)} K ${r(w.karsk.troops)}`);
    console.log('   ' + PROVS.map(id=>{const p=w.provinces[id]; return `${id.slice(0,4)} p${r(p.price.grao,2)} c${r(p.stock.grao/p.demandAvg.grao,1)} h${r(lowerHunger(p)*100)} m${r(lowerHumor(p))} ${p.unrest[0]}`}).join(' | '));
    if (process.env.INC) console.log('   inc ' + PROVS.map(id=>{const s=w.provinces[id].strata.camponeses; return `${id.slice(0,4)} ${(s.income/s.pop).toFixed(3)} w${(s.wealth/s.pop).toFixed(2)}`}).join(' ')+' | ferro '+r(w.provinces.dornhelm.price.ferro,2)+' la '+r(w.provinces.caldris.price.la,2)+' tec '+r(w.provinces.valtheris.price.tecido,2)+' sal '+r(w.provinces.valtheris.price.sal,2)+' mad '+r(w.provinces.esteren.price.madeira,2));
    console.log('   ' + Object.values(w.groups).filter(g=>!g.id.startsWith('povo')).map(g=>`${g.id.replace('casa:','')} ${r(g.acceptance)}/${g.rung}`).join(' '), 'anoint', w.anointed, 'hf', w.provinces.veyra.lastHarvestFactor.toFixed(2), 'pret', r(w.pretender,2));
  }
}
console.log('facts', Object.keys(w.facts).length, 'chron', w.chronicle.length, 'json', JSON.stringify(w).length);
for (const c of w.chronicle.slice(-25)) console.log(c.day, c.title);
