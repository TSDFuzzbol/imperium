import { MONTHS, START_OFFSET, START_YEAR } from '../data/eldoria';
import type { ChronEntry, Fact, FactFactor, Grievance, World } from './types';

// ---------- Calendário (PROPOSTA: 12 meses de 30 dias) ----------
export function calDay(day: number) {
  return START_OFFSET + day;
}
export function dateOf(day: number) {
  const c = calDay(day);
  const year = START_YEAR + Math.floor(c / 360);
  const month = Math.floor((c % 360) / 30) + 1;
  const dom = (c % 30) + 1;
  return { year, month, dom };
}
export function monthIndex(day: number) {
  return Math.floor(calDay(day) / 30);
}
export function fmtDate(day: number, withYear = true) {
  const d = dateOf(day);
  return `${d.dom} de ${MONTHS[d.month - 1]}${withYear ? ` de ${d.year}` : ''}`;
}
export function fmtMonth(day: number) {
  const d = dateOf(day);
  return `${MONTHS[d.month - 1]} de ${d.year}`;
}
export function isMonthEnd(day: number) {
  return calDay(day) % 30 === 29;
}

// ---------- Os Fios ----------
export function nextId(w: World, p: string) {
  w.seq += 1;
  return `${p}${w.seq.toString(36)}`;
}

/** Registra um fato e o torna o mais recente para sua chave. Retorna o id. */
export function fact(
  w: World,
  key: string,
  label: string,
  factors: FactFactor[],
  opt: { value?: number; unit?: string; text?: string; source?: string } = {},
): string {
  const id = nextId(w, 'f');
  const f: Fact = { id, day: w.day, key, label, factors: factors.filter((x) => x.amount === undefined || Math.abs(x.amount) > 1e-9 || x.ref), ...opt };
  w.facts[id] = f;
  w.factIndex[key] = id;
  return id;
}
export function latest(w: World, key: string): string | undefined {
  return w.factIndex[key];
}

/** Mantém só os fatos alcançáveis a partir da Crônica recente, do índice e dos despachos. */
export function pruneFacts(w: World) {
  const keep = new Set<string>();
  const stack: string[] = [];
  const push = (id?: string) => { if (id && !keep.has(id) && w.facts[id]) { keep.add(id); stack.push(id); } };
  Object.values(w.factIndex).forEach(push);
  w.chronicle.slice(-160).forEach((c) => push(c.fact));
  w.dispatches.forEach((d) => push(d.fact));
  Object.values(w.reports).forEach((r) => r && Object.values(r.facts).forEach(push));
  w.pendingReports.forEach((r) => Object.values(r.facts).forEach(push));
  for (const p of Object.values(w.provinces)) p.grievances.forEach((g) => push(g.fact));
  for (const g of Object.values(w.groups)) g.memory.forEach((m) => push(m.fact));
  while (stack.length) {
    const f = w.facts[stack.pop()!];
    for (const x of f.factors) push(x.ref);
  }
  for (const id of Object.keys(w.facts)) if (!keep.has(id)) delete w.facts[id];
}

// ---------- Crônica ----------
export function chron(w: World, e: Omit<ChronEntry, 'id' | 'day'>) {
  const entry: ChronEntry = { id: nextId(w, 'c'), day: w.day, ...e };
  w.chronicle.push(entry);
  if (w.chronicle.length > 400) w.chronicle.splice(0, w.chronicle.length - 400);
  return entry;
}

// ---------- Memória (ressentimentos e gratidões) ----------
export function remember(list: Grievance[], g: Grievance) {
  const same = list.find((x) => x.id === g.id);
  if (same) {
    same.weight += g.weight;
    same.fact = g.fact ?? same.fact;
  } else list.push(g);
}
export function decayMemory(list: Grievance[]) {
  for (const g of list) g.weight *= 1 - g.decay;
  for (let i = list.length - 1; i >= 0; i--) if (Math.abs(list[i].weight) < 0.5) list.splice(i, 1);
}

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
