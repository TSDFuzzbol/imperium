import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, DEFAULT_SOVEREIGN } from '../src/engine/world';
import { bootstrap, stepDays } from '../src/engine/sim';
import { baseSkills, chanceOf, dispatchChecks, FREE_POINTS } from '../src/engine/skills';
import { issue } from '../src/engine/decrees';

test('chance: mais habilidade nunca diminui a chance; nunca 0% nem 100%', () => {
  for (let dc = 4; dc <= 18; dc++) {
    let prev = 0;
    for (let s = 1; s <= 6; s++) {
      const c = chanceOf(s, 0, dc);
      assert.ok(c >= prev - 1e-9);
      assert.ok(c >= 0.03 && c <= 0.97);
      prev = c;
    }
  }
  assert.equal(Math.round(chanceOf(3, 0, 10) * 100), 58);
});

test('base do ofício: copista começa forte em Tinta e Pó', () => {
  const b = baseSkills('copista', 'verdade');
  assert.equal(b.tinta, 4);
  assert.equal(Object.values(b).reduce((a, x) => a + x, 0), 12 + 4 + 1);
  assert.ok(FREE_POINTS > 0);
});

test('audiências trazem vozes e testes; um teste muda o mundo e não se repete', () => {
  const w = createWorld(5);
  bootstrap(w);
  const soldo = w.dispatches.find((d) => d.id.startsWith('d:soldo'))!;
  assert.ok(Array.isArray(soldo.voices));
  const checks = dispatchChecks(w, soldo);
  assert.equal(checks.length, 1);
  const before = JSON.stringify(w.groups.exercito.memory);
  assert.equal(issue(w, { decree: { verb: 'persuadir', dispatch: soldo.id, check: checks[0].id }, publico: true }), null);
  assert.notEqual(JSON.stringify(w.groups.exercito.memory), before);
  assert.ok(w.lastCheck && w.lastCheck.skill === 'lingua');
  assert.equal(dispatchChecks(w, soldo).length, 0);
  assert.ok(issue(w, { decree: { verb: 'persuadir', dispatch: soldo.id, check: checks[0].id }, publico: true }));
});

test('testes são determinísticos pela semente', () => {
  const run = () => {
    const w = createWorld(9, { ...DEFAULT_SOVEREIGN, oficio: 'copista' });
    bootstrap(w);
    for (const d of [...w.dispatches]) for (const c of dispatchChecks(w, d)) issue(w, { decree: { verb: 'persuadir', dispatch: d.id, check: c.id }, publico: true });
    stepDays(w, 60);
    return JSON.stringify([w.treasury.coin, w.chronicle.map((c) => c.title)]);
  };
  assert.equal(run(), run());
});
