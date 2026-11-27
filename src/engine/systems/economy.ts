// Clima, produção, renda, comércio, consumo e preços. Fórmulas: PROPOSTA (ver ESPEC_FUNDACAO.md).
import {
  CROWN_LANDS, GOOD_DATA, GROW_MONTHS, HARVEST_MONTHS, NEEDS, PROV_DATA, RENT, ROADS, SECTOR_OUTPUT,
  SOLDIER_NEEDS, TITHE, WEAVE_RATE,
} from '../../data/eldoria';
import { clamp, dateOf, fact, latest, monthIndex, remember, sum } from '../core';
import { chance, gauss, range } from '../rng';
import { GOODS, PROVS, STRATA } from '../types';
import { skillOf } from '../skills';
import type { FactFactor, GoodId, Province, ProvId, Sector, StratumId, World } from '../types';

export interface Cycle {
  month: number; // mês do calendário que está fechando (1..12)
  mi: number; // índice absoluto do mês
  tax: Record<ProvId, number>;
  taxFact: Record<ProvId, string>;
  tolls: number;
  tariffs: number;
  tollFacts: FactFactor[];
  tariffFacts: FactFactor[];
  stockStart: Record<ProvId, number>;
  grainParts: Record<ProvId, FactFactor[]>;
}

/** Fração do pão dos camponeses que vem da própria roça, sem passar pelo mercado. PROPOSTA. */
export function selfShare(id: ProvId) {
  const d = PROV_DATA[id];
  return clamp(((d.sectors.agri ?? 0) * d.grainYield) / 1.2, 0, 0.85);
}

export const TOOLS_PER_PEASANT = 0.0018;
export const UNREST_PROD: Record<Province['unrest'], number> = { calma: 1, tensa: 0.97, motins: 0.85, revolta: 0.6 };

export function newCycle(w: World): Cycle {
  const z = () => Object.fromEntries(PROVS.map((p) => [p, 0])) as Record<ProvId, number>;
  const parts = Object.fromEntries(PROVS.map((p) => [p, [] as FactFactor[]])) as Record<ProvId, FactFactor[]>;
  return {
    month: dateOf(w.day).month, mi: monthIndex(w.day), tax: z(), taxFact: {} as Record<ProvId, string>,
    tolls: 0, tariffs: 0, tollFacts: [], tariffFacts: [],
    stockStart: Object.fromEntries(PROVS.map((p) => [p, w.provinces[p].stock.grao])) as Record<ProvId, number>,
    grainParts: parts,
  };
}

// ---------------- Clima ----------------
export function climate(w: World, c: Cycle) {
  const nat = 0.45 * gauss(w.rng);
  for (const id of PROVS) {
    const p = w.provinces[id];
    const prev = p.rain;
    // 1427: o ano seco que o intendente de Veyra teme (viés, não certeza). PROPOSTA ligada à crise inicial.
    const bias = id === 'veyra' && dateOf(w.day).year === 1427 ? -0.18 : 0;
    const local = 0.32 * gauss(w.rng) + bias;
    p.rain = clamp(0.6 * prev + 0.25 * nat + local, -1, 1);
    const word = p.rain < -0.45 ? 'seca' : p.rain < -0.15 ? 'tempo seco' : p.rain > 0.45 ? 'chuvas fortes' : p.rain > 0.15 ? 'chuvoso' : 'tempo normal';
    const fid = fact(w, `chuva:${id}:${c.month}`, `Chuva em ${PROV_DATA[id].name}: ${word}`, [
      { label: 'Tendência do mês anterior', amount: 0.6 * prev },
      { label: 'Clima do reino inteiro', amount: 0.25 * nat },
      { label: 'Variação local', amount: local },
    ], { value: p.rain, unit: 'anomalia', source: 'observação dos camponeses' });
    w.factIndex[`chuva:${id}`] = fid;
    if (GROW_MONTHS.includes(c.month)) p.growRain.push(p.rain);
    if (c.month >= 5 && c.month <= 7 && !p.blight && chance(w.rng, id === 'veyra' ? 0.035 : 0.02)) {
      p.blight = true;
      const bf = fact(w, `praga:${id}`, `Praga nos campos de ${PROV_DATA[id].name}`, [{ label: 'Ferrugem nas espigas', note: 'acaso do ano' }], { source: 'intendente' });
      w.chronicle.push({ id: `c${++w.seq}`, day: w.day, kind: 'clima', title: `Praga em ${PROV_DATA[id].name}`, text: `A ferrugem apareceu nas espigas de ${PROV_DATA[id].name}. Os camponeses queimam os talos doentes, mas parte da colheita está perdida.`, prov: id, fact: bf, weight: 2 });
    }
  }
}

export function harvestFactor(p: Province) {
  const g = p.growRain.length ? sum(p.growRain) / p.growRain.length : 0;
  return clamp(1 + 0.55 * g, 0.4, 1.22) * (p.blight ? 0.72 : 1);
}

// ---------------- Produção e renda ----------------
export function production(w: World, c: Cycle) {
  const veyraWas = w.provinces.veyra.lastHarvestFactor;
  for (const id of PROVS) {
    const p = w.provinces[id];
    const d = PROV_DATA[id];
    const C = p.strata.camponeses.pop;
    const mUnrest = UNREST_PROD[p.unrest];
    const mTools = 0.88 + 0.12 * p.toolsMet;
    const mHunger = 1 - 0.4 * p.strata.camponeses.hunger;
    const mult = mUnrest * mTools * mHunger;
    const out: Record<GoodId, number> = { grao: 0, sal: 0, la: 0, tecido: 0, ferro: 0, madeira: 0 };
    const multFactors: FactFactor[] = [
      { label: 'Ferramentas (ferro)', amount: mTools - 1, note: `${Math.round(p.toolsMet * 100)}% do ferro necessário` },
      { label: 'Camponeses enfraquecidos pela fome', amount: mHunger - 1 },
      { label: `Inquietação (${p.unrest})`, amount: mUnrest - 1 },
    ];
    // colheita
    const hShare = HARVEST_MONTHS[c.month] ?? 0;
    let harvestFid: string | undefined;
    if (hShare > 0) {
      if (c.month === 8) p.lastHarvestFactor = harvestFactor(p);
      const hf = p.lastHarvestFactor;
      const q = C * (d.sectors.agri ?? 0) * d.grainYield * hShare * hf * mult;
      out.grao += q;
      const rainRefs: FactFactor[] = GROW_MONTHS.map((m, i) => ({
        label: `Chuva em ${['', '', '', 'março', 'abril', 'maio', 'junho', 'julho'][m]}`,
        amount: p.growRain[i] !== undefined ? 0.55 * p.growRain[i] / Math.max(1, p.growRain.length) : undefined,
        ref: latest(w, `chuva:${id}:${m}`),
      }));
      if (p.blight) rainRefs.push({ label: 'Praga', amount: -0.28, ref: latest(w, `praga:${id}`) });
      harvestFid = fact(w, `colheita:${id}`, `Colheita em ${d.name}: ${Math.round(hf * 100)}% do normal`, [...rainRefs, ...multFactors], {
        value: q, unit: 'sacas', source: 'intendente',
      });
    }
    for (const [sec, share] of Object.entries(d.sectors) as [Sector, number][]) {
      if (sec === 'agri') continue;
      for (const [g, rate] of Object.entries(SECTOR_OUTPUT[sec]) as [GoodId, number][]) out[g] += C * share * rate * mult;
    }
    // tecelagem: artesãos transformam lã em tecido
    const weavers = p.strata.artesaos.pop * d.weave;
    const tecido = Math.min(weavers * WEAVE_RATE * mUnrest, p.stock.la);
    p.stock.la -= tecido;
    const laCost = tecido * p.price.la;
    out.tecido += tecido;

    // valor e repartição
    // A renda rural é distribuída ao longo do ano (o camponês vive do que guardou da colheita):
    // valor da colheita anual / 12 + o que os outros setores produzem no mês. PROPOSTA.
    const yearGrain = C * (d.sectors.agri ?? 0) * d.grainYield * p.lastHarvestFactor * mult;
    const ruralValue = (yearGrain / 12) * p.price.grao
      + sum((['grao', 'sal', 'la', 'ferro', 'madeira'] as GoodId[]).map((g) => (out[g] - (g === 'grao' ? (hShare > 0 ? C * (d.sectors.agri ?? 0) * d.grainYield * hShare * p.lastHarvestFactor * mult : 0) : 0)) * p.price[g]));
    const craftValue = Math.max(0, tecido * p.price.tecido - laCost);
    // ferramentas: o campo consome ferro como insumo, pago com o valor da produção. PROPOSTA.
    const toolsNeed = C * TOOLS_PER_PEASANT;
    const toolsUsed = Math.min(p.stock.ferro, toolsNeed);
    p.stock.ferro -= toolsUsed;
    p.toolsMet = toolsNeed > 0 ? toolsUsed / toolsNeed : 1;
    const toolsCost = toolsUsed * p.price.ferro;
    for (const g of GOODS) p.stock[g] += out[g];
    c.grainParts[id].push({ label: hShare > 0 ? 'Colheita do mês' : 'Pesca, pasto e caça', amount: out.grao, ref: harvestFid });

    const base = ruralValue + craftValue;
    fact(w, `producao:${id}`, `Produção de ${d.name}`, [
      ...GOODS.filter((g) => out[g] > 0).map((g) => ({ label: `${GOOD_DATA[g].name}: ${fmt(out[g])} ${GOOD_DATA[g].unit}`, amount: out[g] * p.price[g] })),
      ...multFactors.map((f) => ({ ...f, amount: f.amount ? f.amount * ruralValue : 0 })),
    ], { value: base, unit: 'coroas', source: 'intendente' });
    const exempt = p.exemptUntilMonth >= c.mi;
    const rate = exempt || p.unrest === 'revolta' ? 0 : p.taxRate;
    const house = w.groups[`casa:${d.house}`];
    const houseKeep = house.rung >= 2 ? 0.75 : 1;
    const unrestEff = p.unrest === 'motins' ? 0.7 : 1;
    const adminEff = w.treasury.adminArrears > 0 ? 0.85 : 1;
    const skill = 0.008 * (skillOf(w, 'tinta') - 1); // Tinta e Pó: menos desvio na coleta
    const eff = clamp(0.9 + skill, 0, 1) * houseKeep * unrestEff * adminEff;
    const due = base * rate;
    const collected = due * eff;
    c.tax[id] = collected;
    c.taxFact[id] = fact(w, `imposto:${id}`, `Imposto arrecadado em ${d.name}`, [
      { label: 'Valor da produção tributável', amount: base, note: 'coroas', ref: latest(w, `producao:${id}`) },
      { label: exempt ? 'Isenção por decreto' : p.unrest === 'revolta' ? 'Província em revolta: ninguém paga' : `Alíquota de ${Math.round(p.taxRate * 100)}%`, amount: due },
      { label: 'Perdas na coleta (desvios e atrasos)', amount: -due * (1 - clamp(0.9 + skill, 0, 1)) },
      { label: `${house.id === 'casa:rhovar' ? 'Casa Rhovar' : 'A casa local'} retém parte da coleta`, amount: houseKeep < 1 ? -due * 0.9 * 0.25 : 0, ref: houseKeep < 1 ? latest(w, `grupo:${house.id}`) : undefined },
      { label: 'Motins atrapalham os coletores', amount: unrestEff < 1 ? -due * 0.9 * houseKeep * 0.3 : 0, ref: unrestEff < 1 ? latest(w, `inquietacao:${id}`) : undefined },
      { label: 'Administração sem pagamento', amount: adminEff < 1 ? -collected * 0.15 / 0.85 : 0 },
    ], { value: collected, unit: 'coroas', source: skillOf(w, 'tinta') >= 4 ? 'livros do tesouro, conferidos por você' : 'livros do tesouro' });

    // renda
    const tithe = ruralValue * TITHE;
    const rent = ruralValue * RENT;
    p.strata.clero.income = tithe;
    p.strata.nobreza.income = rent * 0.7;
    house.wealth += rent * 0.3;
    const ownBread = C * 0.1 * selfShare(id) * p.price.grao; // o que eles mesmos comem não vira dinheiro
    const peasantsNet = Math.max(0, ruralValue * (1 - rate * eff) - tithe - rent - ownBread - toolsCost);
    const craftNet = craftValue * (1 - rate * eff);
    // camponeses compram ofícios e serviços dos artesãos da província
    const crafts = peasantsNet * 0.08;
    p.strata.camponeses.income = peasantsNet - crafts;
    // a elite gasta parte da riqueza em serviços
    const eliteSpend = (p.strata.nobreza.wealth + p.strata.clero.wealth + p.strata.mercadores.wealth) * 0.03;
    for (const s of ['nobreza', 'clero', 'mercadores'] as StratumId[]) p.strata[s].wealth *= 0.97;
    const crownSpend = id === 'valtheris' ? 6000 + 4000 : 0; // corte e administração central circulam na capital
    p.strata.artesaos.income = craftNet + crafts + eliteSpend + crownSpend;
    p.strata.mercadores.income = 0; // vem do comércio e do varejo, abaixo
    for (const s of STRATA) p.strata[s].wealth += p.strata[s].income;
  }
  if (c.month === 8) {
    const hf = w.provinces.veyra.lastHarvestFactor;
    const wf = latest(w, 'colheita:veyra');
    w.chronicle.push({
      id: `c${++w.seq}`, day: w.day, kind: 'clima', prov: 'veyra', fact: wf, weight: hf < 0.85 || hf > 1.1 ? 3 : 2,
      title: hf < 0.85 ? 'Colheita fraca em Veyra' : hf > 1.1 ? 'Colheita farta em Veyra' : 'Começa a colheita em Veyra',
      text: hf < 0.85 ? `As foices encontram espigas ralas. Os intendentes estimam ${Math.round(hf * 100)}% de uma colheita normal, e os mercadores já sobem o preço antes da última carroça chegar.` : `Os campos de Veyra rendem ${Math.round(hf * 100)}% do que rendem em ano comum.`,
    });
    void veyraWas;
  }
  if (c.month === 10) for (const id of PROVS) { w.provinces[id].growRain = []; w.provinces[id].blight = false; }
}

// ---------------- Comércio ----------------
const WEIGHT: Record<GoodId, number> = { grao: 0.07, sal: 0.05, la: 0.06, tecido: 0.035, ferro: 0.08, madeira: 0.12 };
const ROAD_CAP: Record<GoodId, number> = { grao: 26000, sal: 2500, la: 5000, tecido: 2500, ferro: 3000, madeira: 9000 };

const PORT_CAP: Record<GoodId, number> = { grao: 9000, sal: 2000, la: 3000, tecido: 1500, ferro: 1200, madeira: 4000 };

export function trade(w: World, c: Cycle) {
  w.flows = [];
  for (const id of PROVS) for (const g of GOODS) { w.provinces[id].tradeIn[g] = 0; w.provinces[id].tradeOut[g] = 0; }
  const price0 = Object.fromEntries(PROVS.map((id) => [id, { ...w.provinces[id].price }])) as Record<ProvId, Record<GoodId, number>>;
  const grainLinks: Record<ProvId, FactFactor[]> = Object.fromEntries(PROVS.map((p) => [p, []])) as unknown as Record<ProvId, FactFactor[]>;
  for (const [x, y, km, q] of ROADS) {
    for (const g of GOODS) {
      for (const [a, b] of [[x, y], [y, x]] as [ProvId, ProvId][]) {
        const A = w.provinces[a], B = w.provinces[b];
        const blocked = A.unrest === 'revolta' || B.unrest === 'revolta' ? 0.3 : 1; // estradas perigosas
        const tc = (WEIGHT[g] * GOOD_DATA[g].base * km) / 100 / q;
        const toll = a === 'merovan' || b === 'merovan' ? w.tolls * price0[a][g] : 0;
        const margin = price0[b][g] - price0[a][g] - tc - toll;
        if (margin <= 0.02 * GOOD_DATA[g].base) continue;
        const cover = A.stock[g] / Math.max(1, A.demandAvg[g]);
        if (g === 'grao' && cover < 1.2) continue;
        const qty = blocked * Math.min(A.stock[g] * 0.16, ROAD_CAP[g] * q, A.stock[g] * 0.9 * (margin / price0[a][g]));
        if (qty < 1) continue;
        A.stock[g] -= qty; B.stock[g] += qty;
        A.tradeOut[g] += qty; B.tradeIn[g] += qty;
        const profit = qty * (margin + toll * 0) ;
        A.strata.mercadores.wealth += profit * 0.4; B.strata.mercadores.wealth += profit * 0.6;
        A.strata.mercadores.income += profit * 0.4; B.strata.mercadores.income += profit * 0.6;
        if (toll > 0) {
          const t = qty * toll * (w.liga.privilegeUntilMonth >= c.mi ? 0.5 : 1);
          c.tolls += t;
          c.tollFacts.push({ label: `${GOOD_DATA[g].name}: ${PROV_DATA[a].name} → ${PROV_DATA[b].name}`, amount: t });
        }
        w.flows.push({ a, b, g, qty });
        if (g === 'grao') {
          grainLinks[a].push({ label: `Vendido para ${PROV_DATA[b].name}`, amount: -qty, note: `lá pagavam ${price0[b][g].toFixed(2)}` });
          grainLinks[b].push({ label: `Comprado de ${PROV_DATA[a].name}`, amount: qty, note: `preço lá: ${price0[a][g].toFixed(2)}` });
        }
      }
    }
  }
  // porto de Altamar: comércio com o resto de Asterra
  const P = w.provinces.altamar;
  const priv = w.liga.privilegeUntilMonth >= c.mi ? 0.5 : 1;
  for (const g of GOODS) {
    w.port.world[g] *= 1 + 0.03 * gauss(w.rng);
    w.port.world[g] = clamp(w.port.world[g], GOOD_DATA[g].base * 0.8, GOOD_DATA[g].base * 1.6);
    const wp = w.port.world[g];
    const landed = wp * (1 + w.port.tariff) + 0.06 * GOOD_DATA[g].base;
    if (P.price[g] > landed * 1.03) {
      const gap = (P.price[g] - landed) / landed;
      const afford = P.strata.mercadores.wealth * 0.5 / landed;
      const qty = Math.min(PORT_CAP[g], afford, PORT_CAP[g] * gap * 3);
      if (qty < 1) continue;
      P.stock[g] += qty; P.tradeIn[g] += qty;
      P.strata.mercadores.wealth -= qty * landed;
      P.strata.mercadores.wealth += qty * P.price[g] * 0.5; // margem realizada ao revender (aproximação)
      const tariff = qty * wp * w.port.tariff * priv;
      c.tariffs += tariff;
      c.tariffFacts.push({ label: `Importação de ${GOOD_DATA[g].name.toLowerCase()}`, amount: tariff, note: `${fmt(qty)} ${GOOD_DATA[g].unit}` });
      w.flows.push({ a: 'mar', b: 'altamar', g, qty });
      if (g === 'grao') grainLinks.altamar.push({ label: 'Importado pelo porto', amount: qty, note: `tarifa de ${Math.round(w.port.tariff * 100)}%` });
    } else if (P.price[g] < wp * 0.9 - 0.06 * GOOD_DATA[g].base) {
      const cover = P.stock[g] / Math.max(1, P.demandAvg[g]);
      if (g === 'grao' && cover < 3) continue;
      const qty = Math.min(PORT_CAP[g] * 0.6, P.stock[g] * 0.12);
      if (qty < 1) continue;
      P.stock[g] -= qty; P.tradeOut[g] += qty;
      P.strata.mercadores.wealth += qty * (wp * 0.9 - P.price[g]);
      w.flows.push({ a: 'altamar', b: 'mar', g, qty });
      if (g === 'grao') grainLinks.altamar.push({ label: 'Exportado pelo porto', amount: -qty });
    }
  }
  // comércio por terra com os vizinhos estrangeiros (Mordane, Valedorn, Edria, Theryn, Karsk): pequeno e caro
  for (const id of PROVS) {
    const F = PROV_DATA[id].foreign;
    if (!F || F === 'Karsk') continue;
    const P2 = w.provinces[id];
    for (const g of GOODS) {
      const wp = w.port.world[g];
      const cap = PORT_CAP[g] * 0.3;
      if (P2.price[g] < wp * 0.8) {
        const qty = Math.min(cap, P2.stock[g] * 0.1);
        if (g === 'grao' && P2.stock[g] / Math.max(1, P2.demandAvg[g]) < 3) continue;
        if (qty < 1) continue;
        P2.stock[g] -= qty; P2.tradeOut[g] += qty;
        P2.strata.mercadores.wealth += qty * (wp * 0.8 - P2.price[g]);
        w.flows.push({ a: id, b: 'mar', g, qty });
        if (g === 'grao') grainLinks[id].push({ label: `Vendido para ${F}`, amount: -qty });
      } else if (P2.price[g] > wp * 1.3) {
        const qty = Math.min(cap, P2.strata.mercadores.wealth * 0.3 / (wp * 1.3));
        if (qty < 1) continue;
        P2.stock[g] += qty; P2.tradeIn[g] += qty;
        P2.strata.mercadores.wealth -= qty * wp * 1.3;
        P2.strata.mercadores.wealth += qty * (P2.price[g] - wp * 1.3) * 0.5;
        w.flows.push({ a: 'mar', b: id, g, qty });
        if (g === 'grao') grainLinks[id].push({ label: `Comprado de ${F}`, amount: qty });
      }
    }
  }
  for (const id of PROVS) {
    const links = grainLinks[id];
    const net = sum(links.map((l) => l.amount ?? 0));
    const fid = fact(w, `comercio:${id}:grao`, `Comércio de grão em ${PROV_DATA[id].name}`, links, { value: net, unit: 'sacas', source: 'mercadores e pedágios' });
    if (links.length) c.grainParts[id].push({ label: net >= 0 ? 'Chegou pelo comércio' : 'Saiu pelo comércio', amount: net, ref: fid });
  }
}

// ---------------- Consumo ----------------
const ORDER: (StratumId | 'soldados')[] = ['soldados', 'nobreza', 'clero', 'mercadores', 'artesaos', 'camponeses'];
const GOOD_PRIORITY: GoodId[] = ['grao', 'sal', 'madeira', 'ferro', 'tecido'];

export function consumption(w: World, c: Cycle) {
  for (const id of PROVS) {
    const p = w.provinces[id];
    const g0 = p.garrison;
    const unpaid = g0.monthsUnpaid > 0;
    const got: Record<string, Partial<Record<GoodId, number>>> = {};
    const need: Record<string, Partial<Record<GoodId, number>>> = {};
    const budget: Record<string, number> = {};
    for (const s of STRATA) budget[s] = Math.max(0, p.strata[s].wealth);
    budget.soldados = unpaid ? Infinity : g0.soldiers * 1.0;
    let spending = 0;
    let requisition = 0;
    let reliefUsed = 0;
    for (const g of GOOD_PRIORITY) {
      const price = p.price[g];
      const desired: Record<string, number> = {};
      for (const s of ORDER) {
        let n: number;
        if (s === 'soldados') n = g0.soldiers * (SOLDIER_NEEDS[g] ?? 0);
        else {
          const st = p.strata[s];
          const rich = g === 'tecido' ? clamp(1 + (st.wealth / Math.max(1, st.pop)) / 20, 1, 3) : 1;
          n = st.pop * NEEDS[s][g] * rich;
        }
        (need[s] ??= {})[g] = n;
        // fora o grão, quem é pobre guarda dinheiro para dois meses de pão, e todos compram menos quando o preço sobe
        const reserve = g === 'grao' || s === 'soldados' ? 0 : (s === 'camponeses' || s === 'artesaos' ? p.strata[s].pop * 0.1 * p.price.grao : 0);
        const elastic = g === 'grao' ? 1 : Math.min(1, Math.pow(GOOD_DATA[g].base / price, 0.8));
        desired[s] = Math.min(n * elastic, Math.max(0, budget[s] - reserve) / price);
      }
      let avail = p.stock[g];
      let own = 0;
      if (g === 'grao') {
        // a roça própria vem antes do mercado; depois, o grão distribuído pela Coroa, de graça
        own = Math.min(avail, (need.camponeses.grao ?? 0) * selfShare(id));
        avail -= own;
        const r = Math.min(p.relief, (need.camponeses.grao ?? 0) - own);
        p.relief -= r; reliefUsed = r;
        desired.camponeses = Math.min((need.camponeses.grao ?? 0) - own - r, budget.camponeses / price);
      }
      for (const s of ORDER) {
        const q = Math.min(desired[s], avail);
        avail -= q;
        (got[s] ??= {})[g] = q + (g === 'grao' && s === 'camponeses' ? reliefUsed + own : 0);
        if (s === 'soldados') {
          if (unpaid) requisition += q * price; else budget.soldados -= q * price;
        } else {
          budget[s] -= q * price;
          p.strata[s].wealth -= q * price;
          spending += q * price;
        }
      }
      p.stock[g] = Math.max(0, avail);
      const physical = sum(ORDER.map((s) => need[s][g] ?? 0));
      p.demandAvg[g] = 0.6 * p.demandAvg[g] + 0.4 * physical;
    }
    p.demandAvg.ferro = p.demandAvg.ferro + 0.4 * p.strata.camponeses.pop * TOOLS_PER_PEASANT;
    // lã: demanda dos tecelões
    p.demandAvg.la = 0.6 * p.demandAvg.la + 0.4 * (p.strata.artesaos.pop * PROV_DATA[id].weave * WEAVE_RATE);
    // varejo: margem dos mercadores
    p.strata.mercadores.wealth += spending * 0.1;
    p.strata.mercadores.income += spending * 0.1;
    for (const s of STRATA) {
      const st = p.strata[s];
      const ng = need[s].grao ?? 0;
      st.hunger = ng > 0 ? clamp(1 - (got[s].grao ?? 0) / ng, 0, 1) : 0;
      let lackN = 0, lackD = 0;
      for (const g of ['sal', 'madeira', 'tecido', 'ferro'] as GoodId[]) {
        const n = need[s][g] ?? 0;
        lackN += n * GOOD_DATA[g].base * (1 - clamp((got[s][g] ?? 0) / Math.max(1e-9, n), 0, 1));
        lackD += n * GOOD_DATA[g].base;
      }
      st.lack = lackD > 0 ? lackN / lackD : 0;
    }
    p.requisition = requisition;
    if (requisition > 0) {
      const rf = fact(w, `requisicao:${id}`, `Soldados sem soldo tomam comida em ${PROV_DATA[id].name}`, [
        { label: `${g0.monthsUnpaid} meses de soldo atrasado`, ref: latest(w, `guarnicao:${id}`) },
        { label: 'Valor tomado sem pagar', amount: requisition },
      ], { value: requisition, unit: 'coroas', source: 'queixas dos aldeões' });
      remember(p.grievances, { id: 'requisicao', label: 'Soldados tomam nossa comida', weight: -Math.min(12, 2 + requisition / 800), decay: 0.12, strata: ['camponeses'], fact: rf });
    }
    const totalGrain = sum(ORDER.map((s) => got[s]?.grao ?? 0)) - reliefUsed;
    c.grainParts[id].push({ label: 'Consumido pela população e tropas', amount: -totalGrain });
    if (reliefUsed > 0) c.grainParts[id].push({ label: 'Grão da Coroa distribuído', amount: reliefUsed, ref: latest(w, `alivio:${id}`) });
    // perdas por armazenamento
    for (const g of GOODS) {
      const loss = p.stock[g] * GOOD_DATA[g].perishable;
      p.stock[g] -= loss;
      if (g === 'grao') c.grainParts[id].push({ label: 'Perdas nos celeiros (ratos e umidade)', amount: -loss });
    }
    // fato da fome por estrato
    for (const s of ['camponeses', 'artesaos'] as StratumId[]) {
      const st = p.strata[s];
      fact(w, `fome:${id}:${s}`, `Fome entre ${s === 'camponeses' ? 'os camponeses' : 'os artesãos'} de ${PROV_DATA[id].name}`, [
        { label: 'Preço do grão no mercado', amount: p.price.grao, note: 'coroas por saca', ref: latest(w, `preco:${id}:grao`) },
        { label: 'Grão disponível no mercado', amount: c.stockStart[id], note: 'sacas no início do mês', ref: latest(w, `estoque:${id}:grao`) },
        { label: 'Poupança e renda do grupo', amount: st.wealth + st.income, note: 'coroas' },
        { label: 'Quem compra primeiro (soldados, nobres, clero, mercadores)', note: 'quando falta, os pobres ficam sem' },
        ...(s === 'camponeses' && reliefUsed > 0 ? [{ label: 'Grão distribuído pela Coroa', amount: reliefUsed, ref: latest(w, `alivio:${id}`) }] : []),
      ], { value: st.hunger, unit: 'fração', source: 'intendente' });
    }
  }
}

// ---------------- Preços ----------------
export function monthsToHarvest(month: number) {
  // meses inteiros até o fim de setembro (grosso da colheita)
  // meses até o fim de agosto, quando a colheita começa a entrar
  return ((8 - month + 12) % 12) || 12;
}

export function prices(w: World, c: Cycle) {
  for (const id of PROVS) {
    const p = w.provinces[id];
    // registra o estoque de grão com suas causas
    const parts = c.grainParts[id];
    const sf = fact(w, `estoque:${id}:grao`, `Grão nos mercados de ${PROV_DATA[id].name}`, [
      { label: 'Estoque no começo do mês', amount: c.stockStart[id] },
      ...parts,
    ], { value: p.stock.grao, unit: 'sacas', source: 'intendente' });
    for (const g of GOODS) {
      const T = g === 'grao' ? monthsToHarvest(c.month) + 0.8 : 2;
      // os mercadores contam com a parte da colheita que ainda vai entrar
      const pending = g === 'grao' && (c.month === 8 || c.month === 9)
        ? p.strata.camponeses.pop * (PROV_DATA[id].sectors.agri ?? 0) * PROV_DATA[id].grainYield * p.lastHarvestFactor * (c.month === 8 ? 0.6 : 0.1)
        : 0;
      const cover = (p.stock[g] + pending) / Math.max(1, p.demandAvg[g]);
      const target = GOOD_DATA[g].base * clamp(Math.pow(T / Math.max(0.05, cover), 0.65), 0.35, 6);
      // arbitragem: ninguém vende barato se o vizinho paga mais (descontado o frete)
      let floor = 0;
      for (const [x, y, km, q] of g === 'grao' ? [] : ROADS) {
        const other = x === id ? y : y === id ? x : null;
        if (!other) continue;
        const tc = (WEIGHT[g] * GOOD_DATA[g].base * km) / 100 / q;
        floor = Math.max(floor, (w.provinces[other].price[g] - tc) * 0.75);
      }
      const old = p.price[g];
      p.price[g] = Math.max(0.4 * old + 0.6 * target, Math.min(floor, target * 2));
      if (g === 'grao') {
        fact(w, `preco:${id}:grao`, `Preço do grão em ${PROV_DATA[id].name}`, [
          { label: `Grão para ${cover.toFixed(1)} meses de consumo`, amount: target - GOOD_DATA[g].base, ref: sf, note: `precisa durar ${T.toFixed(1)} meses até a colheita` },
          { label: 'Preço do mês anterior (os preços mudam devagar)', amount: 0.4 * (old - target) },
        ], { value: p.price.grao, unit: 'coroas por saca', source: 'mercado' });
      }
    }
  }
  void CROWN_LANDS; void range;
}

export function fmt(n: number) {
  return Math.round(n).toLocaleString('pt-BR');
}
