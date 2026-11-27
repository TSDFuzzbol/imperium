import { PROV_DATA, SECTOR_OUTPUT, NEEDS } from '../src/data/eldoria';
let prod=0, need=0;
for (const d of Object.values(PROV_DATA)) {
  const C = d.pop*d.shares.camponeses;
  const g = C*(d.sectors.agri??0)*d.grainYield + 12*Object.entries(d.sectors).reduce((a,[s,sh])=>a+C*(sh as number)*((SECTOR_OUTPUT as any)[s].grao??0),0);
  const n = d.pop*0.1*12*1.01 + d.garrison*1.2;
  console.log(d.id, Math.round(g/1000), Math.round(n/1000), (g/n).toFixed(2));
  prod+=g; need+=n;
}
console.log('total', Math.round(prod/1000), Math.round(need/1000), (prod/need).toFixed(3));
