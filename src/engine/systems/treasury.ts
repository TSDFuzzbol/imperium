// Tesouro: receitas, despesas, dívida e atrasos. Fórmulas: PROPOSTA.
import { ADMIN_COST, COURT_COST, CROWN_LANDS, PROV_DATA, WAGE } from '../../data/eldoria';
import { chron, fact, latest, remember } from '../core';
import { PROVS } from '../types';
import type { FactFactor, World } from '../types';
import type { Cycle } from './economy';
import { fmt } from './economy';

export function treasury(w: World, c: Cycle) {
  const T = w.treasury;
  const start = T.coin;
  const income: FactFactor[] = [];
  for (const id of PROVS) income.push({ label: `Impostos de ${PROV_DATA[id].name}`, amount: c.tax[id], ref: c.taxFact[id] });
  const tollF = fact(w, 'pedagios', 'Pedágios de Merovan', c.tollFacts.slice(0, 12), { value: c.tolls, unit: 'coroas', source: 'coletores de pedágio' });
  const tarF = fact(w, 'tarifas', 'Tarifas do porto de Altamar', c.tariffFacts, { value: c.tariffs, unit: 'coroas', source: 'alfândega de Altamar' });
  income.push({ label: 'Pedágios de Merovan', amount: c.tolls, ref: tollF });
  income.push({ label: 'Tarifas do porto de Altamar', amount: c.tariffs, ref: tarF });
  income.push({ label: 'Terras da Coroa', amount: CROWN_LANDS });
  const totalIn = income.reduce((a, b) => a + (b.amount ?? 0), 0);
  T.coin += totalIn;

  const out: FactFactor[] = [];
  const pay = (label: string, amount: number, ref?: string) => {
    const paid = Math.min(amount, Math.max(0, T.coin));
    T.coin -= paid;
    out.push({ label, amount: -paid, ref, note: paid < amount - 0.5 ? `faltaram ${fmt(amount - paid)}` : undefined });
    return paid;
  };
  // 1. juros
  const interest = T.debt * T.interest;
  const ip = pay('Juros da dívida', interest);
  if (ip < interest - 1) {
    T.debt += interest - ip;
    remember(w.groups.liga.memory, { id: 'calote', label: 'A Coroa atrasou os juros', weight: -8, decay: 0.05, strata: [] });
    chron(w, { kind: 'tesouro', weight: 3, title: 'A Coroa atrasa os juros', text: 'O tesoureiro não conseguiu pagar os credores neste mês. Os juros não pagos foram somados à dívida, e os banqueiros da Liga comentam isso nas feiras.' });
  }
  // 2. administração
  const adm = ADMIN_COST * PROVS.length;
  const ap = pay('Administração das províncias', adm);
  T.adminArrears = ap < adm - 1 ? T.adminArrears + (adm - ap) : Math.max(0, T.adminArrears - (T.coin > 20000 ? Math.min(T.adminArrears, 5000) : 0));
  // 3. soldo do mês, proporcional entre as guarnições
  const bill = PROVS.reduce((a, id) => a + w.provinces[id].garrison.soldiers * WAGE, 0);
  const share = bill > 0 ? Math.min(1, Math.max(0, T.coin) / bill) : 1;
  for (const id of PROVS) {
    const g = w.provinces[id].garrison;
    const due = g.soldiers * WAGE;
    pay(`Soldo da guarnição de ${PROV_DATA[id].name}`, due * share, latest(w, `guarnicao:${id}`));
    g.arrears += due * (1 - share);
    g.monthsUnpaid = due > 0 ? Math.round((g.arrears / due) * 10) / 10 : 0;
  }
  if (share < 1) chron(w, { kind: 'tesouro', weight: 2, title: 'O soldo não foi pago inteiro', text: `O tesouro só cobriu ${Math.round(share * 100)}% do soldo deste mês. A diferença virou atraso nas guarnições.` });
  // 4. corte
  pay('Corte e casa real', COURT_COST);
  const totalOut = -out.reduce((a, b) => a + (b.amount ?? 0), 0);
  T.lastIncome = totalIn; T.lastExpense = totalOut;
  T.history.push({ month: c.mi, coin: T.coin, income: totalIn, expense: totalOut });
  if (T.history.length > 36) T.history.shift();
  fact(w, 'tesouro', 'Tesouro da Coroa', [
    { label: 'Saldo no começo do mês', amount: start },
    ...income, ...out,
  ], { value: T.coin, unit: 'coroas', source: w.sovereign.oficio === 'copista' ? 'livros conferidos por você' : 'tesoureiro' });
  fact(w, 'divida', 'Dívida da Coroa', [{ label: `Juros de ${(T.interest * 100).toFixed(2)}% ao mês`, amount: interest }], { value: T.debt, unit: 'coroas', source: 'tesoureiro' });
  // a oferta da Liga expira
  if (w.liga.offer && w.day >= w.liga.offer.expires) {
    w.liga.offer = null;
    remember(w.groups.liga.memory, { id: 'ignorada', label: 'O soberano ignorou nossa oferta', weight: -6, decay: 0.06, strata: [] });
    chron(w, { kind: 'tesouro', weight: 1, title: 'A Liga retira a oferta', text: 'Sem resposta da Coroa, os banqueiros da Liga Mercantil recolheram a proposta de crédito.' });
  }
}
