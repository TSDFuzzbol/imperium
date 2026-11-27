// Laboratório mínimo: roda várias sementes sem intervenção e resume o estado final.
// Uso: npx tsx tools/sementes.ts [quantas sementes = 30] [anos = 10]
// Serve para achar comportamentos que só aparecem em reinados longos (ver docs/testing/RESULTADOS.md).
import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay } from '../src/engine/sim';
import { PROVS } from '../src/engine/types';
import { lowerHumor, totalPop } from '../src/engine/systems/people';

const N = Number(process.argv[2] || 30);
const YEARS = Number(process.argv[3] || 10);
const rows: string[][] = [['semente', 'pop', 'tesouro', 'dívida', 'Rhovan (soldados)', 'Karsk', 'pior humor', 'ungido', 'save KB', 'ms']];
for (let seed = 1; seed <= N; seed++) {
  const w = createWorld(seed);
  bootstrap(w);
  const t = performance.now();
  for (let d = 0; d < YEARS * 360; d++) stepDay(w);
  const ms = performance.now() - t;
  const pop = PROVS.reduce((a, id) => a + totalPop(w.provinces[id]), 0);
  const worst = Math.min(...PROVS.map((id) => lowerHumor(w.provinces[id])));
  rows.push([seed, pop, w.treasury.coin, w.treasury.debt, w.provinces.rhovan.garrison.soldiers, w.karsk.troops, worst, w.anointed ? 'sim' : 'não', JSON.stringify(w).length / 1024, ms]
    .map((x) => (typeof x === 'number' ? Math.round(x).toLocaleString('pt-BR') : String(x))));
}
const width = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
for (const r of rows) console.log(r.map((c, i) => c.padStart(width[i])).join('  '));
