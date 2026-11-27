// Testes de longa duração: o motor aguenta um reinado longo sem quebrar?
// Estratégia em docs/testing/ESTRATEGIA.md. Não testam regras de design (que ainda são PROPOSTA),
// só integridade técnica: números válidos, Fios íntegros, determinismo e orçamento de tempo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay } from '../src/engine/sim';
import { GOODS, PROVS, STRATA } from '../src/engine/types';
import type { World } from '../src/engine/types';

const YEARS = 10;

function fresh(seed: number) {
  const w = createWorld(seed);
  bootstrap(w);
  return w;
}

function checkInvariants(w: World, where: string) {
  for (const id of PROVS) {
    const p = w.provinces[id];
    for (const s of STRATA) {
      const st = p.strata[s];
      assert.ok(Number.isFinite(st.pop) && st.pop >= 0, `${where}: pop ${id}/${s} = ${st.pop}`);
      assert.ok(st.humor >= -100 && st.humor <= 100, `${where}: humor ${id}/${s} = ${st.humor}`);
      assert.ok(Number.isFinite(st.wealth), `${where}: riqueza ${id}/${s}`);
      assert.ok(st.hunger >= 0 && st.hunger <= 1, `${where}: fome ${id}/${s} = ${st.hunger}`);
    }
    for (const g of GOODS) {
      assert.ok(Number.isFinite(p.stock[g]) && p.stock[g] >= -1e-6, `${where}: estoque ${id}/${g} = ${p.stock[g]}`);
      assert.ok(Number.isFinite(p.price[g]) && p.price[g] > 0, `${where}: preço ${id}/${g} = ${p.price[g]}`);
    }
    assert.ok(p.garrison.soldiers >= 0 && p.garrison.morale >= 0 && p.garrison.morale <= 1, `${where}: guarnição ${id}`);
  }
  assert.ok(Number.isFinite(w.treasury.coin) && w.treasury.coin >= -1e-6, `${where}: tesouro = ${w.treasury.coin}`);
  assert.ok(Number.isFinite(w.treasury.debt) && w.treasury.debt >= 0, `${where}: dívida = ${w.treasury.debt}`);
  for (const g of Object.values(w.groups)) {
    assert.ok(g.acceptance >= -100 && g.acceptance <= 100, `${where}: aceitação ${g.id} = ${g.acceptance}`);
  }
}

/** Todo fio citado pela Crônica, pelo índice ou por outro fato existe (a poda não deixa fio solto). */
function checkThreads(w: World, where: string) {
  for (const [key, id] of Object.entries(w.factIndex)) assert.ok(w.facts[id], `${where}: índice ${key} aponta para fato podado`);
  for (const f of Object.values(w.facts)) {
    for (const x of f.factors) if (x.ref) assert.ok(w.facts[x.ref], `${where}: fato ${f.id} (${f.label}) aponta para ${x.ref}, que sumiu`);
  }
}

test(`reinado de ${YEARS} anos sem intervenção: invariantes e Fios íntegros (3 sementes)`, () => {
  for (const seed of [3, 7, 11]) {
    const w = fresh(seed);
    for (let d = 0; d < YEARS * 360; d++) {
      stepDay(w);
      if (d % 90 === 89) {
        checkInvariants(w, `semente ${seed}, dia ${w.day}`);
        checkThreads(w, `semente ${seed}, dia ${w.day}`);
      }
    }
  }
});

test(`determinismo em ${YEARS} anos: mesma semente, mesmo mundo`, () => {
  const a = fresh(2026), b = fresh(2026);
  for (let d = 0; d < YEARS * 360; d++) { stepDay(a); stepDay(b); }
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('orçamento de tempo: um ano de jogo simula em menos de 1 segundo', () => {
  // Folgado de propósito: hoje leva cerca de 50 ms num servidor. Serve para pegar regressões grandes.
  const w = fresh(7);
  const t = performance.now();
  for (let d = 0; d < 360; d++) stepDay(w);
  const ms = performance.now() - t;
  assert.ok(ms < 1000, `um ano levou ${ms.toFixed(0)} ms`);
});

// Problema conhecido (docs/testing/RESULTADOS.md): o salvamento cresce cerca de 500 KB por ano de jogo,
// porque os Fios guardados pela memória dos grupos e províncias não param de acumular.
// O limite exato é decisão técnica do módulo "Persistência e orçamento dos Fios" (docs/development/ROADMAP.md).
test.todo('o salvamento de um reinado de 30 anos cabe num orçamento fixo');
