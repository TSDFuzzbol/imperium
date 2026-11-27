import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay } from '../src/engine/sim';
const w = createWorld(Number(process.argv[2])); bootstrap(w);
let m=0; while(m<Number(process.argv[3])){ if(stepDay(w)) m++; }
const show=(id:string|undefined,depth:number)=>{ if(!id||depth>Number(process.argv[5]??1))return; const f=w.facts[id]; console.log('  '.repeat(depth)+`${f.label} = ${f.value?.toFixed?.(2)} [${f.source}]`); for(const x of f.factors){ console.log('  '.repeat(depth+1)+`- ${x.label}: ${x.amount?.toFixed?.(2) ?? ''} ${x.note??''}`); show(x.ref,depth+2);} };
show(w.factIndex[process.argv[4]],0);
