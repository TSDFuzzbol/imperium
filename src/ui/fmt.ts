import type { Fact, UnrestLevel } from '../engine/types';

export const n0 = (x: number) => Math.round(x).toLocaleString('pt-BR');
export const n2 = (x: number) => x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (x: number) => `${Math.round(x * 100)}%`;
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function humorWord(h: number) {
  return h >= 40 ? 'devotado' : h >= 15 ? 'contente' : h >= -15 ? 'resignado' : h >= -40 ? 'insatisfeito' : h >= -65 ? 'revoltado' : 'furioso';
}
export function hungerWord(h: number) {
  return h < 0.01 ? 'sem fome' : h < 0.05 ? 'aperto' : h < 0.15 ? 'fome' : h < 0.3 ? 'fome grave' : 'morre-se de fome';
}
export const UNREST_WORD: Record<UnrestLevel, string> = { calma: 'Calma', tensa: 'Tensão', motins: 'Motins', revolta: 'Revolta' };

export function fmtValue(v: number | undefined, unit?: string): string {
  if (v === undefined) return '';
  switch (unit) {
    case 'coroas': return `${n0(v)} coroas`;
    case 'sacas': return `${n0(v)} sacas`;
    case 'pessoas': return `${n0(v)} pessoas`;
    case 'humor': return `${humorWord(v)} (${Math.round(v)})`;
    case 'fração': return pct(v);
    case 'moral': return `moral ${pct(v)}`;
    case 'aceitação': return `${Math.round(v)}`;
    case 'coroas por saca': return `${n2(v)} coroas/saca`;
    case 'anomalia': return v < -0.45 ? 'seca' : v < -0.15 ? 'seco' : v > 0.45 ? 'chuvas fortes' : v > 0.15 ? 'chuvoso' : 'normal';
    case 'força': return pct(v);
    default: return unit ? `${n0(v)} ${unit}` : Math.abs(v) < 10 ? n2(v) : n0(v);
  }
}

export function fmtAmount(a: number, f: Fact): string {
  const s = a > 0 ? '+' : a < 0 ? '−' : '';
  const x = Math.abs(a);
  switch (f.unit) {
    case 'fração': case 'moral': case 'força': return `${s}${Math.round(x * 100)} pts`;
    case 'coroas por saca': return `${s}${n2(x)}`;
    case 'anomalia': return `${s}${n2(x)}`;
    case 'humor': case 'aceitação': return `${s}${x < 10 ? x.toFixed(1).replace('.', ',') : Math.round(x)}`;
    default: return `${s}${x < 10 && x > 0 ? n2(x) : n0(x)}`;
  }
}
