import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/engine/world';
import { bootstrap, stepDay, stepDays } from '../src/engine/sim';
import { issue, POSTPONE_DAYS } from '../src/engine/decrees';
import type { World } from '../src/engine/types';

const open = (w: World, topic: string) => w.dispatches.filter((d) => !d.answered && d.topic === topic);

/** Avança até aparecer uma audiência do tópico (ou desiste). */
function until(w: World, topic: string, max = 200) {
  for (let i = 0; i < max && !open(w, topic).length; i++) stepDay(w);
  return open(w, topic)[0];
}

test('Veyra não volta a pedir audiência pela colheita depois de respondida', () => {
  for (const seed of [1, 2, 3, 7]) {
    const w = createWorld(seed);
    bootstrap(w);
    const d = until(w, 'colheita');
    if (!d) continue; // nesta semente a previsão foi boa
    assert.equal(issue(w, { decree: { verb: 'esperar', dispatch: d.id }, publico: true }), null);
    let again = 0;
    for (let i = 0; i < 200; i++) { stepDay(w); if (open(w, 'colheita').length) again++; }
    assert.equal(again, 0, `semente ${seed}: a colheita voltou a pedir audiência`);
  }
});

test('adiar esconde a audiência por alguns dias, empurra o prazo e só vale uma vez', () => {
  const w = createWorld(5);
  bootstrap(w);
  const d = w.dispatches.find((x) => !x.answered)!;
  const exp = d.expires;
  assert.equal(issue(w, { decree: { verb: 'adiar', dispatch: d.id }, publico: true }), null);
  assert.equal(d.hiddenUntil, w.day + POSTPONE_DAYS);
  assert.equal(d.expires, exp + POSTPONE_DAYS);
  assert.ok(issue(w, { decree: { verb: 'adiar', dispatch: d.id }, publico: true }), 'adiar duas vezes deveria falhar');
  stepDays(w, POSTPONE_DAYS);
  assert.ok(!d.answered && (d.hiddenUntil ?? 0) <= w.day, 'volta ao Salão depois do prazo');
});

test('dispensar encerra na hora, ofende um pouco e não repete o pedido logo em seguida', () => {
  const w = createWorld(5);
  bootstrap(w);
  const d = w.dispatches.find((x) => !x.answered && x.group)!;
  const before = w.groups[d.group!].memory.length;
  assert.equal(issue(w, { decree: { verb: 'dispensar', dispatch: d.id }, publico: true }), null);
  assert.ok(d.answered);
  assert.ok(w.groups[d.group!].memory.length >= before);
  assert.ok(w.groups[d.group!].memory.some((m) => m.id === 'dispensado'));
  stepDays(w, 30);
  assert.equal(open(w, d.topic!).length, 0);
});
