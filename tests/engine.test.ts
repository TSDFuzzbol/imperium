import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay, stepDays } from '../src/engine/sim';
import { issue } from '../src/engine/decrees';
import { PROVS, STRATA, GOODS } from '../src/engine/types';
import type { World } from '../src/engine/types';
import { lowerHumor } from '../src/engine/systems/people';

function fresh(seed = 7) {
  const w = createWorld(seed);
  bootstrap(w);
  return w;
}
function months(w: World, n: number) {
  let m = 0;
  while (m < n) if (stepDay(w)) m++;
}
/** Percorre os Fios a partir de um fato e diz se algum nó satisfaz o teste. */
function reaches(w: World, from: string | undefined, pred: (label: string, key: string) => boolean, depth = 8): boolean {
  const seen = new Set<string>();
  const go = (id: string | undefined, d: number): boolean => {
    if (!id || d > depth || seen.has(id)) return false;
    seen.add(id);
    const f = w.facts[id];
    if (!f) return false;
    if (pred(f.label, f.key)) return true;
    return f.factors.some((x) => go(x.ref, d + 1));
  };
  return go(from, 0);
}

test('mesma semente e mesmas ordens dão o mesmo mundo', () => {
  const a = fresh(123), b = fresh(123);
  for (const w of [a, b]) {
    stepDays(w, 20);
    assert.equal(issue(w, { decree: { verb: 'taxar', prov: 'veyra', rate: 0.14 }, publico: true }), null);
    stepDays(w, 300);
  }
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('sementes diferentes dão histórias diferentes', () => {
  const a = fresh(1), b = fresh(2);
  stepDays(a, 200); stepDays(b, 200);
  assert.notEqual(a.provinces.veyra.stock.grao, b.provinces.veyra.stock.grao);
});

test('salvar e carregar no meio não muda o futuro', () => {
  const a = fresh(55);
  stepDays(a, 95);
  const b = JSON.parse(JSON.stringify(a)) as World;
  stepDays(a, 200); stepDays(b, 200);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('invariantes: nada negativo, nada NaN, ao longo de dois anos', () => {
  for (const seed of [3, 7, 11]) {
    const w = fresh(seed);
    for (let i = 0; i < 720; i++) {
      stepDay(w);
      if (i % 30 !== 0) continue;
      for (const id of PROVS) {
        const p = w.provinces[id];
        for (const s of STRATA) {
          assert.ok(Number.isFinite(p.strata[s].pop) && p.strata[s].pop >= 0, `pop ${id} ${s}`);
          assert.ok(p.strata[s].humor >= -100 && p.strata[s].humor <= 100);
        }
        for (const g of GOODS) {
          assert.ok(Number.isFinite(p.stock[g]) && p.stock[g] >= -1e-6, `estoque ${id} ${g} = ${p.stock[g]}`);
          assert.ok(Number.isFinite(p.price[g]) && p.price[g] > 0, `preço ${id} ${g}`);
        }
      }
      assert.ok(Number.isFinite(w.treasury.coin) && w.treasury.coin >= -1e-6);
    }
  }
});

test('o primeiro ano sem intervenção é tenso, mas não desaba', () => {
  for (const seed of [3, 7, 11, 42, 99]) {
    const w = fresh(seed);
    months(w, 10);
    const revolts = PROVS.filter((id) => w.provinces[id].unrest === 'revolta').length;
    assert.ok(revolts <= 1, `semente ${seed}: ${revolts} províncias em revolta`);
  }
});

test('cadeia: seca em Veyra → colheita menor → grão mais caro na capital', () => {
  const run = (rain: number) => {
    const w = fresh(9);
    // força a primavera de Veyra
    for (let i = 0; i < 160; i++) {
      stepDay(w);
      w.provinces.veyra.growRain = w.provinces.veyra.growRain.map(() => rain);
    }
    months(w, 1);
    return w;
  };
  const dry = run(-0.9), wet = run(0.3);
  assert.ok(dry.provinces.veyra.lastHarvestFactor < wet.provinces.veyra.lastHarvestFactor);
  assert.ok(dry.provinces.valtheris.price.grao > wet.provinces.valtheris.price.grao, 'grão mais caro em Valtheris depois da seca');
  // os Fios levam do preço em Valtheris até a chuva de Veyra
  assert.ok(reaches(dry, dry.factIndex['preco:veyra:grao'], (l) => l.startsWith('Colheita em Veyra')), 'preço → colheita');
  assert.ok(reaches(dry, dry.factIndex['colheita:veyra'], (_l, k) => k.startsWith('chuva:veyra')), 'colheita → chuva');
});

test('cadeia: imposto alto → humor pior → inquietação, e os Fios apontam o decreto', () => {
  const base = fresh(21);
  const taxed = fresh(21);
  assert.equal(issue(taxed, { decree: { verb: 'taxar', prov: 'caldris', rate: 0.3 }, publico: true }), null);
  months(base, 4); months(taxed, 4);
  assert.ok(lowerHumor(taxed.provinces.caldris) < lowerHumor(base.provinces.caldris) - 10);
  assert.ok(reaches(taxed, taxed.factIndex['humor:caldris:camponeses'], (_l, k) => k === 'decreto:taxar:caldris'), 'humor → decreto');
  // a casa local também se ressente
  assert.ok(taxed.groups['casa:caldran'].acceptance < base.groups['casa:caldran'].acceptance);
});

test('o pão do rei alivia a fome onde chega', () => {
  const a = fresh(11), b = fresh(11);
  for (const w of [a, b]) months(w, 1);
  b.granary = 40000;
  assert.equal(issue(b, { decree: { verb: 'distribuir_grao', prov: 'dornhelm', qty: 30000 }, publico: true }), null);
  months(a, 2); months(b, 2);
  assert.ok(lowerHumor(b.provinces.dornhelm) > lowerHumor(a.provinces.dornhelm));
});

test('ordens viajam: o decreto só vale quando chega', () => {
  const w = fresh(4);
  issue(w, { decree: { verb: 'tarifa', rate: 0.05 }, publico: true });
  assert.equal(w.port.tariff, 0.15);
  const o = w.orders[0];
  stepDays(w, o.arrives - w.day + 1);
  assert.equal(w.port.tariff, 0.05);
});

test('pagar o soldo de Rhovan melhora a moral e a opinião do exército', () => {
  const a = fresh(8), b = fresh(8);
  assert.equal(issue(b, { decree: { verb: 'pagar_soldo', prov: 'rhovan', share: 1 }, publico: true }), null);
  months(a, 3); months(b, 3);
  assert.ok(b.provinces.rhovan.garrison.morale > a.provinces.rhovan.garrison.morale);
  assert.ok(b.groups.exercito.acceptance > a.groups.exercito.acceptance);
});

test('o tesouro fecha: saldo = saldo anterior + receitas - despesas', () => {
  const w = fresh(31);
  months(w, 3);
  const f = w.facts[w.factIndex['tesouro']];
  const sum = f.factors.reduce((a, x) => a + (x.amount ?? 0), 0);
  assert.ok(Math.abs(sum - w.treasury.coin) < 1, `${sum} vs ${w.treasury.coin}`);
});
