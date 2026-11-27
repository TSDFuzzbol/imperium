// População: nascimentos, mortes, migração, humor, memória coletiva, inquietação e guarnições.
import { GOOD_DATA, PROV_DATA, ROADS, STRATUM_NAMES } from '../../data/eldoria';
import { chron, clamp, decayMemory, fact, latest, remember, sum } from '../core';
import { PROVS, STRATA } from '../types';
import type { FactFactor, Province, ProvId, StratumId, UnrestLevel, World } from '../types';
import type { Cycle } from './economy';
import { fmt } from './economy';

const LOWER: StratumId[] = ['camponeses', 'artesaos'];

export function lowerHumor(p: Province) {
  const a = p.strata.camponeses, b = p.strata.artesaos;
  return (a.humor * a.pop + b.humor * b.pop) / Math.max(1, a.pop + b.pop);
}
export function lowerHunger(p: Province) {
  const a = p.strata.camponeses, b = p.strata.artesaos;
  return (a.hunger * a.pop + b.hunger * b.pop) / Math.max(1, a.pop + b.pop);
}
export function totalPop(p: Province) {
  return sum(STRATA.map((s) => p.strata[s].pop));
}

function attract(p: Province, mi: number) {
  const tax = p.exemptUntilMonth >= mi ? 0 : p.taxRate;
  const u = p.unrest === 'revolta' ? -0.35 : p.unrest === 'motins' ? -0.15 : 0;
  return -2.5 * lowerHunger(p) - 1.5 * Math.max(0, tax - 0.1) + lowerHumor(p) / 200 + u;
}

export function demography(w: World, c: Cycle) {
  const migr: Record<ProvId, FactFactor[]> = Object.fromEntries(PROVS.map((p) => [p, []])) as unknown as Record<ProvId, FactFactor[]>;
  const delta: Record<ProvId, Record<StratumId, number>> = {} as never;
  for (const id of PROVS) delta[id] = { camponeses: 0, artesaos: 0, mercadores: 0, clero: 0, nobreza: 0 };
  // migração pelas estradas
  for (const [a, b] of ROADS) {
    const A = w.provinces[a], B = w.provinces[b];
    const diff = attract(B, c.mi) - attract(A, c.mi);
    const [from, to, F] = diff > 0 ? [a, b, A] : [b, a, B];
    const gap = Math.abs(diff) - 0.08;
    if (gap <= 0) continue;
    let moved = 0;
    for (const s of LOWER) {
      const n = Math.min(F.strata[s].pop * 0.012 * gap, F.strata[s].pop * 0.03);
      delta[from][s] -= n; delta[to][s] += n; moved += n;
    }
    if (moved >= 50) {
      migr[from].push({ label: `Partiram para ${PROV_DATA[to].name}`, amount: -moved, ref: latest(w, `fome:${from}:camponeses`) });
      migr[to].push({ label: `Chegaram de ${PROV_DATA[from].name}`, amount: moved });
    }
  }
  for (const id of PROVS) {
    const p = w.provinces[id];
    let births = 0, deaths = 0, famine = 0;
    for (const s of STRATA) {
      const st = p.strata[s];
      const b = st.pop * 0.0031 * (1 - 0.8 * st.hunger);
      const d = st.pop * 0.0026;
      const f = st.pop * 0.045 * Math.pow(st.hunger, 1.4);
      births += b; deaths += d; famine += f;
      st.pop = Math.max(0, st.pop + b - d - f + delta[id][s]);
    }
    const net = sum(migr[id].map((m) => m.amount ?? 0));
    fact(w, `pop:${id}`, `População de ${PROV_DATA[id].name}`, [
      { label: 'Nascimentos', amount: births },
      { label: 'Mortes comuns', amount: -deaths },
      { label: 'Mortes pela fome', amount: -famine, ref: famine > 1 ? latest(w, `fome:${id}:camponeses`) : undefined },
      ...migr[id],
    ], { value: totalPop(p), unit: 'pessoas', source: 'registros das paróquias' });
    if (famine > 400) {
      chron(w, {
        kind: 'povo', prov: id, weight: famine > 2500 ? 3 : 2, fact: latest(w, `pop:${id}`),
        title: `Morre-se de fome em ${PROV_DATA[id].name}`,
        text: `As paróquias de ${PROV_DATA[id].name} registram cerca de ${fmt(famine)} mortes pela fome neste mês. O grão custa ${p.price.grao.toFixed(2)} coroas a saca.`,
      });
      remember(p.grievances, { id: 'mortosfome', label: 'Nossos mortos de fome', weight: -Math.min(25, famine / 200), decay: 0.05, strata: LOWER, fact: latest(w, `pop:${id}`) });
    }
    if (net < -1500) {
      chron(w, { kind: 'povo', prov: id, weight: 1, fact: latest(w, `pop:${id}`), title: `Famílias deixam ${PROV_DATA[id].name}`, text: `Cerca de ${fmt(-net)} pessoas pegaram a estrada neste mês, atrás de pão mais barato ou de impostos menores.` });
    }
  }
}

const BASE_HUMOR: Record<StratumId, number> = { camponeses: 6, artesaos: 6, mercadores: 6, clero: 2, nobreza: 2 };

export function mood(w: World, c: Cycle) {
  for (const id of PROVS) {
    const p = w.provinces[id];
    decayMemory(p.grievances);
    const exempt = p.exemptUntilMonth >= c.mi;
    for (const s of STRATA) {
      const st = p.strata[s];
      const parts: FactFactor[] = [];
      const add = (label: string, amount: number, ref?: string) => { if (Math.abs(amount) >= 0.5 || ref) parts.push({ label, amount, ref }); };
      add('Ânimo de base', BASE_HUMOR[s]);
      add('Fome', -140 * st.hunger, st.hunger > 0.005 ? latest(w, `fome:${id}:${s === 'camponeses' || s === 'artesaos' ? s : 'camponeses'}`) : undefined);
      add('Falta de sal, lenha, ferro e roupa', (s === 'camponeses' ? -12 : -22) * st.lack);
      if (s !== 'clero' && s !== 'nobreza') {
        if (exempt) add('Isenção de impostos', 8, latest(w, `decreto:isentar:${id}`));
        else add(`Imposto de ${Math.round(p.taxRate * 100)}%`, -250 * Math.max(0, p.taxRate - 0.06), latest(w, `decreto:taxar:${id}`));
      }
      if (s === 'camponeses' || s === 'artesaos') add('Medo do preço do pão', -Math.min(25, 30 * Math.max(0, p.price.grao / GOOD_DATA.grao.base - 1.2)), latest(w, `preco:${id}:grao`));
      if (s === 'mercadores') {
        if (id === 'altamar') add(`Tarifa do porto em ${Math.round(w.port.tariff * 100)}%`, -220 * (w.port.tariff - 0.06), latest(w, 'decreto:tarifa'));
        add(`Pedágios de Merovan em ${Math.round(w.tolls * 100)}%`, -150 * (w.tolls - 0.04) * (id === 'merovan' ? 1 : 0.4), latest(w, 'decreto:pedagio'));
        if (w.liga.privilegeUntilMonth >= c.mi) add('Privilégios da Liga (concorrência desleal para quem não é membro)', -6, latest(w, 'decreto:credito_liga'));
      }
      if (s === 'nobreza') {
        const h = w.groups[`casa:${PROV_DATA[id].house}`];
        add('Atitude da casa local', h.acceptance / 4, latest(w, `grupo:${h.id}`));
      }
      if (s === 'clero') add('Atitude da Ordem da Fé', w.groups.igreja.acceptance / 4, latest(w, 'grupo:igreja'));
      for (const g of p.grievances) if (g.strata.includes(s)) add(g.label, g.weight, g.fact);
      const target = clamp(sum(parts.map((x) => x.amount ?? 0)), -100, 100);
      const old = st.humor;
      st.humor = clamp(old + 0.4 * (target - old), -100, 100);
      fact(w, `humor:${id}:${s}`, `Humor: ${STRATUM_NAMES[s].toLowerCase()} de ${PROV_DATA[id].name}`, [
        { label: 'Humor do mês anterior (o humor muda aos poucos)', amount: 0.6 * old },
        ...parts.map((x) => ({ ...x, amount: (x.amount ?? 0) * 0.4 })),
      ], { value: st.humor, unit: 'humor', source: 'conversas nas tavernas e paróquias' });
    }
  }
}

const NEXT: Record<UnrestLevel, string> = { calma: 'calma', tensa: 'tensão', motins: 'motins', revolta: 'revolta' };

export function unrest(w: World) {
  for (const id of PROVS) {
    const p = w.provinces[id];
    const H = lowerHumor(p);
    const before = p.unrest;
    if (H < -45) p.unrestMonths += 1; else p.unrestMonths = Math.max(0, p.unrestMonths - 1);
    let lv = p.unrest;
    if (lv === 'revolta') { if (H > -50) lv = 'motins'; }
    else if (lv === 'motins') { if (H <= -65 && p.unrestMonths >= 3) lv = 'revolta'; else if (H > -35) lv = 'tensa'; }
    else if (H <= -45 && p.unrestMonths >= 2) lv = 'motins';
    else lv = H < -20 ? 'tensa' : 'calma';
    p.unrest = lv;
    const hf = fact(w, `inquietacao:${id}`, `Ordem em ${PROV_DATA[id].name}: ${NEXT[lv]}`, [
      { label: 'Humor dos camponeses', amount: p.strata.camponeses.humor, ref: latest(w, `humor:${id}:camponeses`) },
      { label: 'Humor dos artesãos', amount: p.strata.artesaos.humor, ref: latest(w, `humor:${id}:artesaos`) },
      { label: `Meses seguidos com humor abaixo de -45: ${p.unrestMonths}` },
    ], { value: H, unit: 'humor', source: 'intendente' });
    if (lv !== before) {
      const name = PROV_DATA[id].name;
      if (lv === 'motins') {
        p.stock.grao *= 0.95;
        chron(w, { kind: 'povo', prov: id, weight: 3, fact: hf, title: `Motins em ${name}`, text: `Multidões arrombaram celeiros e apedrejaram coletores de impostos em ${name}. O intendente pede ordens.` });
        w.pauseRequest = `Motins em ${name}`;
      } else if (lv === 'revolta') {
        chron(w, { kind: 'povo', prov: id, weight: 3, fact: hf, title: `${name} em revolta`, text: `${name} não reconhece mais os coletores da Coroa. As estradas foram fechadas e ninguém paga imposto.` });
        w.pauseRequest = `${name} em revolta`;
      } else if (before === 'revolta' || before === 'motins') {
        chron(w, { kind: 'povo', prov: id, weight: 2, fact: hf, title: `A ordem volta a ${name}`, text: `Os ânimos esfriaram em ${name}. A situação ainda é de ${NEXT[lv]}.` });
      }
    }
  }
}

export function garrisons(w: World) {
  const cav = w.sovereign.oficio === 'cavalarico' ? 0.05 : 0;
  for (const id of PROVS) {
    const p = w.provinces[id];
    const g = p.garrison;
    if (g.soldiers <= 0) continue;
    const hunger = p.strata.camponeses.hunger * (g.monthsUnpaid > 0 ? 0.3 : 0.6);
    const target = clamp(0.72 + cav - 0.11 * g.monthsUnpaid - 0.25 * hunger - (w.groups.exercito.rung >= 2 ? 0.05 : 0), 0.05, 0.95);
    const old = g.morale;
    g.morale = clamp(old + 0.35 * (target - old), 0, 1);
    let deserted = 0;
    if (g.morale < 0.35) {
      deserted = Math.round(g.soldiers * (0.4 - g.morale) * 0.08);
      g.soldiers -= deserted;
      p.strata.camponeses.pop += deserted;
    }
    const gf = fact(w, `guarnicao:${id}`, `Moral da guarnição de ${PROV_DATA[id].name}`, [
      { label: 'Moral do mês anterior', amount: 0.65 * old },
      { label: 'Base', amount: 0.35 * (0.72 + cav) },
      { label: `${g.monthsUnpaid} meses de soldo atrasado`, amount: -0.35 * 0.11 * g.monthsUnpaid, ref: latest(w, 'tesouro') },
      { label: 'Fome na província', amount: -0.35 * 0.25 * hunger },
      ...(deserted ? [{ label: `Desertaram ${deserted} soldados`, amount: -deserted }] : []),
    ], { value: g.morale, unit: 'moral', source: `comandante de ${PROV_DATA[id].name}` });
    if (deserted > 40) {
      chron(w, { kind: 'guerra', prov: id, weight: 2, fact: gf, title: `Deserções em ${PROV_DATA[id].name}`, text: `${deserted} soldados largaram as lanças e voltaram para casa. Os que ficaram dizem que não se serve de graça.` });
    }
  }
}
