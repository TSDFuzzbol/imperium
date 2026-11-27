// Interface: só lê o mundo e emite decretos. Toda regra está no motor (src/engine).
import { GOOD_DATA, HOUSES, PROV_DATA, STRATUM_NAMES } from '../data/eldoria';
import { dateOf, fmtDate, fmtMonth, monthIndex } from '../engine/core';
import { cost, describe, issue, travelDays, target } from '../engine/decrees';
import { bootstrap, OFICIO_TEXT, stepDay } from '../engine/sim';
import { lowerHumor, totalPop } from '../engine/systems/people';
import { groupName, RUNG_NAMES } from '../engine/systems/politics';
import { createWorld } from '../engine/world';
import { PROVS } from '../engine/types';
import type { CheckResult, ChronEntry, Decree, Dispatch, HouseId, Laco, Oficio, ProvId, Sovereign, World } from '../engine/types';
import { esc, fmtAmount, fmtValue, humorWord, hungerWord, n0, n2, pct, UNREST_WORD } from './fmt';
import { LAYERS, mapSvg, paintMap } from './map';
import type { Layer } from './map';
import { HAIR, portrait, roleFace, SKIN } from './portrait';
import { tutorialHtml } from './tutorial';
import { ATTR_NAMES, baseSkills, dispatchChecks, FREE_POINTS, SKILL_DATA, SKILL_MAX, skillOf } from '../engine/skills';
import { SKILLS } from '../engine/types';
import type { SkillId } from '../engine/types';
import type { Face } from './portrait';

type View = 'salao' | 'reino' | 'cronica' | 'mesa';
interface Draft { verb: Decree['verb']; prov: ProvId | 'reino'; rate: number; months: number; qty: number; share: number; from: ProvId; to: ProvId; amount: number; house: HouseId; accept: boolean; text: string }

const S = {
  w: null as World | null,
  view: 'salao' as View,
  speed: 0,
  layer: 'humor' as Layer,
  prov: null as ProvId | null,
  fios: [] as string[],
  draft: null as Draft | null,
  autoPause: true,
  toast: '',
  creating: null as null | { step: number; s: Sovereign },
  importing: false,
  skOpen: false,
  lastMonth: -1,
};

// ---------------- salvamento ----------------
const DB = 'imperium', STORE = 'saves';
function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
}
async function save() {
  if (!S.w) return;
  try {
    const db = await idb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(JSON.stringify(S.w), 'atual');
  } catch { /* sem armazenamento: o jogo continua */ }
}
async function load(): Promise<World | null> {
  try {
    const db = await idb();
    return await new Promise((res) => {
      const r = db.transaction(STORE).objectStore(STORE).get('atual');
      r.onsuccess = () => { try { res(r.result ? JSON.parse(r.result) : null); } catch { res(null); } };
      r.onerror = () => res(null);
    });
  } catch { return null; }
}

// ---------------- relógio ----------------
const SPEEDS = [0, 700, 220, 60];
let timer: number | undefined;
function setSpeed(s: number) {
  S.speed = s;
  if (timer) clearInterval(timer);
  timer = undefined;
  if (s > 0) timer = window.setInterval(tick, SPEEDS[s]);
  renderHeader();
}
function tick() {
  const w = S.w;
  if (!w) return;
  w.pauseRequest = null;
  const cycled = stepDay(w);
  if (w.pauseRequest && S.autoPause) {
    S.toast = `Pausado: ${w.pauseRequest}`;
    setSpeed(0);
  }
  if (cycled) save();
  if (cycled || S.speed < 3 || w.day % 6 === 0 || S.speed === 0) render();
  else renderHeader();
}

// ---------------- auxiliares ----------------
const $ = (id: string) => document.getElementById(id)!;
function sovFace(w: World): Face {
  const s = w.sovereign;
  return { ...s.look, age: s.age + Math.floor(w.day / 360), female: s.title === 'rainha', mood: lowerHumor(w.provinces.valtheris), wear: 'coroa', mantle: 'real' };
}
function title(w: World) { return `${w.sovereign.title === 'rainha' ? 'Rainha' : 'Rei'} ${w.sovereign.name}`; }
function thread(id: string | undefined, label = 'por quê?') {
  return id ? `<button class="why" data-a="fios" data-v="${id}" aria-label="Ver os fios">${label}</button>` : '';
}
const RUNG_CLASS = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'];

// ---------------- cabeçalho ----------------
function renderHeader() {
  const w = S.w;
  const h = $('hdr');
  if (!w) { h.innerHTML = ''; return; }
  const d = dateOf(w.day);
  const reign = w.day + 1;
  h.innerHTML = `
    <button class="hdr-who" data-a="view" data-v="salao">${portrait(sovFace(w), 34, 'hp')}<span><b>${esc(title(w))}</b><small>dia ${reign} do reinado</small></span></button>
    <div class="hdr-date"><span class="dd">${d.dom}</span><span class="mm">${fmtMonth(w.day)}</span><button class="help-b" data-a="help" aria-label="Como jogar">?</button></div>
    <div class="speed" role="group" aria-label="Velocidade">
      ${['❚❚', '▶', '▶▶', '▶▶▶'].map((t, i) => `<button class="${S.speed === i ? 'on' : ''}" data-a="speed" data-v="${i}" aria-label="${['Pausar', 'Normal', 'Rápido', 'Muito rápido'][i]}">${t}</button>`).join('')}
    </div>
    <div class="hdr-res">
      <button data-a="fios" data-v="${w.factIndex.tesouro}"><i class="ico coin"></i>${n0(w.treasury.coin)}<small>coroas</small></button>
      <button data-a="fios" data-v="${w.factIndex.divida}"><i class="ico debt"></i>${n0(w.treasury.debt)}<small>dívida</small></button>
      <span><i class="ico grain"></i>${n0(w.granary)}<small>celeiro</small></span>
    </div>`;
}

// ---------------- Salão ----------------
function dispatchCard(w: World, d: Dispatch) {
  const mood = d.group ? w.groups[d.group]?.acceptance ?? 0 : -10;
  const opts = d.options.map((o) => {
    const c = o.decree.verb === 'esperar' ? 0 : cost(w, o.decree);
    const dis = c > w.treasury.coin + 0.5;
    return `<button class="opt ${o.decree.verb === 'esperar' ? 'wait' : ''}" ${dis ? 'disabled' : ''} data-a="decree" data-v='${esc(JSON.stringify(o.decree))}'>${esc(o.label)}</button>`;
  });
  // testes: só a chance em porcentagem; uma tentativa por audiência
  const checks = dispatchChecks(w, d).map((c) => {
    const p = Math.round(c.chance * 100);
    const tone = p >= 70 ? 'hi' : p >= 40 ? 'mid' : 'lo';
    return `<button class="opt check ${tone}" data-a="decree" data-v='${esc(JSON.stringify({ verb: 'persuadir', dispatch: d.id, check: c.id }))}'>
      <span class="ck-tag">${esc(SKILL_DATA[c.skill].name)} · <b>${p}%</b></span><span>${esc(c.label)}</span></button>`;
  });
  const wi = d.options.findIndex((o) => o.decree.verb === 'esperar');
  const wait = wi >= 0 ? opts.splice(wi, 1)[0] : '';
  const allOpts = [...opts, ...checks, wait].join('');
  const voices = (d.voices ?? []).map((v) => `<p class="voice ${v.skill === 'memoria' ? 'mem' : 'a-' + SKILL_DATA[v.skill].attr}"><b>${v.skill === 'memoria' ? 'Memória de Criado' : SKILL_DATA[v.skill].name}</b> ${esc(v.text)}</p>`).join('');
  return `<article class="disp ${d.urgent ? 'urgent' : ''}">
    <div class="disp-face">${portrait(roleFace(d.who, d.face, mood), 64, 'd' + d.id.replace(/\W/g, ''))}</div>
    <div class="disp-body">
      <header><small>${esc(d.who)}${d.prov ? ` · ${PROV_DATA[d.prov].name}` : ''}</small><h3>${esc(d.title)}</h3></header>
      <p class="quote">${esc(d.text)}</p>
      ${voices ? `<div class="voices">${voices}</div>` : ''}
      <div class="opts">${allOpts}</div>
      <footer>${thread(d.fact, 'ver os fios')}<small>espera até ${fmtDate(d.expires, false)}</small></footer>
    </div></article>`;
}

function legitimacyBlock(w: World) {
  const order = ['igreja', 'exercito', 'liga', ...Object.keys(HOUSES).map((h) => `casa:${h}`)];
  const chips = order.map((id) => {
    const g = w.groups[id];
    return `<button class="leg ${RUNG_CLASS[g.rung]}" data-a="fios" data-v="${w.factIndex[`grupo:${id}`]}">
      <span class="leg-n">${esc(groupName(id))}${g.id.startsWith('casa:') && !g.present ? ' <em>ausente</em>' : ''}</span>
      <span class="leg-r">${RUNG_NAMES[g.rung]}</span><span class="leg-bar"><i style="left:${50 + g.acceptance / 2}%"></i></span></button>`;
  }).join('');
  const povo = PROVS.map((id) => {
    const g = w.groups[`povo:${id}`];
    return `<button class="leg small ${RUNG_CLASS[g.rung]}" data-a="fios" data-v="${w.factIndex[`grupo:povo:${id}`]}"><span class="leg-n">${PROV_DATA[id].name}</span><span class="leg-r">${RUNG_NAMES[g.rung]}</span></button>`;
  }).join('');
  return `<section class="card"><h2>Quem aceita seu direito de reinar</h2>
    <p class="lede">Não há prazo nem julgamento. Cada grupo decide sozinho, pelo que quer e pelo que sabe. ${w.anointed ? 'A Ordem da Fé já ungiu você.' : 'A Ordem da Fé ainda não ungiu você.'}${w.pretender > 0.2 ? ' Fala-se de um pretendente.' : ''}</p>
    <div class="legs">${chips}</div><h4>O povo das províncias</h4><div class="legs povo">${povo}</div></section>`;
}

function ordersBlock(w: World) {
  const open = w.orders.filter((o) => !o.done);
  if (!open.length) return '';
  return `<section class="card"><h2>Ordens a caminho</h2><ul class="orders">${open.map((o) => {
    const tot = Math.max(1, o.arrives - o.issued), done = w.day - o.issued;
    return `<li><span>${esc(o.label)}</span><span class="prog"><i style="width:${Math.min(100, (done / tot) * 100)}%"></i></span><small>chega em ${fmtDate(o.arrives, false)}</small></li>`;
  }).join('')}</ul></section>`;
}

function renderSalao(w: World) {
  const s = w.sovereign;
  const open = w.dispatches.filter((d) => !d.answered).sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.expires - b.expires);
  return `<section class="throne">
      <div class="throne-p">${portrait(sovFace(w), 112, 'tp')}</div>
      <div><p class="eyebrow">Castelo de Valtheris</p><h1>${esc(title(w))}</h1>
      <p class="lede">Até o mês passado, ${OFICIO_TEXT[s.oficio]}. Nasceu em ${PROV_DATA[s.origem].name}. ${s.age + Math.floor(w.day / 360)} anos.</p>
      <p class="traits">${s.traits.map((t) => `<span>${esc(t)}</span>`).join('')}</p></div>
    </section>
    <details class="card sk-card" ${S.skOpen ? 'open' : ''}><summary data-a="sktoggle"><h2>Suas habilidades</h2></summary>
      <div class="sk-grid">${(Object.keys(ATTR_NAMES) as (keyof typeof ATTR_NAMES)[]).map((a) => `<div><h4>${ATTR_NAMES[a]}</h4>${SKILLS.filter((k) => SKILL_DATA[k].attr === a).map((k) => `<p><span>${SKILL_DATA[k].name}</span>${pips(skillOf(w, k))}</p>`).join('')}</div>`).join('')}</div>
    </details>
    <section class="card"><h2>Pedem audiência <span class="count">${open.length}</span></h2>
      ${open.length ? open.map((d) => dispatchCard(w, d)).join('') : '<p class="empty">Ninguém espera por você agora. Deixe o tempo correr.</p>'}
    </section>
    ${ordersBlock(w)}
    ${legitimacyBlock(w)}`;
}

// ---------------- Reino ----------------
function provSheet(w: World, id: ProvId) {
  const r = w.reports[id];
  const p = w.provinces[id];
  const d = PROV_DATA[id];
  if (!r) return '';
  const age = w.day - r.madeDay;
  const house = w.groups[`casa:${d.house}`];
  const row = (k: string, v: string, f?: string, cls = '') => `<button class="row ${cls}" data-a="fios" data-v="${f ?? ''}" ${f ? '' : 'disabled'}><span>${k}</span><b>${v}</b><i>›</i></button>`;
  const exempt = p.exemptUntilMonth >= monthIndex(w.day);
  return `<div class="sheet-h"><div><p class="eyebrow">${esc(d.role)}</p><h2>${d.name}</h2></div><button class="x" data-a="closeprov" aria-label="Fechar">✕</button></div>
    <p class="seal ${r.certainty}">${r.certainty === 'visto' ? 'Visto com os próprios olhos' : `Relatório do intendente · ${age <= 0 ? 'chegou hoje' : `feito há ${age} dias`}`}</p>
    <div class="rows">
      ${row('População', n0(r.pop), r.facts.pop)}
      ${row('Humor do povo', humorWord(r.humor), r.facts.humor, r.humor < -40 ? 'bad' : r.humor > 15 ? 'good' : '')}
      ${row('Fome', hungerWord(r.hunger), r.facts.fome, r.hunger > 0.05 ? 'bad' : '')}
      ${row('Grão nos mercados', `${n0(r.grainStock)} sacas · ${r.grainMonths.toFixed(1).replace('.', ',')} meses`, r.facts.estoque, r.grainMonths < 1.5 ? 'bad' : '')}
      ${row('Preço do grão', `${n2(r.grainPrice)} coroas/saca`, r.facts.preco, r.grainPrice > 1.6 ? 'bad' : '')}
      ${row('Ordem', UNREST_WORD[r.unrest], r.facts.ordem, r.unrest === 'motins' || r.unrest === 'revolta' ? 'bad' : '')}
      ${row('Guarnição', `${n0(r.soldiers)} soldados · moral ${pct(r.morale)}${p.garrison.monthsUnpaid > 0 ? ` · ${p.garrison.monthsUnpaid.toFixed(1).replace('.', ',')} meses sem soldo` : ''}`, r.facts.guarnicao, p.garrison.monthsUnpaid > 0 ? 'bad' : '')}
      ${row('Imposto', exempt ? 'isenta' : w.treasury.history.length ? `${pct(p.taxRate)} · último mês ${n0(w.facts[r.facts.imposto]?.value ?? 0)} coroas` : `${pct(p.taxRate)} · primeira coleta no fim do mês`, r.facts.imposto)}
      ${row('Produção do mês', w.treasury.history.length ? `${n0(w.facts[r.facts.producao]?.value ?? 0)} coroas` : 'conta no fim do mês', r.facts.producao)}
      ${row(HOUSES[d.house].name, `${RUNG_NAMES[house.rung]}${house.present ? '' : ' · ausente da corte'}`, w.factIndex[`grupo:${house.id}`], house.rung >= 2 ? 'bad' : '')}
    </div>
    <h4>Grupos da província</h4>
    <div class="strata">${(['camponeses', 'artesaos', 'mercadores', 'clero', 'nobreza'] as const).map((s) => {
      const st = p.strata[s];
      return `<button data-a="fios" data-v="${w.factIndex[`humor:${id}:${s}`] ?? ''}"><b>${STRATUM_NAMES[s]}</b><span>${n0(st.pop)}</span><span class="${st.humor < -40 ? 'bad' : ''}">${humorWord(st.humor)}</span></button>`;
    }).join('')}</div>
    <h4>Ordenar</h4>
    <div class="acts">
      <button data-a="draft" data-v="taxar" data-p="${id}">Mudar o imposto</button>
      <button data-a="draft" data-v="isentar" data-p="${id}">Isentar</button>
      <button data-a="draft" data-v="distribuir_grao" data-p="${id}">Distribuir grão</button>
      <button data-a="draft" data-v="comprar_grao" data-p="${id}">Comprar grão</button>
      <button data-a="draft" data-v="enviar_tropas" data-p="${id}">Enviar tropas</button>
      ${p.garrison.arrears > 100 ? `<button data-a="draft" data-v="pagar_soldo" data-p="${id}">Pagar soldo</button>` : ''}
    </div>
    <p class="note">Os números da província chegam por mensageiro e podem estar errados. O imposto é a sua lei, e você sabe exatamente qual é.</p>`;
}

function renderReino(w: World) {
  return `<div class="layers" role="tablist">${LAYERS.map((l) => `<button role="tab" class="${S.layer === l.id ? 'on' : ''}" data-a="layer" data-v="${l.id}">${l.name}</button>`).join('')}</div>
    <div class="mapwrap">${mapSvg()}</div>
    <p class="map-cap">Linhas douradas: grão que andou pelas estradas no último mês. Toque numa província.</p>
    ${S.prov ? '' : `<section class="card"><h2>Eldoria em números</h2>${kingdomTable(w)}</section>`}`;
}

function kingdomTable(w: World) {
  return `<div class="tbl"><table><thead><tr><th>Província</th><th>Povo</th><th>Humor</th><th>Grão</th><th>Pão</th></tr></thead><tbody>${PROVS.map((id) => {
    const r = w.reports[id]!;
    return `<tr data-a="prov" data-v="${id}"><td>${PROV_DATA[id].name}</td><td>${n0(r.pop / 1000)} mil</td><td class="${r.humor < -40 ? 'bad' : ''}">${humorWord(r.humor)}</td><td class="${r.grainMonths < 1.5 ? 'bad' : ''}">${r.grainMonths.toFixed(1).replace('.', ',')} m</td><td>${n2(r.grainPrice)}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

// ---------------- Crônica ----------------
const KIND_ICON: Record<ChronEntry['kind'], string> = { clima: '☁', economia: '⚖', povo: '✶', tesouro: '◉', guerra: '⚔', decreto: '✒', politica: '♜', reinado: '♛' };
function renderCronica(w: World) {
  const items = [...w.chronicle].reverse();
  let cur = '';
  let html = '<section class="chron"><p class="eyebrow">A história registra</p><h1>Crônica do reinado</h1>';
  for (const c of items) {
    const m = fmtMonth(c.day);
    if (m !== cur) { cur = m; html += `<h3 class="chron-m">${m}</h3>`; }
    html += `<article class="ce w${c.weight} k-${c.kind}" ${c.fact ? `data-a="fios" data-v="${c.fact}"` : ''}>
      <span class="ce-i" aria-hidden="true">${KIND_ICON[c.kind]}</span>
      <div><small>${dateOf(c.day).dom} de ${fmtMonth(c.day).split(' ')[0]}${c.prov ? ` · ${PROV_DATA[c.prov].name}` : ''}</small><h4>${esc(c.title)}</h4><p>${esc(c.text)}</p>${c.fact ? '<span class="why">seguir os fios ›</span>' : ''}</div></article>`;
  }
  return html + '</section>';
}

// ---------------- Mesa ----------------
const VERBS: { v: Decree['verb']; name: string }[] = [
  { v: 'taxar', name: 'Taxar' }, { v: 'isentar', name: 'Isentar' }, { v: 'tarifa', name: 'Tarifa do porto' }, { v: 'pedagio', name: 'Pedágios' },
  { v: 'comprar_grao', name: 'Comprar grão' }, { v: 'distribuir_grao', name: 'Distribuir grão' }, { v: 'importar_grao', name: 'Importar grão' },
  { v: 'pagar_soldo', name: 'Pagar soldo' }, { v: 'enviar_tropas', name: 'Enviar tropas' }, { v: 'doar_igreja', name: 'Doar à Ordem' }, { v: 'convocar_casa', name: 'Convocar casa' },
];
function newDraft(verb: Decree['verb'], prov?: ProvId): Draft {
  const w = S.w!;
  const pv: ProvId = prov ?? 'valtheris';
  return { verb, prov: pv, rate: verb === 'tarifa' ? w.port.tariff : verb === 'pedagio' ? w.tolls : w.provinces[pv].taxRate, months: 3, qty: verb === 'enviar_tropas' ? 500 : 10000, share: 1, from: pv === 'valtheris' ? 'merovan' : 'valtheris', to: pv, amount: 10000, house: 'rhovar', accept: true, text: '' };
}
function draftDecree(d: Draft): Decree {
  switch (d.verb) {
    case 'taxar': return { verb: 'taxar', prov: d.prov, rate: d.rate };
    case 'isentar': return { verb: 'isentar', prov: d.prov as ProvId, months: d.months };
    case 'tarifa': return { verb: 'tarifa', rate: d.rate };
    case 'pedagio': return { verb: 'pedagio', rate: d.rate };
    case 'comprar_grao': return { verb: 'comprar_grao', prov: d.prov as ProvId, qty: d.qty };
    case 'distribuir_grao': return { verb: 'distribuir_grao', prov: d.prov as ProvId, qty: d.qty };
    case 'importar_grao': return { verb: 'importar_grao', qty: d.qty };
    case 'pagar_soldo': return { verb: 'pagar_soldo', prov: d.prov as ProvId, share: d.share };
    case 'enviar_tropas': return { verb: 'enviar_tropas', from: d.from, to: d.to, qty: d.qty };
    case 'doar_igreja': return { verb: 'doar_igreja', amount: d.amount };
    case 'convocar_casa': return { verb: 'convocar_casa', house: d.house };
    default: return { verb: 'credito_liga', accept: d.accept };
  }
}
function provSelect(id: string, val: string, withReino = false) {
  return `<select id="${id}" data-in="${id}">${withReino ? `<option value="reino" ${val === 'reino' ? 'selected' : ''}>Reino inteiro</option>` : ''}${PROVS.map((p) => `<option value="${p}" ${p === val ? 'selected' : ''}>${PROV_DATA[p].name}</option>`).join('')}</select>`;
}
/** Previsão dos conselheiros: aproximada, às vezes errada, nunca o resultado real. */
function forecast(w: World, d: Decree): string {
  switch (d.verb) {
    case 'taxar': {
      const list = d.prov === 'reino' ? [...PROVS] : [d.prov];
      const delta = list.reduce((a, id) => a + (w.facts[w.factIndex[`imposto:${id}`]]?.value ?? 0) / Math.max(0.01, w.provinces[id].taxRate) * (d.rate - w.provinces[id].taxRate), 0);
      if (Math.abs(delta) < 1) return 'É a alíquota que já vale. Mova a barra para ver o que muda.';
      return `O tesoureiro estima ${delta >= 0 ? 'mais' : 'menos'} ${n0(Math.abs(delta))} coroas por mês. ${d.rate > 0.1 ? 'O intendente avisa que o povo vai sentir, e as casas também.' : 'O intendente acha que o povo vai agradecer.'}`;
    }
    case 'distribuir_grao': return 'O pároco diz que o pão vai chegar às mãos certas. O intendente lembra que grão de graça baixa o preço, e os donos de terra não gostam.';
    case 'comprar_grao': return 'Comprar agora tira grão do mercado: o preço local deve subir. O celeiro real fica mais cheio para os meses ruins.';
    case 'importar_grao': return `Navios levam cerca de três semanas. Preço lá fora: ${n2(w.port.world.grao)} coroas por saca.`;
    case 'tarifa': return d.rate < w.port.tariff ? 'Os armadores vão comemorar. A Casa Caldran teme tecido estrangeiro barato. O tesouro perde tarifa por saca, mas pode ganhar em volume.' : 'Mais receita por navio, menos navios. Altamar vai reclamar.';
    case 'pedagio': return d.rate > w.tolls ? 'A Casa Merrow aplaude. Os mercadores vão subir preços para pagar.' : 'O grão anda mais barato pelas estradas. Merrow perde renda.';
    case 'pagar_soldo': return 'O capitão diz que a moral sobe assim que a prata chegar.';
    case 'enviar_tropas': return 'Tropas acalmam ou esmagam uma revolta. O povo lembra dos mortos por muito tempo.';
    case 'doar_igreja': return 'O confessor acha que a Ordem vai olhar para você com outros olhos. Ninguém promete a unção.';
    case 'convocar_casa': return `Seu mestre de cerimônias não sabe se a ${HOUSES[d.house].name} vai obedecer. Se recusar, toda a corte vai saber.`;
    default: return '';
  }
}
function draftForm(w: World, d: Draft) {
  const dec = draftDecree(d);
  const c = cost(w, dec);
  const err = (() => { try { return issue({ ...JSON.parse(JSON.stringify(w)), log: [] }, { decree: dec, publico: true }); } catch { return null; } })();
  const days = d.verb === 'credito_liga' ? 0 : travelDays(d.verb === 'enviar_tropas' ? d.from : 'valtheris', target(dec)) + (d.verb === 'importar_grao' ? 18 : 0);
  let f = '';
  const pct0 = (x: number) => Math.round(x * 100);
  switch (d.verb) {
    case 'taxar': f = `<label>Onde ${provSelect('d-prov', d.prov, true)}</label><label>Alíquota <b>${pct0(d.rate)}%</b><input type="range" id="d-rate" data-in="d-rate" min="0" max="30" value="${pct0(d.rate)}"></label>`; break;
    case 'isentar': f = `<label>Onde ${provSelect('d-prov', d.prov)}</label><label>Por <b>${d.months} meses</b><input type="range" id="d-months" data-in="d-months" min="1" max="12" value="${d.months}"></label>`; break;
    case 'tarifa': case 'pedagio': f = `<label>Taxa <b>${pct0(d.rate)}%</b><input type="range" id="d-rate" data-in="d-rate" min="0" max="30" value="${pct0(d.rate)}"></label>`; break;
    case 'comprar_grao': case 'distribuir_grao': f = `<label>Onde ${provSelect('d-prov', d.prov)}</label><label>Quanto <b>${n0(d.qty)} sacas</b><input type="range" id="d-qty" data-in="d-qty" min="1000" max="60000" step="1000" value="${d.qty}"></label>${d.verb === 'distribuir_grao' ? `<p class="note">O celeiro real tem ${n0(w.granary)} sacas.</p>` : ''}`; break;
    case 'importar_grao': f = `<label>Quanto <b>${n0(d.qty)} sacas</b><input type="range" id="d-qty" data-in="d-qty" min="1000" max="40000" step="1000" value="${d.qty}"></label>`; break;
    case 'pagar_soldo': f = `<label>Guarnição ${provSelect('d-prov', d.prov)}</label><label>Quanto do atraso <b>${pct0(d.share)}%</b><input type="range" id="d-share" data-in="d-share" min="10" max="100" step="10" value="${pct0(d.share)}"></label><p class="note">Atraso: ${n0(w.provinces[d.prov as ProvId].garrison.arrears)} coroas.</p>`; break;
    case 'enviar_tropas': f = `<label>De ${provSelect('d-from', d.from)}</label><label>Para ${provSelect('d-to', d.to)}</label><label>Soldados <b>${n0(d.qty)}</b><input type="range" id="d-qty" data-in="d-qty" min="100" max="${Math.max(100, w.provinces[d.from].garrison.soldiers)}" step="100" value="${d.qty}"></label>`; break;
    case 'doar_igreja': f = `<label>Valor <b>${n0(d.amount)} coroas</b><input type="range" id="d-amount" data-in="d-amount" min="2000" max="60000" step="1000" value="${d.amount}"></label>`; break;
    case 'convocar_casa': f = `<label>Casa <select id="d-house" data-in="d-house">${Object.values(HOUSES).map((h) => `<option value="${h.id}" ${h.id === d.house ? 'selected' : ''}>${h.name}${w.groups[`casa:${h.id}`].present ? '' : ' (ausente)'}</option>`).join('')}</select></label>`; break;
  }
  return `<section class="card decree">
    <h2>Decreto</h2>
    <div class="verbs">${VERBS.map((v) => `<button class="${d.verb === v.v ? 'on' : ''}" data-a="verb" data-v="${v.v}">${v.name}</button>`).join('')}</div>
    <div class="form">${f}</div>
    <div class="scroll">
      <p class="sc-text">${esc(describe(dec))}.</p>
      <p class="sc-meta">${c > 0 ? `Custo: ${n0(c)} coroas · ` : ''}${days ? `chega em ${days} ${days === 1 ? 'dia' : 'dias'}` : 'vale na hora'}</p>
      <p class="sc-fore"><b>O conselho acha:</b> ${esc(forecast(w, dec))}</p>
      <label class="words">Nas suas palavras (opcional)<textarea id="d-text" data-in="d-text" rows="2" placeholder="Que o pão chegue antes do inverno.">${esc(d.text)}</textarea></label>
      ${err ? `<p class="err">${esc(err)}</p>` : ''}
      <button class="sign" data-a="sign" ${err ? 'disabled' : ''}>Assinar e selar</button>
    </div></section>`;
}
function renderMesa(w: World) {
  const T = w.treasury;
  const hist = T.history.slice(-12);
  const max = Math.max(1, ...hist.map((h) => Math.max(h.income, h.expense)));
  const bars = hist.map((h) => `<div class="hb"><i class="in" style="height:${(h.income / max) * 100}%"></i><i class="out" style="height:${(h.expense / max) * 100}%"></i></div>`).join('');
  const d = S.draft ?? (S.draft = newDraft('taxar'));
  return `${draftForm(w, d)}
    ${ordersBlock(w)}
    <section class="card"><h2>Tesouro</h2>
      <div class="kv"><button data-a="fios" data-v="${w.factIndex.tesouro}"><span>No cofre</span><b>${n0(T.coin)} coroas</b></button>
      <button data-a="fios" data-v="${w.factIndex.divida}"><span>Dívida</span><b>${n0(T.debt)} · ${(T.interest * 100).toFixed(2).replace('.', ',')}% ao mês</b></button>
      <div><span>Último mês</span><b>+${n0(T.lastIncome)} / −${n0(T.lastExpense)}</b></div>
      <div><span>Tarifa do porto · pedágios</span><b>${pct(w.port.tariff)} · ${pct(w.tolls)}</b></div></div>
      ${hist.length ? `<div class="hist" aria-label="Receitas e despesas dos últimos meses">${bars}</div><p class="note">Dourado: receitas. Vinho: despesas. Um mês por coluna.</p>` : ''}
    </section>
    <section class="card"><h2>O jogo</h2>
      <label class="tog"><input type="checkbox" id="autopause" data-in="autopause" ${S.autoPause ? 'checked' : ''}> Pausar quando algo exigir o soberano</label>
      <p class="note">Semente desta partida: <b>${w.seed}</b>. Mesma semente e mesmas ordens contam a mesma história.</p>
      <div class="acts"><button data-a="help">Como jogar</button><button data-a="save">Salvar agora</button><button data-a="export">Copiar salvamento</button><button data-a="import">Colar salvamento</button><button data-a="newgame" class="danger">Nova partida</button></div>
      ${S.importing ? `<textarea id="imp" rows="4" placeholder="Cole aqui o salvamento"></textarea><button data-a="doimport">Carregar</button>` : ''}
    </section>`;
}

// ---------------- Os Fios ----------------
function renderFios(w: World) {
  const stack = S.fios;
  const id = stack[stack.length - 1];
  const f = w.facts[id];
  if (!f) return `<div class="fios"><div class="sheet-h"><h2>Os Fios</h2><button class="x" data-a="closefios">✕</button></div><p class="empty">Esse fio se perdeu: o fato é antigo demais e a memória do reino não o guardou.</p></div>`;
  const trail = stack.map((s, i) => `<button data-a="fiosback" data-v="${i}">${esc(w.facts[s]?.label ?? '…')}</button>`).join('<span>›</span>');
  const facs = [...f.factors];
  const max = Math.max(1e-9, ...facs.filter((x) => !x.note && x.amount !== undefined).map((x) => Math.abs(x.amount!)));
  const rows = facs.map((x) => {
    const bar = x.amount !== undefined && !x.note;
    const w0 = bar ? (Math.abs(x.amount!) / max) * 100 : 0;
    return `<li class="${x.ref ? 'has' : ''}" ${x.ref ? `data-a="fios" data-v="${x.ref}"` : ''}>
      <span class="th" aria-hidden="true"></span>
      <div class="fl"><span class="fl-l">${esc(x.label)}</span>${x.note ? `<small>${esc(x.note)}</small>` : ''}
      ${bar ? `<span class="fbar ${x.amount! >= 0 ? 'pos' : 'neg'}"><i style="width:${Math.max(2, w0)}%"></i></span>` : ''}</div>
      <b class="fa">${x.amount !== undefined ? fmtAmount(x.amount, f) : ''}</b>${x.ref ? '<i class="go">›</i>' : ''}</li>`;
  }).join('');
  return `<div class="fios">
    <div class="sheet-h"><div><p class="eyebrow">Os Fios</p></div><button class="x" data-a="closefios" aria-label="Fechar">✕</button></div>
    <nav class="trail">${trail}</nav>
    <div class="knot"><h2>${esc(f.label)}</h2>${f.value !== undefined ? `<p class="kv-big">${fmtValue(f.value, f.unit)}</p>` : ''}${f.text ? `<p>${esc(f.text)}</p>` : ''}
    <p class="src">Fonte: ${esc(f.source ?? 'desconhecida')} · ${fmtDate(f.day)}</p></div>
    ${rows ? `<ul class="threads">${rows}</ul>` : '<p class="empty">Nenhuma causa registrada. É assim que o reino começou.</p>'}
    <p class="note">Toque num fio com › para segui-lo até a causa da causa.</p></div>`;
}

// ---------------- Criação do soberano ----------------
const OFICIOS: { id: Oficio; name: string; forte: string; fraco: string; rede: string; efeito: string }[] = [
  { id: 'faxineiro', name: 'Faxineiro dos corredores', forte: 'Passar despercebido, conhecer cada porta do castelo', fraco: 'Letras e etiqueta', rede: 'Criados de quarto, porteiros', efeito: 'Você lê melhor o humor do povo e das casas.' },
  { id: 'cozinheiro', name: 'Cozinheiro', forte: 'Comida, preços, venenos, o humor de quem come', fraco: 'Guerra e diplomacia', rede: 'Cozinhas, mercados, fornecedores', efeito: 'Os números de grão e fome chegam sem erro.' },
  { id: 'cavalarico', name: 'Cavalariço', forte: 'Coragem, cavalos, a confiança dos soldados rasos', fraco: 'Não sabe ler', rede: 'Estábulos, soldados, mensageiros', efeito: 'As guarnições têm moral um pouco maior.' },
  { id: 'copista', name: 'Copista da biblioteca', forte: 'Documentos, números falsos, leis antigas', fraco: 'Corpo e falar em público', rede: 'Escribas e arquivistas', efeito: 'Menos desvio na coleta de impostos.' },
  { id: 'lavadeiro', name: 'Lavadeiro', forte: 'Segredos nas roupas: sangue, perfume, quem dormiu onde', fraco: 'O ofício mais desprezado', rede: 'Lavadeiras, costureiras, criadas', efeito: 'Você lê melhor o humor do povo e das casas.' },
  { id: 'carrasco', name: 'Ajudante do carrasco', forte: 'Sangue-frio, prisões, intimidação', fraco: 'A Igreja o vê como impuro', rede: 'Carcereiros, guardas, coveiros', efeito: 'O exército respeita; a Ordem da Fé desconfia.' },
  { id: 'jardineiro', name: 'Jardineiro', forte: 'Plantas, ervas, a colheita de Veyra', fraco: 'Vida na corte', rede: 'Jardineiros e camponeses', efeito: 'Você prevê a colheita sem errar.' },
];
const LACOS: { id: Laco; name: string; text: string; efeito: string }[] = [
  { id: 'riso', name: 'Eu o fazia rir', text: 'Era a única pessoa que falava com o rei como gente.', efeito: 'O povo gosta da história. As casas acham você um bobo.' },
  { id: 'verdade', name: 'Eu nunca menti para ele', text: 'Contou uma verdade que ninguém tinha coragem de dizer.', efeito: 'Fama de honesto entre os mercadores. Cartas sinceras do rei antigo virão.' },
  { id: 'cuidado', name: 'Eu cuidei dele quando ninguém cuidava', text: 'Na doença, foi você quem ficou.', efeito: 'A Ordem da Fé respeita o que você fez.' },
  { id: 'salvou', name: 'Eu salvei a vida dele', text: 'Uma noite, sem que ninguém soubesse.', efeito: 'O exército conta a história. Quem tentou matar Teodoro ainda está na corte.' },
];
const TRAIT_PAIRS = [['honesto', 'astuto'], ['manso', 'colérico'], ['crente', 'cético'], ['generoso', 'ambicioso'], ['paciente', 'impulsivo']];
const NAMES_M = ['Aldo', 'Bento', 'Caio', 'Davi', 'Elias', 'Joaquim', 'Tomé', 'Rui'];
const NAMES_F = ['Ada', 'Bia', 'Clara', 'Dora', 'Elsa', 'Inês', 'Joana', 'Lia'];

// ---------- habilidades na criação ----------
function spent(sv: Sovereign) { const b = baseSkills(sv.oficio, sv.laco); return SKILLS.reduce((a, k) => a + (sv.skills![k] - b[k]), 0); }
/** Começa na base do ofício e do laço; se o ofício ou o laço mudou, recomeça mantendo o que cabe. */
function ensureSkills(sv: Sovereign) {
  const b = baseSkills(sv.oficio, sv.laco);
  const old = sv.skills;
  sv.skills = { ...b };
  if (!old) return;
  let left = FREE_POINTS;
  for (const k of SKILLS) { const extra = Math.max(0, Math.min(old[k] - b[k], left, SKILL_MAX - b[k])); sv.skills[k] += extra; left -= extra; }
}
function pips(n: number, base = 0) {
  return `<span class="pips" aria-label="${n} de ${SKILL_MAX}">${Array.from({ length: SKILL_MAX }, (_, i) => `<i class="${i < base ? 'b' : i < n ? 'on' : ''}"></i>`).join('')}</span>`;
}
function skillsStep(sv: Sovereign) {
  ensureSkillsOnce(sv);
  const b = baseSkills(sv.oficio, sv.laco), sk = sv.skills!;
  const left = FREE_POINTS - spent(sv);
  const groups = (Object.keys(ATTR_NAMES) as (keyof typeof ATTR_NAMES)[]).map((a) => `<section class="sk-attr"><h4>${ATTR_NAMES[a]}</h4>${SKILLS.filter((k) => SKILL_DATA[k].attr === a).map((k) => `
    <div class="sk-row">
      <div class="sk-txt"><b>${SKILL_DATA[k].name}</b><span>${SKILL_DATA[k].what} ${SKILL_DATA[k].use}</span></div>
      <div class="sk-ctl">${pips(sk[k], b[k])}
        <span class="sk-btns"><button data-a="skill" data-v="${k}" data-d="-" aria-label="Tirar ponto de ${SKILL_DATA[k].name}" ${sk[k] <= b[k] ? 'disabled' : ''}>−</button><button data-a="skill" data-v="${k}" data-d="+" aria-label="Pôr ponto em ${SKILL_DATA[k].name}" ${left <= 0 || sk[k] >= SKILL_MAX ? 'disabled' : ''}>+</button></span></div>
    </div>`).join('')}</section>`).join('');
  return `<h2>O que você sabe fazer</h2>
    <p class="lede">As habilidades falam com você nas audiências e decidem se as suas palavras convencem. Os pontos escuros vêm do seu passado. Distribua o resto.</p>
    <p class="sk-left ${left ? '' : 'zero'}"><b>${left}</b> ${left === 1 ? 'ponto livre' : 'pontos livres'}</p>
    ${groups}`;
}
function ensureSkillsOnce(sv: Sovereign) { if (!sv.skills) ensureSkills(sv); }

function creationFace(): Face {
  const c = S.creating!;
  const s = c.s;
  return { ...s.look, age: s.age, female: s.title === 'rainha', mood: 10, wear: c.step >= 5 ? 'coroa' : 'nada', mantle: c.step >= 5 ? 'real' : 'simples' };
}
function renderCreation() {
  const c = S.creating!;
  const s = c.s;
  const face = creationFace();
  const steps = ['O chamado', 'Quem você era', 'De onde veio', 'Por que ele gostava de você', 'O que você sabe fazer', 'Quem você é'];
  const nav = `<div class="cr-nav">${c.step > 0 ? '<button data-a="crback">Voltar</button>' : '<span></span>'}<span class="cr-dots">${steps.map((_, i) => `<i class="${i === c.step ? 'on' : i < c.step ? 'done' : ''}"></i>`).join('')}</span>${c.step < 5 ? '<button class="pri" data-a="crnext">Seguir</button>' : '<button class="pri" data-a="crstart">Coroar</button>'}</div>`;
  let body = '';
  if (c.step === 0) {
    body = `<div class="cr-intro"><p class="eyebrow">Castelo de Valtheris · Março de 1427</p>
      <h1>O Peso da Coroa</h1>
      <p class="big">Ontem você limpava os corredores deste castelo. Hoje todos se curvam para você, e metade deles quer você morto.</p>
      <p>Teodoro III reinou trinta e um anos e morreu sem filhos. No leito, mandou chamar alguém que ninguém esperava. Antes de saber quem você é agora, lembre quem você era.</p>
      <p class="note">PROPOSTA de criação em 4 passos. Cada escolha muda a partida.</p>
      <button class="link-b" data-a="help">Como jogar</button></div>`;
  } else if (c.step === 1) {
    body = `<h2>Quem você era</h2><div class="cr-list">${OFICIOS.map((o) => `<button class="cr-opt ${s.oficio === o.id ? 'on' : ''}" data-a="cr" data-k="oficio" data-v="${o.id}"><b>${o.name}</b><span>Forte: ${o.forte}</span><span>Fraco: ${o.fraco}</span><span>Sua rede: ${o.rede}</span><em>${o.efeito}</em></button>`).join('')}</div>`;
  } else if (c.step === 2) {
    body = `<h2>De onde você veio</h2><p class="lede">Quem lá fora ainda lembra de você. É apoio e é alvo.</p><div class="cr-list grid">${PROVS.map((id) => `<button class="cr-opt ${s.origem === id ? 'on' : ''}" data-a="cr" data-k="origem" data-v="${id}"><b>${PROV_DATA[id].name}</b><span>${PROV_DATA[id].role}</span></button>`).join('')}</div><p class="note">O povo da sua terra começa vendo você como "um dos nossos".</p>`;
  } else if (c.step === 4) {
    body = skillsStep(s);
  } else if (c.step === 3) {
    body = `<h2>Por que Teodoro gostava de você</h2><div class="cr-list">${LACOS.map((l) => `<button class="cr-opt ${s.laco === l.id ? 'on' : ''}" data-a="cr" data-k="laco" data-v="${l.id}"><b>"${l.name}."</b><span>${l.text}</span><em>${l.efeito}</em></button>`).join('')}</div>`;
  } else {
    const opt = (k: string, names: string[], cur: number, label: string, colors?: string[]) => `<div class="cr-row"><span>${label}</span>${names.map((nm, i) => colors
      ? `<button class="sw ${cur === i ? 'on' : ''}" data-a="crlook" data-k="${k}" data-v="${i}" aria-label="${nm}" style="--sw:${colors[i]}"></button>`
      : `<button class="${cur === i ? 'on' : ''}" data-a="crlook" data-k="${k}" data-v="${i}">${nm}</button>`).join('')}</div>`;
    body = `<h2>Quem você é</h2>
      <div class="cr-face">${portrait(face, 190, 'cf')}</div>
      <div class="cr-row"><span>Soberano</span><button class="${s.title === 'rei' ? 'on' : ''}" data-a="cr" data-k="title" data-v="rei">Rei</button><button class="${s.title === 'rainha' ? 'on' : ''}" data-a="cr" data-k="title" data-v="rainha">Rainha</button></div>
      <label class="cr-name">Nome <input id="cr-name" data-in="cr-name" value="${esc(s.name)}" maxlength="20"></label>
      <label class="cr-age">Idade <b>${s.age} anos</b><input type="range" id="cr-age" data-in="cr-age" min="20" max="60" value="${s.age}"></label>
      ${opt('skin', ['clara', 'morena clara', 'morena', 'escura', 'retinta'], s.look.skin, 'Pele', SKIN)}${opt('hair', ['preto', 'castanho escuro', 'castanho', 'loiro escuro', 'loiro', 'ruivo'], s.look.hair, 'Cabelo', HAIR)}${s.title === 'rei' ? opt('hairStyle', ['curto', 'franja', 'médio', 'longo', 'calvo'], s.look.hairStyle, 'Corte') : ''}${s.title === 'rei' ? opt('beard', ['sem', 'aparada', 'cheia'], s.look.beard, 'Barba') : ''}${s.title === 'rei' ? opt('build', ['fino', 'médio', 'largo'], s.look.build, 'Rosto') : ''}
      <div class="cr-row"><span>Cicatriz</span><button class="${s.look.scar ? 'on' : ''}" data-a="crscar">${s.look.scar ? 'Sim' : 'Não'}</button></div>
      <h4>Caráter (até três)</h4><div class="cr-traits">${TRAIT_PAIRS.map((pair) => `<div>${pair.map((t) => `<button class="${s.traits.includes(t) ? 'on' : ''}" data-a="crtrait" data-v="${t}">${t}</button>`).join('<span>ou</span>')}</div>`).join('')}</div>
      <p class="note">Nesta fase, os traços ficam registrados mas ainda não mudam a simulação.</p>`;
  }
  return `<div class="creation">${c.step >= 1 && c.step < 4 ? `<div class="cr-mini">${portrait(face, 54, 'cm')}</div>` : ''}${body}${nav}</div>`;
}

// ---------------- render ----------------
function render() {
  const main = $('main');
  const nav = $('nav');
  const over = $('over');
  if (S.creating) {
    $('hdr').innerHTML = '';
    nav.innerHTML = '';
    over.innerHTML = '';
    main.innerHTML = renderCreation();
    return;
  }
  const w = S.w!;
  renderHeader();
  const open = w.dispatches.filter((d) => !d.answered).length;
  nav.innerHTML = ([['salao', 'Salão', open], ['reino', 'Reino', 0], ['cronica', 'Crônica', 0], ['mesa', 'Mesa', w.orders.filter((o) => !o.done).length]] as [View, string, number][])
    .map(([v, n, c]) => `<button class="${S.view === v ? 'on' : ''}" data-a="view" data-v="${v}"><i class="nv nv-${v}"></i>${n}${c ? `<span class="badge">${c}</span>` : ''}</button>`).join('');
  const scroll = main.scrollTop;
  if (S.view === 'reino') {
    if (!main.querySelector('#map')) main.innerHTML = renderReino(w);
    else {
      main.querySelectorAll('.layers button').forEach((b) => b.classList.toggle('on', (b as HTMLElement).dataset.v === S.layer));
      const card = main.querySelector('.card');
      if (card && !S.prov) card.innerHTML = `<h2>Eldoria em números</h2>${kingdomTable(w)}`;
      if (card && S.prov) card.remove();
      if (!card && !S.prov) main.insertAdjacentHTML('beforeend', `<section class="card"><h2>Eldoria em números</h2>${kingdomTable(w)}</section>`);
    }
    paintMap(w, S.layer, S.prov);
  } else {
    main.innerHTML = S.view === 'salao' ? renderSalao(w) : S.view === 'cronica' ? renderCronica(w) : renderMesa(w);
    main.scrollTop = scroll;
  }
  over.innerHTML = (S.prov && S.view === 'reino' ? `<div class="sheet prov">${provSheet(w, S.prov)}</div>` : '')
    + (S.fios.length ? `<div class="sheet fios-s">${renderFios(w)}</div>` : '')
    + (S.toast ? `<div class="toast" role="status">${esc(S.toast)}</div>` : '');
  over.classList.toggle('dim', !!S.fios.length || (!!S.prov && S.view === 'reino'));
}

// ---------------- resultado de um teste ----------------
// Mostra a chance, segura um instante e revela. Sem dados na tela (decisão do Tales).
function showCheck(r: CheckResult) {
  if (S.speed) setSpeed(0);
  let el = document.getElementById('check');
  if (!el) { el = document.createElement('div'); el.id = 'check'; $('app').appendChild(el); }
  const p = Math.round(r.chance * 100);
  el.className = 'dim';
  el.innerHTML = `<div class="ck-card" role="dialog" aria-live="polite">
    <p class="eyebrow">${esc(SKILL_DATA[r.skill].name)}</p>
    <h3>${esc(r.title)}</h3>
    <div class="ck-meter"><i style="width:${p}%"></i><span>${p}%</span></div>
    <p class="ck-verdict" hidden>${r.success ? 'Conseguiu' : 'Falhou'}</p>
    <p class="ck-text" hidden>${esc(r.text)}</p>
    <button class="pri" data-a="closecheck" hidden>Continuar</button></div>`;
  const card = el.querySelector('.ck-card')!;
  const reveal = () => {
    card.classList.add(r.success ? 'ok' : 'fail');
    card.querySelectorAll('[hidden]').forEach((x) => ((x as HTMLElement).hidden = false));
  };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce) reveal(); else { card.classList.add('rolling'); setTimeout(reveal, 900); }
}

// ---------------- tutorial ----------------
// Fica numa camada própria, fora do redesenho de cada dia, para as categorias não fecharem sozinhas.
function openHelp(cats: string[] = []) {
  if (S.speed) setSpeed(0);
  let el = document.getElementById('help');
  if (!el) { el = document.createElement('div'); el.id = 'help'; $('app').appendChild(el); }
  el.innerHTML = tutorialHtml(cats);
  el.className = 'dim';
}
function closeHelp() {
  const el = document.getElementById('help');
  if (el) { el.innerHTML = ''; el.className = ''; }
}

// ---------------- eventos ----------------
function startGame(s: Sovereign, seed = (Date.now() % 1000000)) {
  const w = createWorld(seed, s);
  bootstrap(w);
  S.w = w; S.creating = null; S.view = 'salao'; S.prov = null; S.fios = []; S.draft = null;
  save();
  render();
}

function onClick(e: Event) {
  const el = (e.target as HTMLElement).closest('[data-a]') as HTMLElement | null;
  if (!el) return;
  const a = el.dataset.a!, v = el.dataset.v ?? '';
  const w = S.w;
  if (a !== 'speed') S.toast = '';
  switch (a) {
    case 'view': S.view = v as View; S.fios = []; if (v !== 'reino') S.prov = null; $('main').scrollTop = 0; break;
    case 'speed': setSpeed(Number(v)); S.toast = ''; break;
    case 'layer': S.layer = v as Layer; break;
    case 'prov': S.prov = v as ProvId; if (S.view !== 'reino') { S.view = 'reino'; } break;
    case 'closeprov': S.prov = null; break;
    case 'fios': if (v) S.fios = [...S.fios, v]; break;
    case 'fiosback': S.fios = S.fios.slice(0, Number(v) + 1); break;
    case 'closefios': S.fios = []; break;
    case 'help': openHelp(); return;
    case 'sktoggle': e.preventDefault(); S.skOpen = !S.skOpen; break;
    case 'closecheck': { const el2 = document.getElementById('check'); if (el2) { el2.innerHTML = ''; el2.className = ''; } return; }
    case 'closehelp': closeHelp(); return;
    case 'decree': {
      if (!w) return;
      const d = JSON.parse(v) as Decree;
      const err = issue(w, { decree: d, publico: true });
      if (d.verb === 'persuadir' && !err && w.lastCheck) { save(); render(); showCheck(w.lastCheck); return; }
      S.toast = err ?? (d.verb === 'esperar' ? 'Você pediu paciência.' : `Assinado: ${describe(d)}.`);
      save();
      break;
    }
    case 'draft': S.draft = newDraft(v as Decree['verb'], (el.dataset.p as ProvId) || undefined); S.view = 'mesa'; S.prov = null; $('main').scrollTop = 0; break;
    case 'verb': S.draft = newDraft(v as Decree['verb'], S.draft?.prov === 'reino' ? undefined : S.draft?.prov as ProvId); break;
    case 'sign': {
      if (!w || !S.draft) return;
      const d = draftDecree(S.draft);
      const err = issue(w, { decree: d, publico: true, text: S.draft.text.trim() || undefined });
      S.toast = err ?? `Assinado: ${describe(d)}.`;
      if (!err) S.draft = newDraft(S.draft.verb, S.draft.prov === 'reino' ? undefined : S.draft.prov as ProvId);
      save();
      break;
    }
    case 'save': save(); S.toast = 'Partida salva neste aparelho.'; break;
    case 'export': {
      const txt = JSON.stringify(w);
      navigator.clipboard?.writeText(txt).then(() => { S.toast = 'Salvamento copiado.'; render(); }, () => { S.toast = 'Não consegui copiar neste aparelho.'; render(); });
      break;
    }
    case 'import': S.importing = !S.importing; break;
    case 'doimport': {
      try {
        const t = (document.getElementById('imp') as HTMLTextAreaElement).value;
        const nw = JSON.parse(t) as World;
        if (!nw.provinces || !nw.rng) throw new Error();
        S.w = nw; S.importing = false; S.toast = 'Partida carregada.'; save();
      } catch { S.toast = 'Esse texto não é um salvamento do Imperium.'; }
      break;
    }
    case 'newgame': setSpeed(0); S.creating = { step: 0, s: JSON.parse(JSON.stringify(w?.sovereign ?? defaultSov())) }; break;
    // criação
    case 'crnext': {
      const c = S.creating!;
      c.step = Math.min(5, c.step + 1);
      if (c.step === 4) ensureSkills(c.s);
      $('main').scrollTop = 0;
      break;
    }
    case 'skill': {
      const sv = S.creating!.s; ensureSkills(sv);
      const k = v as SkillId, base = baseSkills(sv.oficio, sv.laco), sk = sv.skills!;
      const left = FREE_POINTS - spent(sv);
      if (el.dataset.d === '+' && left > 0 && sk[k] < SKILL_MAX) sk[k]++;
      if (el.dataset.d === '-' && sk[k] > base[k]) sk[k]--;
      break;
    }
    case 'crback': S.creating!.step = Math.max(0, S.creating!.step - 1); $('main').scrollTop = 0; break;
    case 'cr': {
      const s = S.creating!.s as unknown as Record<string, unknown>;
      s[el.dataset.k!] = v;
      if (el.dataset.k === 'title') {
        const sv = S.creating!.s;
        const list = v === 'rainha' ? NAMES_F : NAMES_M;
        if (![...NAMES_F, ...NAMES_M].includes(sv.name) || !list.includes(sv.name)) sv.name = list[Math.floor(Math.random() * list.length)];
        if (v === 'rainha') sv.look.beard = 0;
      }
      break;
    }
    case 'crlook': (S.creating!.s.look as unknown as Record<string, number>)[el.dataset.k!] = Number(v); break;
    case 'crscar': S.creating!.s.look.scar = !S.creating!.s.look.scar; break;
    case 'crtrait': {
      const s = S.creating!.s;
      const pair = TRAIT_PAIRS.find((p) => p.includes(v))!;
      if (s.traits.includes(v)) s.traits = s.traits.filter((t) => t !== v);
      else { s.traits = s.traits.filter((t) => !pair.includes(t)); if (s.traits.length < 3) s.traits.push(v); }
      break;
    }
    case 'crstart': startGame(S.creating!.s); openHelp(['inicio']); return;
  }
  render();
}

function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const k = el.dataset.in;
  if (!k) return;
  if (k === 'cr-name') { S.creating!.s.name = el.value || '—'; return; }
  if (k === 'cr-age') {
    // não redesenha a tela durante o arrasto: no iPhone isso solta o dedo do controle
    const c = S.creating!;
    c.s.age = Number(el.value);
    const b = el.parentElement?.querySelector('b');
    if (b) b.textContent = `${c.s.age} anos`;
    const fc = document.querySelector('.cr-face');
    if (fc) fc.innerHTML = portrait(creationFace(), 190, 'cf');
    return;
  }
  if (k === 'autopause') { S.autoPause = el.checked; return; }
  const d = S.draft;
  if (!d) return;
  switch (k) {
    case 'd-prov': d.prov = el.value as ProvId | 'reino'; if (d.verb === 'taxar' && d.prov !== 'reino') d.rate = S.w!.provinces[d.prov].taxRate; break;
    case 'd-rate': d.rate = Number(el.value) / 100; break;
    case 'd-months': d.months = Number(el.value); break;
    case 'd-qty': d.qty = Number(el.value); break;
    case 'd-share': d.share = Number(el.value) / 100; break;
    case 'd-from': d.from = el.value as ProvId; break;
    case 'd-to': d.to = el.value as ProvId; break;
    case 'd-amount': d.amount = Number(el.value); break;
    case 'd-house': d.house = el.value as HouseId; break;
    case 'd-text': d.text = el.value; return; // não re-renderiza enquanto digita
  }
  const form = $('main').querySelector('.decree');
  if (!form) return;
  if (el.type === 'range' && e.type === 'input') {
    // durante o arrasto, só troca os rótulos e o pergaminho; o controle fica intacto
    const tmp = document.createElement('div');
    tmp.innerHTML = draftForm(S.w!, d);
    const nb = tmp.querySelectorAll('.form label > b'), ob = form.querySelectorAll('.form label > b');
    ob.forEach((b, i) => { if (nb[i]) b.textContent = nb[i].textContent; });
    const ns = tmp.querySelector('.scroll'), os = form.querySelector('.scroll');
    const txt = os?.querySelector('textarea')?.value;
    if (ns && os) { os.replaceWith(ns); const ta = ns.querySelector('textarea'); if (ta && txt !== undefined) ta.value = txt; }
    const nf = tmp.querySelector('.form .note'), of = form.querySelector('.form .note');
    if (nf && of) of.textContent = nf.textContent;
    return;
  }
  if (el.type === 'range' || e.type === 'change') form.outerHTML = draftForm(S.w!, d);
}

function defaultSov(): Sovereign {
  return { name: 'Aldo', title: 'rei', age: 34, oficio: 'faxineiro', origem: 'caldris', laco: 'verdade', traits: ['honesto'], look: { skin: 1, hair: 1, hairStyle: 1, beard: 1, scar: false, build: 1 } };
}

declare global { interface Window { claude?: { hot?: { snapshot?: (f: () => unknown) => void; ready?: (f: (d: unknown) => void) => void; data?: unknown } } } }

/** Tela fixa: sem pinça, sem toque duplo para ampliar (o iPhone ignora user-scalable=no). */
function lockZoom() {
  const stop = (e: Event) => e.preventDefault();
  document.addEventListener('gesturestart', stop, { passive: false });
  document.addEventListener('gesturechange', stop, { passive: false });
  document.addEventListener('touchmove', (e) => { if ((e as TouchEvent).touches.length > 1) e.preventDefault(); }, { passive: false });
}

export async function boot() {
  lockZoom();
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (S.fios.length) S.fios = []; else S.prov = null; render(); }
    if (e.key === ' ' && S.w && !S.creating && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') { e.preventDefault(); setSpeed(S.speed ? 0 : 1); render(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.claude?.hot?.snapshot?.(() => ({ w: S.w, view: S.view }));
  const start = async (data: unknown) => {
    const hot = data as { w?: World; view?: View } | undefined;
    const saved = hot?.w ?? (await load());
    if (saved && saved.version === 1) { S.w = saved; S.view = hot?.view ?? 'salao'; render(); }
    else { S.creating = { step: 0, s: defaultSov() }; render(); }
  };
  if (window.claude?.hot?.ready) window.claude.hot.ready((d) => { void start(d); });
  else await start(window.claude?.hot?.data);
}
void GOOD_DATA; void totalPop;
