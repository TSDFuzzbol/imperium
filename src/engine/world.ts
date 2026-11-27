import { GOOD_DATA, HOUSES, NEEDS, PROV_DATA, WAGE } from '../data/eldoria';
import { fact, remember } from './core';
import { seedRng, gauss } from './rng';
import { GOODS, PROVS, STRATA } from './types';
import type { GoodId, Group, Province, ProvId, Sovereign, Stratum, StratumId, World } from './types';

const START_COVER: Record<ProvId, number> = {
  valtheris: 4.8, altamar: 5.4, veyra: 9.0, dornhelm: 4.6, caldris: 5.6, merovan: 5.8, rhovan: 4.5, esteren: 5.0,
};
const WEALTH_PC: Record<StratumId, number> = { camponeses: 0.35, artesaos: 0.9, mercadores: 14, clero: 7, nobreza: 28 };
const HUMOR0: Record<StratumId, number> = { camponeses: 2, artesaos: 0, mercadores: -6, clero: -10, nobreza: -14 };

export const DEFAULT_SOVEREIGN: Sovereign = {
  name: 'Aldo', title: 'rei', age: 34, oficio: 'faxineiro', origem: 'caldris', laco: 'verdade',
  traits: ['honesto', 'paciente'],
  look: { skin: 2, hair: 1, hairStyle: 1, beard: 1, scar: false, build: 1 },
};

export function monthlyNeed(p: Province, g: GoodId) {
  let n = 0;
  for (const s of STRATA) n += p.strata[s].pop * NEEDS[s][g];
  if (g === 'grao') n += p.garrison.soldiers * 0.1;
  if (g === 'ferro') n += p.strata.camponeses.pop * 0.0018;
  return n;
}

export function createWorld(seed: number, sovereign: Sovereign = DEFAULT_SOVEREIGN): World {
  const rng = seedRng(seed);
  const provinces = {} as Record<ProvId, Province>;
  for (const id of PROVS) {
    const d = PROV_DATA[id];
    const strata = {} as Record<StratumId, Stratum>;
    for (const s of STRATA) {
      const pop = Math.round(d.pop * d.shares[s]);
      let humor = HUMOR0[s];
      if (id === 'altamar' && s === 'mercadores') humor = -24; // pedem revisão das tarifas
      if (id === 'rhovan' && s === 'camponeses') humor = -8;
      strata[s] = { pop, wealth: pop * WEALTH_PC[s], humor, hunger: 0, lack: 0, income: 0 };
    }
    const p: Province = {
      id, strata,
      stock: {} as Record<GoodId, number>, price: {} as Record<GoodId, number>, demandAvg: {} as Record<GoodId, number>,
      taxRate: 0.08, exemptUntilMonth: -1,
      rain: 0, growRain: [], blight: false,
      unrest: 'calma', unrestMonths: 0, grievances: [],
      garrison: { soldiers: d.garrison, morale: id === 'rhovan' ? 0.55 : 0.7, arrears: 0, monthsUnpaid: 0 },
      toolsMet: 1, lastHarvestFactor: 1,
      tradeIn: {} as Record<GoodId, number>, tradeOut: {} as Record<GoodId, number>,
      relief: 0, requisition: 0,
    };
    for (const g of GOODS) {
      const need = monthlyNeed(p, g) || 1;
      p.demandAvg[g] = g === 'la' ? 3000 : need;
      p.stock[g] = g === 'grao' ? need * START_COVER[id] : (g === 'la' ? 6000 : need * 2);
      p.price[g] = GOOD_DATA[g].base;
      p.tradeIn[g] = 0; p.tradeOut[g] = 0;
    }
    // Inverno seco em Veyra: o motivo do alerta sobre a colheita (gancho da crise de 1427)
    if (id === 'veyra') p.rain = -0.55;
    else p.rain = 0.15 * gauss(rng);
    provinces[id] = p;
  }
  // Rhovan começa com dois meses de soldo atrasado
  const rh = provinces.rhovan.garrison;
  rh.monthsUnpaid = 2; rh.arrears = rh.soldiers * WAGE * 2;

  const groups: Record<string, Group> = {};
  const mk = (id: Group['id'], acceptance: number, present = true, wealth = 0): Group =>
    ({ id, acceptance, rung: 0, rungMonths: 0, interest: 0, memory: [], wealth, present });
  for (const h of Object.values(HOUSES)) {
    groups[`casa:${h.id}`] = mk(`casa:${h.id}`, h.acceptance, h.present, 40000);
  }
  groups['casa:rhovar'].rung = 2; // não enviou representante
  groups.igreja = mk('igreja', -18, true, 90000);
  groups.exercito = mk('exercito', -6);
  groups.liga = mk('liga', 6, true, 400000);
  for (const id of PROVS) groups[`povo:${id}`] = mk(`povo:${id}`, 0);

  const w: World = {
    version: 1, seed, rng, day: 0, sovereign, provinces,
    treasury: { coin: 61000, debt: 780000, interest: 0.0075, adminArrears: 0, lastIncome: 0, lastExpense: 0, history: [] },
    port: { tariff: 0.15, world: { grao: 1.15, sal: 2.6, la: 2.3, tecido: 5.4, ferro: 4.6, madeira: 1.9 } },
    tolls: 0.06,
    liga: { offer: { amount: 200000, rate: 0.01, expires: 75 }, privilegeUntilMonth: -1 },
    granary: 6000,
    karsk: { troops: 9000, aggression: 0.35, lastRaidMonth: -99, estimate: 9000 },
    groups, anointed: false, pretender: 0.05,
    orders: [], facts: {}, factIndex: {}, seq: 0,
    chronicle: [], dispatches: [], reports: {}, pendingReports: [], log: [], pauseRequest: null, flows: [],
  };

  // A terra natal lembra do soberano como "um dos nossos"
  const origin = fact(w, 'origem', `${sovereign.title === 'rainha' ? 'A rainha' : 'O rei'} nasceu em ${PROV_DATA[sovereign.origem].name}`, [], { text: 'Gente da terra dele vê na coroa um dos seus.' });
  remember(provinces[sovereign.origem].grievances, { id: 'umdosnossos', label: 'Um dos nossos no trono', weight: 14, decay: 0.03, strata: ['camponeses', 'artesaos'], fact: origin });
  remember(groups[`povo:${sovereign.origem}`].memory, { id: 'umdosnossos', label: 'Um dos nossos no trono', weight: 15, decay: 0.02, strata: [], fact: origin });
  // o laço com Teodoro III e o ofício antigo marcam o começo (PROPOSTA, PROPOSTAS_DO_REI_v2)
  const L = sovereign.laco;
  if (L === 'riso') {
    for (const id of PROVS) remember(groups[`povo:${id}`].memory, { id: 'riso', label: 'Dizem que fazia o rei antigo rir', weight: 5, decay: 0.03, strata: [] });
    for (const h of Object.values(HOUSES)) remember(groups[`casa:${h.id}`].memory, { id: 'bobo', label: 'Um bobo no trono', weight: -3, decay: 0.04, strata: [] });
  } else if (L === 'cuidado') {
    remember(groups.igreja.memory, { id: 'cuidado', label: 'Cuidou de Teodoro na doença', weight: 6, decay: 0.02, strata: [] });
  } else if (L === 'salvou') {
    remember(groups.exercito.memory, { id: 'salvou', label: 'Salvou a vida do rei antigo', weight: 6, decay: 0.02, strata: [] });
  } else if (L === 'verdade') {
    remember(groups.liga.memory, { id: 'verdade', label: 'Tem fama de não mentir', weight: 4, decay: 0.02, strata: [] });
  }
  if (sovereign.oficio === 'carrasco') {
    remember(groups.igreja.memory, { id: 'impuro', label: 'Mãos de carrasco', weight: -8, decay: 0.01, strata: [] });
    remember(groups.exercito.memory, { id: 'duro', label: 'Não treme diante de sangue', weight: 4, decay: 0.02, strata: [] });
  }
  if (sovereign.oficio === 'cavalarico') remember(groups.exercito.memory, { id: 'estabulos', label: 'Um dos nossos, dos estábulos', weight: 5, decay: 0.02, strata: [] });
  if (sovereign.title === 'rainha') remember(groups.igreja.memory, { id: 'rainha', label: 'Uma mulher sem sangue no trono', weight: -4, decay: 0.01, strata: [] });
  return w;
}
