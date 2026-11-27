// Decretos compostos (verbo + alvo + modo). A ordem viaja até a província e só então vale.
import { HOUSES, KM_PER_DAY, PROV_DATA, ROADS, WAGE } from '../data/eldoria';
import { chron, clamp, fact, fmtDate, latest, monthIndex, nextId, remember } from './core';
import { PROVS } from './types';
import type { Command, Decree, HouseId, Order, ProvId, World } from './types';
import { groupName } from './systems/politics';
import { fmt } from './systems/economy';
import { runCheck } from './skills';

const dist: Record<string, number> = {};
function shortest(a: ProvId, b: ProvId): number {
  const k = `${a}|${b}`;
  if (dist[k] !== undefined) return dist[k];
  const d: Record<string, number> = { [a]: 0 };
  const todo = new Set<ProvId>(PROVS);
  while (todo.size) {
    let u: ProvId | null = null;
    for (const x of todo) if (d[x] !== undefined && (u === null || d[x] < d[u])) u = x;
    if (!u) break;
    todo.delete(u);
    for (const [x, y, km, q] of ROADS) {
      const v = x === u ? y : y === u ? x : null;
      if (!v) continue;
      const nd = d[u] + km / (0.7 + 0.3 * q);
      if (d[v] === undefined || nd < d[v]) d[v] = nd;
    }
  }
  return (dist[k] = d[b] ?? 999);
}
export function travelDays(a: ProvId, b: ProvId) {
  return a === b ? 1 : Math.max(1, Math.ceil(shortest(a, b) / KM_PER_DAY));
}

export function target(d: Decree): ProvId {
  switch (d.verb) {
    case 'taxar': return d.prov === 'reino' ? 'rhovan' : d.prov;
    case 'isentar': case 'comprar_grao': case 'distribuir_grao': case 'pagar_soldo': return d.prov;
    case 'tarifa': return 'altamar';
    case 'pedagio': return 'merovan';
    case 'importar_grao': return 'altamar';
    case 'enviar_tropas': return d.to;
    case 'convocar_casa': return HOUSES[d.house].prov;
    default: return 'valtheris';
  }
}

export function describe(d: Decree): string {
  const P = (p: ProvId) => PROV_DATA[p].name;
  switch (d.verb) {
    case 'taxar': return `Taxar ${d.prov === 'reino' ? 'o reino inteiro' : P(d.prov)} em ${Math.round(d.rate * 100)}%`;
    case 'isentar': return `Isentar ${P(d.prov)} de impostos por ${d.months} meses`;
    case 'tarifa': return `Fixar a tarifa do porto de Altamar em ${Math.round(d.rate * 100)}%`;
    case 'pedagio': return `Fixar os pedágios de Merovan em ${Math.round(d.rate * 100)}%`;
    case 'comprar_grao': return `Comprar ${fmt(d.qty)} sacas de grão em ${P(d.prov)} para o celeiro real`;
    case 'distribuir_grao': return `Distribuir ${fmt(d.qty)} sacas do celeiro real em ${P(d.prov)}`;
    case 'importar_grao': return `Importar ${fmt(d.qty)} sacas de grão pelo porto`;
    case 'pagar_soldo': return `Pagar ${Math.round(d.share * 100)}% do soldo atrasado de ${P(d.prov)}`;
    case 'enviar_tropas': return `Enviar ${fmt(d.qty)} soldados de ${P(d.from)} para ${P(d.to)}`;
    case 'credito_liga': return d.accept ? 'Aceitar o crédito da Liga Mercantil' : 'Recusar o crédito da Liga Mercantil';
    case 'doar_igreja': return `Doar ${fmt(d.amount)} coroas à Ordem da Fé`;
    case 'convocar_casa': return `Convocar a ${HOUSES[d.house].name} à corte`;
    case 'esperar': return 'Pedir paciência e esperar';
    case 'persuadir': return 'Tentar a sorte com as próprias palavras';
    case 'adiar': return 'Adiar a audiência';
    case 'dispensar': return 'Dispensar a audiência';
  }
}

/** Custo imediato em coroas (sai do tesouro na assinatura). */
export function cost(w: World, d: Decree): number {
  switch (d.verb) {
    case 'comprar_grao': return d.qty * w.provinces[d.prov].price.grao * 1.05;
    case 'importar_grao': return d.qty * w.port.world.grao * 1.12;
    case 'pagar_soldo': return w.provinces[d.prov].garrison.arrears * d.share;
    case 'doar_igreja': return d.amount;
    default: return 0;
  }
}

export function validate(w: World, d: Decree): string | null {
  const c = cost(w, d);
  if (c > w.treasury.coin + 0.5) return `O tesouro tem ${fmt(w.treasury.coin)} coroas; isso custa ${fmt(c)}.`;
  if (d.verb === 'distribuir_grao' && d.qty > w.granary + 0.5) return `O celeiro real tem só ${fmt(w.granary)} sacas.`;
  if (d.verb === 'enviar_tropas' && (d.qty > w.provinces[d.from].garrison.soldiers || d.from === d.to)) return 'Não há soldados suficientes para isso.';
  if (d.verb === 'credito_liga' && !w.liga.offer) return 'A Liga não está oferecendo crédito agora.';
  if ((d.verb === 'taxar' || d.verb === 'tarifa' || d.verb === 'pedagio') && (d.rate < 0 || d.rate > 0.4)) return 'Alíquota fora do razoável.';
  return null;
}

/** Dias que uma audiência adiada fica fora do Salão. */
export const POSTPONE_DAYS = 10;

/** Assina um decreto. Retorna erro ou null. */
export function issue(w: World, cmd: Omit<Command, 'day'>): string | null {
  const d = cmd.decree;
  const err = validate(w, d);
  if (err) return err;
  w.log.push({ ...cmd, day: w.day });
  if (d.verb === 'persuadir') { w.log.pop(); const e = runCheck(w, d.dispatch, d.check); if (!e) w.log.push({ ...cmd, day: w.day }); return e; }
  if (d.verb === 'adiar' || d.verb === 'dispensar') {
    const disp = w.dispatches.find((x) => x.id === d.dispatch && !x.answered);
    if (!disp) { w.log.pop(); return 'Essa audiência já terminou.'; }
    if (d.verb === 'adiar') {
      if (disp.postponed) { w.log.pop(); return 'Essa audiência já foi adiada uma vez.'; }
      disp.postponed = true;
      disp.hiddenUntil = w.day + POSTPONE_DAYS;
      disp.expires = Math.max(disp.expires, w.day) + POSTPONE_DAYS;
      return null;
    }
    disp.answered = true;
    if (disp.group) remember(w.groups[disp.group].memory, { id: 'dispensado', label: 'O soberano nos dispensou', weight: -2, decay: 0.15, strata: [] });
    else if (disp.prov) remember(w.provinces[disp.prov].grievances, { id: 'dispensado', label: 'O rei dispensou quem falava por nós', weight: -2, decay: 0.15, strata: ['camponeses', 'artesaos'] });
    return null;
  }
  if (d.verb === 'esperar') {
    const disp = w.dispatches.find((x) => x.id === d.dispatch);
    if (disp) { disp.answered = true; if (disp.group) remember(w.groups[disp.group].memory, { id: 'paciencia', label: 'Pediu paciência', weight: -1, decay: 0.2, strata: [] }); }
    return null;
  }
  const c = cost(w, d);
  w.treasury.coin -= c;
  if (d.verb === 'distribuir_grao') w.granary -= d.qty;
  if (d.verb === 'enviar_tropas') w.provinces[d.from].garrison.soldiers -= d.qty;
  if (d.verb === 'credito_liga') { applyDecree(w, d); markAnswered(w, d); return null; }
  const to = target(d);
  const from = d.verb === 'enviar_tropas' ? d.from : 'valtheris';
  const days = travelDays(from, to) + (d.verb === 'importar_grao' ? 18 : 0) + (d.verb === 'comprar_grao' ? travelDays(to, 'valtheris') : 0);
  const o: Order = { id: nextId(w, 'o'), issued: w.day, arrives: w.day + days, target: to, decree: d, label: describe(d), done: false };
  w.orders.push(o);
  markAnswered(w, d);
  chron(w, { kind: 'decreto', weight: 1, title: 'Decreto assinado', text: `${describe(d)}.${cmd.text ? ` Nas palavras do soberano: "${cmd.text}".` : ''} A ordem chega ao destino em ${days} ${days === 1 ? 'dia' : 'dias'} (${fmtDate(o.arrives, false)}).` });
  return null;
}

function markAnswered(w: World, d: Decree) {
  for (const disp of w.dispatches) if (!disp.answered && disp.options.some((o) => JSON.stringify(o.decree) === JSON.stringify(d))) disp.answered = true;
}

export function processOrders(w: World) {
  for (const o of w.orders) {
    if (o.done || o.arrives > w.day) continue;
    o.done = true;
    applyDecree(w, o.decree, o);
  }
  w.orders = w.orders.filter((o) => !o.done || w.day - o.arrives < 3);
}

function applyDecree(w: World, d: Decree, o?: Order) {
  const mi = monthIndex(w.day);
  const src = o ? `decreto de ${fmtDate(o.issued, false)}` : 'decreto';
  switch (d.verb) {
    case 'taxar': {
      const list = d.prov === 'reino' ? [...PROVS] : [d.prov];
      for (const id of list) {
        const p = w.provinces[id];
        const delta = d.rate - p.taxRate;
        p.taxRate = d.rate;
        const f = fact(w, `decreto:taxar:${id}`, `Imposto de ${PROV_DATA[id].name} mudou para ${Math.round(d.rate * 100)}%`, [{ label: `Era ${Math.round((d.rate - delta) * 100)}%`, amount: delta }], { source: src });
        if (Math.abs(delta) > 0.004) {
          remember(p.grievances, { id: 'imposto', label: delta > 0 ? 'O rei aumentou o imposto' : 'O rei baixou o imposto', weight: -delta * 160, decay: 0.08, strata: ['camponeses', 'artesaos', 'mercadores'], fact: f });
          remember(w.groups[`casa:${PROV_DATA[id].house}`].memory, { id: 'imposto', label: delta > 0 ? 'Mais imposto em nossas terras' : 'Menos imposto em nossas terras', weight: -delta * 90, decay: 0.06, strata: [], fact: f });
        }
      }
      break;
    }
    case 'isentar': {
      const p = w.provinces[d.prov];
      p.exemptUntilMonth = mi + d.months - 1;
      const f = fact(w, `decreto:isentar:${d.prov}`, `${PROV_DATA[d.prov].name} isenta de impostos`, [{ label: `${d.months} meses` }], { source: src });
      remember(p.grievances, { id: 'isencao', label: 'O rei nos isentou', weight: 10, decay: 0.06, strata: ['camponeses', 'artesaos', 'mercadores'], fact: f });
      break;
    }
    case 'tarifa': {
      const old = w.port.tariff; w.port.tariff = d.rate;
      fact(w, 'decreto:tarifa', `Tarifa do porto: ${Math.round(d.rate * 100)}%`, [{ label: `Era ${Math.round(old * 100)}%`, amount: d.rate - old }], { source: src });
      break;
    }
    case 'pedagio': {
      const old = w.tolls; w.tolls = d.rate;
      fact(w, 'decreto:pedagio', `Pedágios de Merovan: ${Math.round(d.rate * 100)}%`, [{ label: `Eram ${Math.round(old * 100)}%`, amount: d.rate - old }], { source: src });
      break;
    }
    case 'comprar_grao': {
      const p = w.provinces[d.prov];
      const got = Math.min(d.qty, p.stock.grao * 0.5);
      p.stock.grao -= got;
      w.granary += got;
      const refund = (d.qty - got) * p.price.grao * 1.05;
      w.treasury.coin += refund;
      fact(w, `decreto:comprar:${d.prov}`, `Coroa comprou ${fmt(got)} sacas em ${PROV_DATA[d.prov].name}`, [{ label: 'Retirado do mercado local', amount: -got }], { source: src });
      if (d.prov === 'veyra') remember(w.groups['casa:deveyr'].memory, { id: 'compra', label: 'A Coroa comprou nosso grão', weight: 3, decay: 0.1, strata: [] });
      break;
    }
    case 'importar_grao': {
      w.granary += d.qty;
      fact(w, 'decreto:importar', `Chegaram ${fmt(d.qty)} sacas importadas`, [], { source: src });
      chron(w, { kind: 'economia', weight: 1, title: 'Navios de grão em Altamar', text: `${fmt(d.qty)} sacas compradas fora do reino chegaram ao celeiro real.` });
      break;
    }
    case 'distribuir_grao': {
      const p = w.provinces[d.prov];
      p.relief += d.qty;
      const f = fact(w, `alivio:${d.prov}`, `Grão da Coroa distribuído em ${PROV_DATA[d.prov].name}`, [{ label: 'Sacas do celeiro real', amount: d.qty }], { source: src });
      remember(p.grievances, { id: 'pao', label: 'O pão do rei', weight: Math.min(18, d.qty / 1200), decay: 0.07, strata: ['camponeses', 'artesaos'], fact: f });
      remember(w.groups.igreja.memory, { id: 'caridade', label: 'A caridade do trono', weight: Math.min(6, d.qty / 4000), decay: 0.08, strata: [], fact: f });
      if (d.prov === 'veyra') remember(w.groups['casa:deveyr'].memory, { id: 'graodado', label: 'Grão de graça derruba nosso preço', weight: -3, decay: 0.1, strata: [], fact: f });
      chron(w, { kind: 'decreto', prov: d.prov, weight: 2, fact: f, title: `O pão do rei em ${PROV_DATA[d.prov].name}`, text: `Carroças do celeiro real chegaram a ${PROV_DATA[d.prov].name} com ${fmt(d.qty)} sacas. As filas começaram antes do amanhecer.` });
      break;
    }
    case 'pagar_soldo': {
      const g = w.provinces[d.prov].garrison;
      const paid = g.arrears * d.share;
      g.arrears -= paid;
      const due = g.soldiers * WAGE;
      g.monthsUnpaid = due > 0 ? Math.round((g.arrears / due) * 10) / 10 : 0;
      g.morale = clamp(g.morale + 0.12 * d.share, 0, 1);
      const f = fact(w, `decreto:soldo:${d.prov}`, `Soldo atrasado pago em ${PROV_DATA[d.prov].name}`, [{ label: 'Coroas entregues', amount: paid }], { source: src });
      remember(w.groups.exercito.memory, { id: `soldo:${d.prov}`, label: 'O soberano pagou o que devia', weight: 6 * d.share, decay: 0.06, strata: [], fact: f });
      if (d.prov === 'rhovan') remember(w.groups['casa:rhovar'].memory, { id: 'soldo', label: 'A Coroa pagou Rhovan', weight: 5 * d.share, decay: 0.05, strata: [], fact: f });
      chron(w, { kind: 'guerra', prov: d.prov, weight: 2, fact: f, title: `Prata chega a ${PROV_DATA[d.prov].name}`, text: `A carroça do tesouro entregou ${fmt(paid)} coroas de soldo atrasado. Os soldados contaram as moedas duas vezes.` });
      break;
    }
    case 'enviar_tropas': {
      const p = w.provinces[d.to];
      p.garrison.soldiers += d.qty;
      if (p.unrest === 'revolta' || p.unrest === 'motins') {
        const pop = p.strata.camponeses.pop + p.strata.artesaos.pop;
        if (p.garrison.soldiers >= pop * 0.003) {
          const dead = pop * 0.0015;
          p.strata.camponeses.pop -= dead * 0.8; p.strata.artesaos.pop -= dead * 0.2;
          p.unrest = 'tensa'; p.unrestMonths = 0;
          const f = fact(w, `repressao:${d.to}`, `Repressão em ${PROV_DATA[d.to].name}`, [{ label: 'Mortos', amount: -dead }, { label: 'Tropas enviadas', amount: d.qty }], { source: src });
          remember(p.grievances, { id: 'repressao', label: 'Os soldados do rei mataram os nossos', weight: -35, decay: 0.02, strata: ['camponeses', 'artesaos'], fact: f });
          remember(w.groups.igreja.memory, { id: 'sangue', label: 'Sangue de fiéis nas praças', weight: -4, decay: 0.05, strata: [], fact: f });
          const house = w.groups[`casa:${PROV_DATA[d.to].house}`];
          if (house.rung === 5) { house.rung = 3; remember(house.memory, { id: 'derrota', label: 'Humilhados pelas tropas reais', weight: -10, decay: 0.03, strata: [], fact: f }); }
          else remember(house.memory, { id: 'ordem', label: 'A Coroa restaurou a ordem', weight: 5, decay: 0.08, strata: [], fact: f });
          chron(w, { kind: 'guerra', prov: d.to, weight: 3, fact: f, title: `Sangue em ${PROV_DATA[d.to].name}`, text: `As tropas reais entraram em ${PROV_DATA[d.to].name}. Cerca de ${fmt(dead)} pessoas morreram nas ruas. A ordem voltou. O silêncio que ficou não é paz.` });
        }
      }
      break;
    }
    case 'credito_liga': {
      const off = w.liga.offer!;
      if (d.accept) {
        const T = w.treasury;
        T.interest = (T.debt * T.interest + off.amount * off.rate) / (T.debt + off.amount);
        T.debt += off.amount; T.coin += off.amount;
        w.liga.privilegeUntilMonth = mi + 36;
        const f = fact(w, 'decreto:credito_liga', 'Crédito da Liga aceito', [{ label: 'Empréstimo', amount: off.amount }, { label: 'Privilégio: metade de pedágios e tarifas por 3 anos' }], { source: 'decreto' });
        remember(w.groups.liga.memory, { id: 'credito', label: 'Fez negócio conosco', weight: 10, decay: 0.03, strata: [], fact: f });
        remember(w.groups['casa:merrow'].memory, { id: 'liga', label: 'O rei se vendeu à Liga', weight: -8, decay: 0.04, strata: [], fact: f });
        chron(w, { kind: 'tesouro', weight: 2, fact: f, title: 'O crédito da Liga', text: `${fmt(off.amount)} coroas entraram no tesouro. Em troca, por três anos, os membros da Liga pagam metade dos pedágios e tarifas.` });
      } else {
        remember(w.groups.liga.memory, { id: 'recusa', label: 'Recusou nossa oferta', weight: -4, decay: 0.06, strata: [] });
        chron(w, { kind: 'tesouro', weight: 1, title: 'Crédito recusado', text: 'O soberano recusou o crédito da Liga Mercantil. Os banqueiros agradeceram com sorrisos curtos.' });
      }
      w.liga.offer = null;
      break;
    }
    case 'doar_igreja': {
      const f = fact(w, 'decreto:doacao', `Doação de ${fmt(d.amount)} coroas à Ordem da Fé`, [], { source: src });
      remember(w.groups.igreja.memory, { id: 'doacao', label: 'Doações do trono', weight: Math.min(20, d.amount / 1500), decay: 0.05, strata: [], fact: f });
      w.groups.igreja.wealth += d.amount;
      break;
    }
    case 'convocar_casa': {
      const g = w.groups[`casa:${d.house}`];
      const name = groupName(g.id);
      const f = fact(w, `convocacao:${d.house}`, `Convocação da ${name}`, [{ label: 'Aceitação da casa', amount: g.acceptance, ref: latest(w, `grupo:${g.id}`) }], { source: src });
      if (g.acceptance > -32 && g.rung < 4) {
        g.present = true; g.rung = Math.min(g.rung, 1) as 0 | 1;
        remember(g.memory, { id: 'convocada', label: 'Foi chamada com honra', weight: 3, decay: 0.1, strata: [], fact: f });
        chron(w, { kind: 'politica', weight: 2, fact: f, title: `${name} atende ao chamado`, text: `A ${name} mandou um representante a Valtheris. Ele se curvou, devagar.` });
      } else {
        for (const h of Object.keys(HOUSES) as HouseId[]) remember(w.groups[`casa:${h}`].memory, { id: 'desafio', label: 'O rei foi desafiado e nada aconteceu', weight: -2, decay: 0.1, strata: [], fact: f });
        chron(w, { kind: 'politica', weight: 3, fact: f, title: `${name} ignora o rei`, text: `O mensageiro real voltou sem resposta da ${name}. A corte inteira soube antes do jantar.` });
      }
      break;
    }
  }
}
