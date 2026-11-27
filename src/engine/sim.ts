// O relógio do mundo: dias corridos, ciclo mensal para economia, população e política.
import { PROV_DATA } from '../data/eldoria';
import { chron, fact, isMonthEnd, pruneFacts } from './core';
import { processOrders } from './decrees';
import { deliverReports, expireDispatches, makeDispatches, makeReports, nationalPovo } from './reports';
import { climate, consumption, newCycle, prices, production, trade } from './systems/economy';
import { karsk } from './systems/karsk';
import { demography, garrisons, lowerHumor, mood, totalPop, unrest } from './systems/people';
import { legitimacy, rungEffects } from './systems/politics';
import { treasury } from './systems/treasury';
import { PROVS, STRATA } from './types';
import type { ProvId, World } from './types';

export function monthly(w: World) {
  const c = newCycle(w);
  climate(w, c);
  production(w, c);
  trade(w, c);
  consumption(w, c);
  prices(w, c);
  demography(w, c);
  mood(w, c);
  unrest(w);
  garrisons(w);
  treasury(w, c);
  karsk(w);
  nationalPovo(w);
  legitimacy(w, c);
  rungEffects(w);
  makeReports(w);
  makeDispatches(w);
  monthSummary(w);
  pruneFacts(w);
}

/** Uma linha de crônica por mês: o que o tesoureiro e os mercados contam do mês que passou. */
function monthSummary(w: World) {
  const h = w.treasury.history[w.treasury.history.length - 1];
  if (!h) return;
  const net = h.income - h.expense;
  let pop = 0, pw = 0, hungry = 0;
  let worst: ProvId = PROVS[0];
  for (const id of PROVS) {
    const p = w.provinces[id];
    const n = totalPop(p);
    pop += n; pw += p.price.grao * n;
    if (lowerHumor(p) < lowerHumor(w.provinces[worst])) worst = id;
    hungry += p.strata.camponeses.hunger * p.strata.camponeses.pop;
  }
  const price = pw / pop;
  const n0 = (x: number) => Math.round(x).toLocaleString('pt-BR');
  const parts = [
    `O tesouro ${net >= 0 ? 'ganhou' : 'perdeu'} ${n0(Math.abs(net))} coroas e fechou com ${n0(w.treasury.coin)}.`,
    `O grão custa em média ${price.toFixed(2).replace('.', ',')} coroas a saca.`,
    hungry > 500 ? `Cerca de ${n0(hungry)} camponeses passaram fome.` : 'Ninguém morreu de fome.',
    `O povo mais descontente é o de ${PROV_DATA[worst].name}.`,
  ];
  chron(w, { kind: 'tesouro', weight: 1, title: 'Fecham-se as contas do mês', text: parts.join(' '), fact: w.factIndex.tesouro });
}

/** Avança um dia. Retorna true se o dia fechou um mês. */
export function stepDay(w: World): boolean {
  processOrders(w);
  deliverReports(w);
  expireDispatches(w);
  let cycled = false;
  if (isMonthEnd(w.day)) { monthly(w); cycled = true; }
  w.day += 1;
  return cycled;
}

export function stepDays(w: World, n: number) {
  for (let i = 0; i < n; i++) stepDay(w);
}

/** Fatos e relatórios do primeiro dia, antes de qualquer ciclo. */
export function bootstrap(w: World) {
  for (const id of PROVS) {
    const p = w.provinces[id];
    const base = { source: 'relatórios da coroação' };
    fact(w, `pop:${id}`, `População de ${PROV_DATA[id].name}`, [{ label: 'Censo herdado de Teodoro III (dossiê 1.2)' }], { ...base, value: totalPop(p), unit: 'pessoas' });
    fact(w, `estoque:${id}:grao`, `Grão nos mercados de ${PROV_DATA[id].name}`, [{ label: 'O que sobrou da colheita do ano passado' }], { ...base, value: p.stock.grao, unit: 'sacas' });
    fact(w, `preco:${id}:grao`, `Preço do grão em ${PROV_DATA[id].name}`, [{ label: 'Preço corrente na coroação' }], { ...base, value: p.price.grao, unit: 'coroas por saca' });
    for (const s of STRATA) fact(w, `humor:${id}:${s}`, `Humor em ${PROV_DATA[id].name}`, [{ label: 'Como o povo recebeu a notícia da coroação' }], { ...base, value: p.strata[s].humor, unit: 'humor' });
    fact(w, `fome:${id}:camponeses`, `Fome em ${PROV_DATA[id].name}`, [{ label: 'Ainda não há relatos de fome' }], { ...base, value: 0 });
    fact(w, `inquietacao:${id}`, `Ordem em ${PROV_DATA[id].name}`, [{ label: 'Humor do povo', amount: lowerHumor(p) }], { ...base, value: lowerHumor(p) });
    fact(w, `guarnicao:${id}`, `Guarnição de ${PROV_DATA[id].name}`, id === 'rhovan' ? [{ label: 'Dois meses de soldo atrasado, herdados do reinado anterior' }] : [{ label: 'Guarnição regular' }], { ...base, value: p.garrison.morale, unit: 'moral' });
    fact(w, `imposto:${id}`, `Imposto em ${PROV_DATA[id].name}`, [{ label: 'Ainda não houve coleta neste reinado' }], { ...base, value: 0, unit: 'coroas' });
    fact(w, `producao:${id}`, `Produção de ${PROV_DATA[id].name}`, [{ label: 'Ainda não houve ciclo neste reinado' }], { ...base, value: 0, unit: 'coroas' });
  }
  fact(w, 'tesouro', 'Tesouro da Coroa', [{ label: 'Herdado de Teodoro III', amount: w.treasury.coin }], { value: w.treasury.coin, unit: 'coroas', source: 'tesoureiro' });
  fact(w, 'karsk', 'Tropas de Karsk na fronteira', [{ label: 'Movimentos vistos desde a morte do rei antigo' }], { value: w.karsk.estimate, unit: 'soldados (estimativa)', source: 'comandante de Rhovan' });
  for (const g of Object.values(w.groups)) fact(w, `grupo:${g.id}`, 'Aceitação inicial', [{ label: 'Reação à coroação de alguém sem sangue real', amount: g.acceptance }], { value: g.acceptance, unit: 'aceitação', source: 'conselheiros' });
  nationalPovo(w);
  makeReports(w);
  for (const r of w.pendingReports) r.arrives = 0;
  deliverReports(w);
  makeDispatches(w);
  w.pauseRequest = null;
  chron(w, {
    kind: 'reinado', weight: 3,
    title: `${w.sovereign.title === 'rainha' ? 'A rainha' : 'O rei'} ${w.sovereign.name}`,
    text: `Onze dias depois da morte de Teodoro III, ${w.sovereign.name}, que até o mês passado ${OFICIO_TEXT[w.sovereign.oficio]}, usa a coroa de Eldoria. A Ordem da Fé ainda não ungiu ${w.sovereign.title === 'rainha' ? 'a nova soberana' : 'o novo soberano'}, e a Casa Rhovar não mandou ninguém à coroação.`,
  });
}

export const OFICIO_TEXT: Record<string, string> = {
  faxineiro: 'varria os corredores deste castelo',
  cozinheiro: 'mexia os caldeirões das cozinhas reais',
  cavalarico: 'escovava os cavalos dos estábulos reais',
  copista: 'copiava livros na biblioteca do castelo',
  lavadeiro: 'lavava a roupa da casa real',
  carrasco: 'ajudava o carrasco de Valtheris',
  jardineiro: 'cuidava dos jardins do castelo',
};
