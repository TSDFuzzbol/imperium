// Legitimidade contínua por grupo (PROPOSTAS_DO_REI_v2, seção 2). Sem prazo, sem julgamento:
// cada grupo pesa as fontes de legitimidade do seu jeito e sobe ou desce degraus de contestação.
import { HOUSES, PROV_DATA } from '../../data/eldoria';
import { chron, clamp, decayMemory, fact, latest, monthIndex, remember, sum } from '../core';
import { chance, gauss } from '../rng';
import { PROVS } from '../types';
import type { FactFactor, Group, HouseId, ProvId, Rung, World } from '../types';
import type { Cycle } from './economy';
import { lowerHumor } from './people';

export type Source = 'lei' | 'sagrado' | 'forca' | 'povo' | 'costume' | 'sangue';
export const SOURCE_NAMES: Record<Source, string> = {
  lei: 'Lei (a vontade de Teodoro III)', sagrado: 'Sagrado (unção)', forca: 'Força (tropas leais)',
  povo: 'Povo (amado ou não nas ruas)', costume: 'Costume (tempo no trono)', sangue: 'Sangue (não tem)',
};
type W = Record<Source, number>;
const WEIGHTS: Record<'casa' | 'igreja' | 'exercito' | 'liga' | 'povo', W> = {
  casa: { lei: 0.15, sagrado: 0.2, forca: 0.2, povo: 0.05, costume: 0.15, sangue: 0.25 },
  igreja: { lei: 0.1, sagrado: 0.35, forca: 0.05, povo: 0.2, costume: 0.15, sangue: 0.15 },
  exercito: { lei: 0.1, sagrado: 0.1, forca: 0.5, povo: 0.1, costume: 0.1, sangue: 0.1 },
  liga: { lei: 0.3, sagrado: 0.05, forca: 0.15, povo: 0.15, costume: 0.25, sangue: 0.1 },
  povo: { lei: 0.05, sagrado: 0.25, forca: 0.05, povo: 0.55, costume: 0.1, sangue: 0 },
};
// deslocamento de base de cada tipo de grupo (PROPOSTA de calibração)
const OFFSET = { casa: 28, igreja: 16, exercito: 24, liga: 22, povo: 26 };

export const RUNG_NAMES = ['Aceita', 'Murmúrio', 'Recusa', 'Alternativa', 'Conspiração', 'Ruptura'];

export function groupName(id: string) {
  if (id.startsWith('casa:')) return HOUSES[id.slice(5) as HouseId].name;
  if (id.startsWith('povo:')) return `Povo de ${PROV_DATA[id.slice(5) as ProvId].name}`;
  return { igreja: 'Ordem da Fé', exercito: 'Exército', liga: 'Liga Mercantil' }[id] ?? id;
}
function kind(id: string): keyof typeof WEIGHTS {
  return id.startsWith('casa:') ? 'casa' : id.startsWith('povo:') ? 'povo' : (id as 'igreja' | 'exercito' | 'liga');
}

export function sources(w: World, povoProv?: ProvId): Record<Source, number> {
  const months = monthIndex(w.day) - monthIndex(0);
  let sold = 0, mor = 0;
  for (const id of PROVS) { const g = w.provinces[id].garrison; sold += g.soldiers; mor += g.soldiers * g.morale; }
  const forca = clamp(((mor / Math.max(1, sold)) - 0.5) * 2, -1, 1);
  let pop = 0, hum = 0;
  for (const id of PROVS) { const p = w.provinces[id]; const n = p.strata.camponeses.pop + p.strata.artesaos.pop; pop += n; hum += n * lowerHumor(p); }
  const povo = clamp((povoProv ? lowerHumor(w.provinces[povoProv]) : hum / pop) / 60, -1, 1);
  return {
    lei: 0.25,
    sagrado: w.anointed ? 0.8 : -0.25,
    forca,
    povo,
    costume: clamp(months / 96, 0, 1) - 0.6 - w.pretender * 0.5,
    sangue: -1,
  };
}

function interest(w: World, g: Group): FactFactor[] {
  const f: FactFactor[] = [];
  const k = kind(g.id);
  if (k === 'casa') {
    const h = HOUSES[g.id.slice(5) as HouseId];
    const p = w.provinces[h.prov];
    const tax = p.exemptUntilMonth >= monthIndex(w.day) ? 0 : p.taxRate;
    if (tax > 0.08) f.push({ label: `Imposto de ${Math.round(tax * 100)}% nas terras da casa`, amount: -250 * (tax - 0.08), ref: latest(w, `decreto:taxar:${h.prov}`) });
    if (p.unrest === 'motins') f.push({ label: 'Motins nas terras da casa', amount: -8, ref: latest(w, `inquietacao:${h.prov}`) });
    if (p.unrest === 'revolta') f.push({ label: 'Revolta nas terras da casa', amount: -20, ref: latest(w, `inquietacao:${h.prov}`) });
    switch (h.id) {
      case 'avarenne': f.push({ label: `Tarifa do porto em ${Math.round(w.port.tariff * 100)}% (quer comércio livre)`, amount: (0.12 - w.port.tariff) * 100, ref: latest(w, 'decreto:tarifa') }); break;
      case 'caldran': f.push({ label: `Tarifa do porto em ${Math.round(w.port.tariff * 100)}% (protege os tecidos de Caldris)`, amount: (w.port.tariff - 0.12) * 80, ref: latest(w, 'decreto:tarifa') }); break;
      case 'merrow':
        f.push({ label: `Pedágios em ${Math.round(w.tolls * 100)}%`, amount: (w.tolls - 0.06) * 200, ref: latest(w, 'decreto:pedagio') });
        if (w.liga.privilegeUntilMonth >= monthIndex(w.day)) f.push({ label: 'Privilégios dados à Liga, rival da casa', amount: -15, ref: latest(w, 'decreto:credito_liga') });
        break;
      case 'deveyr': f.push({ label: 'Preço do grão de Veyra (bom para quem tem terra)', amount: clamp(10 * (w.provinces.veyra.price.grao - 1), -10, 15), ref: latest(w, 'preco:veyra:grao') }); break;
      case 'dorn': f.push({ label: 'Preço do ferro', amount: clamp(8 * (w.provinces.dornhelm.price.ferro / 4 - 1), -8, 10) }); break;
      case 'rhovar': {
        const rg = w.provinces.rhovan.garrison;
        if (rg.monthsUnpaid > 0) f.push({ label: `Guarnição de Rhovan com ${rg.monthsUnpaid.toFixed(1)} meses sem soldo`, amount: -6 * rg.monthsUnpaid, ref: latest(w, 'guarnicao:rhovan') });
        break;
      }
      case 'vaelmont': f.push({ label: 'Perto do trono, na capital', amount: 5 }); break;
    }
  } else if (k === 'igreja') {
    let hunger = 0, pop = 0;
    for (const id of PROVS) { const s = w.provinces[id].strata.camponeses; hunger += s.hunger * s.pop; pop += s.pop; }
    if (hunger / pop > 0.01) f.push({ label: 'Fome entre os fiéis', amount: -150 * hunger / pop });
    f.push({ label: 'Quer participar da formação do novo governo', amount: -6 });
  } else if (k === 'exercito') {
    let mu = 0, s = 0;
    for (const id of PROVS) { const g = w.provinces[id].garrison; mu += g.monthsUnpaid * g.soldiers; s += g.soldiers; }
    if (mu / s > 0.05) f.push({ label: 'Soldo atrasado nas guarnições', amount: -14 * mu / s, ref: latest(w, 'tesouro') });
  } else if (k === 'liga') {
    f.push({ label: `Pedágios em ${Math.round(w.tolls * 100)}%`, amount: -(w.tolls - 0.06) * 150, ref: latest(w, 'decreto:pedagio') });
    f.push({ label: `Tarifa do porto em ${Math.round(w.port.tariff * 100)}%`, amount: -(w.port.tariff - 0.1) * 100, ref: latest(w, 'decreto:tarifa') });
    if (w.liga.privilegeUntilMonth >= monthIndex(w.day)) f.push({ label: 'Privilégios comerciais concedidos', amount: 15, ref: latest(w, 'decreto:credito_liga') });
  } else {
    const id = g.id.slice(5) as ProvId;
    const p = w.provinces[id];
    if (p.unrest === 'revolta') f.push({ label: 'Província em revolta', amount: -20, ref: latest(w, `inquietacao:${id}`) });
  }
  return f;
}

function desiredRung(a: number): Rung {
  return a >= -10 ? 0 : a >= -25 ? 1 : a >= -40 ? 2 : a >= -55 ? 3 : a >= -70 ? 4 : 5;
}

export function legitimacy(w: World, c: Cycle) {
  const S0 = sources(w);
  for (const g of Object.values(w.groups)) {
    decayMemory(g.memory);
    const k = kind(g.id);
    const S = k === 'povo' ? sources(w, g.id.slice(5) as ProvId) : S0;
    const W = WEIGHTS[k];
    const srcF: FactFactor[] = (Object.keys(W) as Source[]).filter((s) => W[s] > 0).map((s) => ({
      label: SOURCE_NAMES[s], amount: 60 * W[s] * S[s],
      ref: s === 'povo' ? latest(w, k === 'povo' ? `inquietacao:${g.id.slice(5)}` : 'povo') : s === 'forca' ? latest(w, 'guarnicao:rhovan') : s === 'sagrado' ? latest(w, 'uncao') : undefined,
    }));
    const intF = interest(w, g);
    const memF: FactFactor[] = g.memory.map((m) => ({ label: m.label, amount: m.weight, ref: m.fact }));
    const target = clamp(OFFSET[k] + sum([...srcF, ...intF, ...memF].map((x) => x.amount ?? 0)), -100, 100);
    const old = g.acceptance;
    g.acceptance = clamp(old + 0.3 * (target - old), -100, 100);
    g.interest = sum(intF.map((x) => x.amount ?? 0));
    const gf = fact(w, `grupo:${g.id}`, `Como ${groupName(g.id)} vê seu direito de reinar`, [
      { label: 'Opinião do mês anterior', amount: 0.7 * old },
      { label: 'Ponto de partida do grupo', amount: 0.3 * OFFSET[k] },
      ...[...srcF, ...intF, ...memF].map((x) => ({ ...x, amount: (x.amount ?? 0) * 0.3 })),
    ], { value: g.acceptance, unit: 'aceitação', source: w.sovereign.oficio === 'faxineiro' || w.sovereign.oficio === 'lavadeiro' ? 'sua rede dos de baixo' : 'conselheiros' });

    // degraus: um passo por mês, com hesitação (cada grupo decide sozinho)
    const want = k === 'povo' ? povoRung(w, g.id.slice(5) as ProvId) : desiredRung(g.acceptance);
    const before = g.rung;
    if (k === 'povo') g.rung = want;
    else if (want > g.rung && chance(w.rng, 0.45 + 0.1 * gauss(w.rng))) g.rung = (g.rung + 1) as Rung;
    else if (want < g.rung && g.acceptance > thresholdFor(g.rung) + 5 && chance(w.rng, 0.6)) g.rung = (g.rung - 1) as Rung;
    if (g.rung !== before) { g.rungMonths = 0; onRung(w, g, before, gf); } else g.rungMonths += 1;
  }
  // a Igreja decide sobre a unção
  const ig = w.groups.igreja;
  if (!w.anointed && ig.acceptance > 12 && ig.rung === 0 && ig.rungMonths >= 1) {
    w.anointed = true;
    const uf = fact(w, 'uncao', 'A Ordem da Fé ungiu o soberano', [{ label: 'Aceitação da Ordem da Fé', amount: ig.acceptance, ref: latest(w, 'grupo:igreja') }], { source: 'catedral de Valtheris' });
    chron(w, { kind: 'reinado', weight: 3, fact: uf, title: 'A unção', text: `Na catedral de Valtheris, o óleo santo tocou a testa de quem um dia varreu aquele chão. Para muitos, só agora ${w.sovereign.title === 'rainha' ? 'a rainha' : 'o rei'} reina de verdade.` });
    w.pauseRequest = 'A unção';
  }
  // pretendente: cresce com casas em "alternativa" ou mais
  const backers = Object.values(w.groups).filter((g) => g.id.startsWith('casa:') && g.rung >= 3).length;
  const before = w.pretender;
  w.pretender = clamp(w.pretender * 0.97 + 0.035 * backers, 0, 1);
  fact(w, 'pretendente', 'Fala-se de um pretendente', [
    { label: `${backers} casas falam abertamente de alternativa`, amount: 0.035 * backers },
    { label: 'O assunto esfria quando ninguém o alimenta', amount: -0.03 * before },
  ], { value: w.pretender, unit: 'força', source: 'rumores da corte' });
  if (before < 0.3 && w.pretender >= 0.3) chron(w, { kind: 'politica', weight: 3, fact: latest(w, 'pretendente'), title: 'Um nome é sussurrado', text: 'Nos salões já se fala de um primo distante de Teodoro III, alguém "nascido para a coroa". Ninguém diz o nome em voz alta, ainda.' });
  void c;
}

function thresholdFor(r: Rung) {
  return [-10, -10, -25, -40, -55, -70][r];
}

function povoRung(w: World, id: ProvId): Rung {
  const p = w.provinces[id];
  return p.unrest === 'revolta' ? 5 : p.unrest === 'motins' ? 2 : p.unrest === 'tensa' ? 1 : 0;
}

function onRung(w: World, g: Group, before: Rung, gf: string) {
  if (g.id.startsWith('povo:')) return;
  const name = groupName(g.id);
  const up = g.rung > before;
  if (g.id.startsWith('casa:')) {
    const h = HOUSES[g.id.slice(5) as HouseId];
    if (up && g.rung === 2 && g.present) {
      g.present = false;
      chron(w, { kind: 'politica', weight: 2, fact: gf, prov: h.prov, title: `${name} deixa a corte`, text: `O representante da ${name} partiu de Valtheris sem pedir licença. Na província, os coletores da casa passam a "atrasar" a parte da Coroa.` });
    } else if (!up && g.rung <= 1 && !g.present) {
      g.present = true;
      chron(w, { kind: 'politica', weight: 2, fact: gf, prov: h.prov, title: `${name} volta à corte`, text: `Um representante da ${name} se apresentou em Valtheris e prestou homenagem.` });
    } else if (up && g.rung === 3) {
      chron(w, { kind: 'politica', weight: 2, fact: gf, prov: h.prov, title: `${name} fala de alternativa`, text: `Em jantares da ${name}, brinda-se "ao sangue verdadeiro". Já não é só desprezo: é uma ideia.` });
    } else if (up && g.rung === 4) {
      chron(w, { kind: 'politica', weight: 3, fact: gf, prov: h.prov, title: 'Cartas que não deviam existir', text: `Sua rede ouve que mensageiros da ${name} saem à noite${h.id === 'rhovar' ? ', na direção de Karsk' : ''}. Nada está provado.` });
      w.pauseRequest = 'Conspiração';
    } else if (up && g.rung === 5) {
      w.provinces[h.prov].unrest = 'revolta';
      chron(w, { kind: 'politica', weight: 3, fact: gf, prov: h.prov, title: `${name} se rebela`, text: `A ${name} fechou as estradas de ${PROV_DATA[h.prov].name}, prendeu os coletores reais e declara que não obedece a "um rei de vassoura".` });
      w.pauseRequest = 'Rebelião nobre';
    }
  } else if (g.id === 'igreja') {
    if (up && g.rung >= 4) chron(w, { kind: 'politica', weight: 2, fact: gf, title: 'Sermões contra o trono', text: 'Pregadores da Ordem da Fé falam de "um trono sem bênção" nas praças. O povo escuta.' });
  } else if (g.id === 'exercito') {
    if (up && g.rung >= 3) chron(w, { kind: 'guerra', weight: 2, fact: gf, title: 'Oficiais murmuram', text: 'Capitães reclamam abertamente do soldo e perguntam a quem devem lealdade.' });
  } else if (g.id === 'liga') {
    if (up && g.rung >= 2 && w.liga.offer) {
      w.liga.offer = null;
      chron(w, { kind: 'tesouro', weight: 2, fact: gf, title: 'A Liga fecha o cofre', text: 'A Liga Mercantil retirou a oferta de crédito. "Não emprestamos a quem não sabemos se estará no trono no ano que vem."' });
    }
  }
}

/** Efeitos mensais dos degraus que agem sobre o mundo. */
export function rungEffects(w: World) {
  for (const g of Object.values(w.groups)) {
    if (g.id.startsWith('casa:') && g.rung >= 4) {
      const h = HOUSES[g.id.slice(5) as HouseId];
      if (h.id === 'rhovar') w.karsk.aggression = clamp(w.karsk.aggression + 0.04, 0, 1);
      remember(w.provinces[h.prov].grievances, { id: `agitadores:${h.id}`, label: 'Agitadores dizem que o rei é um usurpador', weight: -4, decay: 0.15, strata: ['camponeses', 'artesaos'], fact: latest(w, `grupo:${g.id}`) });
    }
    if (g.id === 'igreja' && g.rung >= 4) {
      for (const id of PROVS) remember(w.provinces[id].grievances, { id: 'sermoes', label: 'Sermões contra o trono', weight: -3, decay: 0.2, strata: ['camponeses', 'artesaos'], fact: latest(w, 'grupo:igreja') });
    }
  }
}
