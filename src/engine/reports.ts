// Relatórios (o que o soberano sabe, com atraso e erro) e despachos (quem pede audiência).
import { HOUSES, PROV_DATA } from '../data/eldoria';
import { clamp, dateOf, fact, latest, monthIndex, remember } from './core';
import { gauss } from './rng';
import { PROVS } from './types';
import type { Dispatch, ProvId, Report, World } from './types';
import { travelDays, cost } from './decrees';
import { harvestFactor, fmt } from './systems/economy';
import { lowerHumor, lowerHunger, totalPop } from './systems/people';
import { groupName } from './systems/politics';
import { attachVoices } from './skills';

export function makeReports(w: World) {
  const o = w.sovereign.oficio;
  for (const id of PROVS) {
    const p = w.provinces[id];
    const days = travelDays(id, 'valtheris');
    const grainExact = o === 'cozinheiro';
    const humorSharp = o === 'faxineiro' || o === 'lavadeiro' || o === 'jardineiro';
    const n = (s: number) => 1 + s * gauss(w.rng);
    const stock = p.stock.grao * (grainExact ? 1 : n(0.12));
    const r: Report = {
      prov: id, madeDay: w.day, arrives: w.day + days,
      source: id === 'valtheris' ? 'o que você mesmo vê na capital' : `relatório do intendente de ${PROV_DATA[id].name}`,
      certainty: id === 'valtheris' ? 'visto' : 'relatorio',
      pop: totalPop(p) * n(0.03),
      hunger: clamp(lowerHunger(p) + (grainExact ? 0 : 0.03 * gauss(w.rng)), 0, 1),
      humor: clamp(lowerHumor(p) + (humorSharp ? 3 : 9) * gauss(w.rng), -100, 100),
      grainStock: stock,
      grainMonths: stock / Math.max(1, p.demandAvg.grao),
      grainPrice: p.price.grao * (grainExact ? 1 : n(0.04)),
      unrest: p.unrest,
      soldiers: p.garrison.soldiers * n(0.05),
      morale: clamp(p.garrison.morale + 0.06 * gauss(w.rng), 0, 1),
      facts: {
        pop: latest(w, `pop:${id}`)!, fome: latest(w, `fome:${id}:camponeses`)!, humor: latest(w, `humor:${id}:camponeses`)!,
        estoque: latest(w, `estoque:${id}:grao`)!, preco: latest(w, `preco:${id}:grao`)!, ordem: latest(w, `inquietacao:${id}`)!,
        guarnicao: latest(w, `guarnicao:${id}`)!, imposto: latest(w, `imposto:${id}`)!, producao: latest(w, `producao:${id}`)!,
      },
    };
    if (id === 'valtheris') { w.reports[id] = r; } else w.pendingReports.push(r);
  }
}

export function deliverReports(w: World) {
  const left: Report[] = [];
  for (const r of w.pendingReports) {
    if (r.arrives <= w.day) {
      const cur = w.reports[r.prov];
      if (!cur || cur.madeDay <= r.madeDay) w.reports[r.prov] = r;
    } else left.push(r);
  }
  w.pendingReports = left;
}

function hasOpen(w: World, topic: string) {
  return w.dispatches.some((d) => !d.answered && d.id.startsWith(`d:${topic}:`));
}

export function makeDispatches(w: World) {
  const mi = monthIndex(w.day);
  const add = (topic: string, d: Omit<Dispatch, 'id' | 'day' | 'expires' | 'answered'>) => {
    if (hasOpen(w, topic)) return;
    const ok = d.options.filter((o) => o.decree.verb === 'esperar' || cost(w, o.decree) <= w.treasury.coin);
    if (!ok.length) return;
    const id = `d:${topic}:${mi}`;
    for (const o of ok) if (o.decree.verb === 'esperar') o.decree = { verb: 'esperar', dispatch: id };
    const disp: Dispatch = { ...d, options: ok, id, topic, day: w.day, expires: w.day + 25, answered: false };
    attachVoices(w, disp);
    w.dispatches.push(disp);
    if (d.urgent) w.pauseRequest = d.title;
  };
  const wait = { label: 'Pedir paciência', decree: { verb: 'esperar', dispatch: '' } as const };

  const rg = w.provinces.rhovan.garrison;
  if (rg.arrears > 100) add('soldo', {
    who: 'Capitão da guarnição de Rhovan', face: 'soldado', prov: 'rhovan', group: 'exercito', urgent: false,
    title: 'Rhovan pede o soldo', fact: latest(w, 'guarnicao:rhovan'),
    text: `"Majestade, os homens estão ${rg.monthsUnpaid.toFixed(1).replace('.', ',')} meses sem soldo. Devemos ${fmt(rg.arrears)} coroas. Do outro lado do Dorn, Karsk paga em dia."`,
    options: [
      { label: `Pagar tudo (${fmt(rg.arrears)})`, decree: { verb: 'pagar_soldo', prov: 'rhovan', share: 1 } },
      { label: `Pagar metade (${fmt(rg.arrears / 2)})`, decree: { verb: 'pagar_soldo', prov: 'rhovan', share: 0.5 } },
      wait,
    ],
  });

  const { month } = dateOf(w.day);
  const V = w.provinces.veyra;
  if (month >= 3 && month <= 7) {
    const est = clamp(harvestFactor(V) + (w.sovereign.oficio === 'jardineiro' ? 0 : 0.08 * gauss(w.rng)), 0.3, 1.3);
    const ff = fact(w, 'previsao:veyra', `Previsão da colheita de Veyra: ${Math.round(est * 100)}%`, [
      { label: 'Chuva desde março', ref: latest(w, 'chuva:veyra') },
      { label: w.sovereign.oficio === 'jardineiro' ? 'Você mesmo leu os campos (você foi jardineiro)' : 'Estimativa do intendente, que pode errar' },
    ], { value: est, unit: 'fração', source: 'intendente de Veyra' });
    if (est < 0.92) add('colheita', {
      who: 'Intendente de Veyra', face: 'intendente', prov: 'veyra', urgent: false, fact: ff,
      title: 'Veyra teme pela colheita',
      text: `"O inverno foi seco e a primavera não ajuda. Pelo que vejo nos campos, a colheita vem em ${Math.round(est * 100)}% do normal. Se o grão faltar em agosto, faltará em todo o reino."`,
      options: [
        { label: 'Comprar 15 mil sacas em Veyra agora', decree: { verb: 'comprar_grao', prov: 'veyra', qty: 15000 } },
        { label: 'Importar 10 mil sacas pelo porto', decree: { verb: 'importar_grao', qty: 10000 } },
        wait,
      ],
    });
  }

  if (w.provinces.altamar.strata.mercadores.humor < -15 && w.port.tariff > 0.081) add('tarifa', {
    who: 'Mestre dos armadores de Altamar', face: 'mercador', prov: 'altamar', group: 'casa:avarenne', urgent: false,
    title: 'Altamar pede tarifas menores', fact: latest(w, 'humor:altamar:mercadores'),
    text: `"Com a tarifa em ${Math.round(w.port.tariff * 100)}%, os navios de Aurel preferem outros portos. Baixe a tarifa e o porto volta a viver." A Casa Caldran, que vende tecidos, pensa o contrário.`,
    options: [
      { label: 'Baixar para 8%', decree: { verb: 'tarifa', rate: 0.08 } },
      { label: 'Baixar para 5%', decree: { verb: 'tarifa', rate: 0.05 } },
      wait,
    ],
  });

  if (w.liga.offer) add('liga', {
    who: 'Banqueiro da Liga Mercantil', face: 'mercador', group: 'liga', urgent: false,
    title: 'A Liga oferece crédito', fact: latest(w, 'tesouro'),
    text: `"${fmt(w.liga.offer.amount)} coroas a ${(w.liga.offer.rate * 100).toFixed(1).replace('.', ',')}% ao mês. Pedimos só uma gentileza: que nossos membros paguem metade dos pedágios e tarifas por três anos." A Casa Merrow, que vive dos pedágios, não vai gostar.`,
    options: [
      { label: 'Aceitar o crédito', decree: { verb: 'credito_liga', accept: true } },
      { label: 'Recusar', decree: { verb: 'credito_liga', accept: false } },
      wait,
    ],
  });

  for (const id of PROVS) {
    const p = w.provinces[id];
    const name = PROV_DATA[id].name;
    if (lowerHunger(p) > 0.05 && p.unrest !== 'revolta') {
      const qty = Math.round(Math.min(w.granary, p.demandAvg.grao * 0.4) / 500) * 500;
      add(`fome:${id}`, {
        who: `Pároco de ${PROV_DATA[id].settlements[0]}`, face: 'clerigo', prov: id, group: `povo:${id}`, urgent: true,
        title: `Fome em ${name}`, fact: latest(w, `fome:${id}:camponeses`),
        text: `"Majestade, as crianças de ${name} comem casca de árvore. O grão está a ${p.price.grao.toFixed(2).replace('.', ',')} coroas a saca, e quem tem não vende."`,
        options: [
          ...(qty >= 500 ? [{ label: `Distribuir ${fmt(qty)} sacas do celeiro`, decree: { verb: 'distribuir_grao' as const, prov: id, qty } }] : []),
          { label: 'Isentar de impostos por 3 meses', decree: { verb: 'isentar', prov: id, months: 3 } },
          ...(qty < 500 ? [{ label: 'Importar 10 mil sacas pelo porto', decree: { verb: 'importar_grao' as const, qty: 10000 } }] : []),
          wait,
        ],
      });
    }
    if (p.unrest === 'motins' || p.unrest === 'revolta') {
      const pop = p.strata.camponeses.pop + p.strata.artesaos.pop;
      const need = Math.max(300, Math.ceil((pop * 0.003 - p.garrison.soldiers) / 100) * 100);
      const from: ProvId = id === 'valtheris' ? 'merovan' : 'valtheris';
      add(`ordem:${id}`, {
        who: `Intendente de ${name}`, face: 'intendente', prov: id, group: `povo:${id}`, urgent: true,
        title: p.unrest === 'revolta' ? `${name} em revolta` : `Motins em ${name}`, fact: latest(w, `inquietacao:${id}`),
        text: `"Não consigo cobrar nem manter a ordem. Mande soldados ou mande pão, Majestade. Ou os dois."`,
        options: [
          ...(w.provinces[from].garrison.soldiers > need ? [{ label: `Enviar ${fmt(need)} soldados para reprimir`, decree: { verb: 'enviar_tropas' as const, from, to: id, qty: need } }] : []),
          { label: 'Isentar por 6 meses', decree: { verb: 'isentar', prov: id, months: 6 } },
          wait,
        ],
      });
    }
  }

  if (mi % 2 === 0 || w.karsk.lastRaidMonth === mi) add('karsk', {
    who: 'Comandante de Rhovan', face: 'soldado', prov: 'rhovan', group: 'exercito', urgent: w.karsk.lastRaidMonth === mi, fact: latest(w, 'karsk'),
    title: 'Notícias de Karsk',
    text: `"Do Forte de Vhal contamos fogueiras. Diria que Karsk tem entre ${fmt(w.karsk.estimate * 0.85)} e ${fmt(w.karsk.estimate * 1.15)} homens do outro lado do Dorn. Eu tenho ${fmt(rg.soldiers)}, e metade quer ir para casa."`,
    options: [
      ...(w.provinces.valtheris.garrison.soldiers > 900 ? [{ label: 'Mandar 800 da guarda de Valtheris', decree: { verb: 'enviar_tropas' as const, from: 'valtheris' as ProvId, to: 'rhovan' as ProvId, qty: 800 } }] : []),
      ...(rg.arrears > 100 ? [{ label: 'Pagar o soldo atrasado', decree: { verb: 'pagar_soldo' as const, prov: 'rhovan' as ProvId, share: 1 } }] : []),
      wait,
    ],
  });

  const T = w.treasury;
  if (T.coin < T.lastExpense * 0.6 && T.lastExpense > 0) add('tesouro', {
    who: 'Tesoureiro', face: 'tesoureiro', urgent: false, fact: latest(w, 'tesouro'),
    title: 'O cofre está baixo',
    text: `"Restam ${fmt(T.coin)} coroas. No mês passado entraram ${fmt(T.lastIncome)} e saíram ${fmt(T.lastExpense)}. Ou cobramos mais, ou devemos mais."`,
    options: [
      { label: 'Imposto de 10% no reino', decree: { verb: 'taxar', prov: 'reino', rate: 0.1 } },
      ...(w.liga.offer ? [{ label: 'Aceitar o crédito da Liga', decree: { verb: 'credito_liga' as const, accept: true } }] : []),
      wait,
    ],
  });

  for (const h of Object.values(HOUSES)) {
    const g = w.groups[`casa:${h.id}`];
    if (!g.present) add(`casa:${h.id}`, {
      who: 'Mestre de cerimônias', face: 'nobre', prov: h.prov, group: g.id, urgent: false, fact: latest(w, `grupo:${g.id}`),
      title: `A ${h.name} não está na corte`,
      text: `"A ${h.name} não mandou ninguém para a homenagem. A corte repara nas cadeiras vazias, Majestade."`,
      options: [{ label: `Convocar a ${h.name}`, decree: { verb: 'convocar_casa', house: h.id } }, wait],
    });
  }

  const ig = w.groups.igreja;
  if (!w.anointed && ig.acceptance < 12) add('igreja', {
    who: 'Arcediago de Valtheris', face: 'clerigo', group: 'igreja', urgent: false, fact: latest(w, 'grupo:igreja'),
    title: 'A Ordem da Fé adia a unção',
    text: '"A Ordem ainda reza sobre o seu caso, Majestade. Um trono sem sangue precisa de muita bênção. E a Ordem quer voz no novo governo."',
    options: [
      { label: 'Doar 10 mil coroas à Ordem', decree: { verb: 'doar_igreja', amount: 10000 } },
      { label: 'Doar 25 mil coroas à Ordem', decree: { verb: 'doar_igreja', amount: 25000 } },
      wait,
    ],
  });
}

/** Despachos que vencem sem resposta ofendem quem pediu. */
export function expireDispatches(w: World) {
  for (const d of w.dispatches) {
    if (!d.answered && d.expires <= w.day) {
      d.answered = true;
      if (d.group) remember(w.groups[d.group].memory, { id: 'ignorado', label: 'O soberano não nos recebeu', weight: -4, decay: 0.1, strata: [] });
      if (d.prov && d.group?.startsWith('povo:')) remember(w.provinces[d.prov].grievances, { id: 'ignorado', label: 'O rei não nos ouviu', weight: -5, decay: 0.1, strata: ['camponeses', 'artesaos'] });
    }
  }
  w.dispatches = w.dispatches.filter((d) => !d.answered || w.day - d.day < 40).slice(-40);
}

export function nationalPovo(w: World) {
  let pop = 0, hum = 0;
  const parts = PROVS.map((id) => {
    const p = w.provinces[id];
    const n = p.strata.camponeses.pop + p.strata.artesaos.pop;
    pop += n; hum += n * lowerHumor(p);
    return { id, n, h: lowerHumor(p) };
  });
  fact(w, 'povo', 'Humor do povo no reino', parts.map((x) => ({ label: PROV_DATA[x.id].name, amount: (x.h * x.n) / pop, ref: latest(w, `inquietacao:${x.id}`) })), { value: hum / pop, unit: 'humor', source: 'relatórios das províncias' });
  void groupName;
}
