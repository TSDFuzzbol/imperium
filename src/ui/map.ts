// Mapa ilustrado de Eldoria. A geografia é PROPOSTA (tools/gen-map.ts).
import MAP from '../data/map.json';
import { PROV_DATA, ROADS } from '../data/eldoria';
import { PROVS } from '../engine/types';
import type { ProvId, World } from '../engine/types';
import { n0, n2, pct, humorWord, hungerWord, UNREST_WORD } from './fmt';

export type Layer = 'humor' | 'fome' | 'grao' | 'preco' | 'imposto' | 'ordem' | 'tropas';
export const LAYERS: { id: Layer; name: string }[] = [
  { id: 'humor', name: 'Humor do povo' }, { id: 'fome', name: 'Fome' }, { id: 'grao', name: 'Grão guardado' },
  { id: 'preco', name: 'Preço do pão' }, { id: 'imposto', name: 'Imposto' }, { id: 'ordem', name: 'Ordem' }, { id: 'tropas', name: 'Tropas' },
];

const M = MAP as unknown as {
  W: number; H: number; provinces: Record<string, string>; foreign: Record<string, string>; sea: string;
  borders: Record<string, string>; rivers: { name: string; d: string; label: [number, number] }[];
  samples: Record<string, [number, number][]>; foreignLabels: Record<string, [number, number]>;
};

function glyphs(): string {
  let s = '';
  const pick = (id: string, every: number, f: (x: number, y: number, i: number) => string) =>
    (M.samples[id] ?? []).forEach(([x, y], i) => { if (i % every === 0) s += f(x, y, i); });
  // montanhas: norte de Dornhelm e leste de Rhovan
  pick('dornhelm', 1, (x, y, i) => (y < 230 || i % 3 === 0 ? `<path class="g-mtn" d="M${x - 13} ${y + 7} L${x - 2} ${y - 11} L${x + 4} ${y - 2} L${x + 8} ${y - 7} L${x + 16} ${y + 7}"/><path class="g-mtn-s" d="M${x - 2} ${y - 11} L${x + 1} ${y + 7}"/>` : ''));
  pick('rhovan', 1, (x, y, i) => (x > 860 || i % 4 === 0 ? `<path class="g-mtn" d="M${x - 10} ${y + 6} L${x} ${y - 8} L${x + 11} ${y + 6}"/>` : ''));
  pick('Mordane', 2, (x, y) => (y > 0 ? `<path class="g-mtn g-far" d="M${x - 12} ${y + 6} L${x} ${y - 10} L${x + 12} ${y + 6}"/>` : ''));
  // florestas de Esteren
  pick('esteren', 1, (x, y, i) => `<g class="g-tree"><path d="M${x} ${y - 10} L${x - 6} ${y + 2} L${x + 6} ${y + 2}Z"/><path d="M${x + 9} ${y - 4} L${x + 4} ${y + 5} L${x + 14} ${y + 5}Z" opacity="${i % 2 ? 1 : 0}"/></g>`);
  pick('caldris', 3, (x, y) => `<g class="g-tree g-sparse"><path d="M${x} ${y - 7} L${x - 4} ${y + 1} L${x + 4} ${y + 1}Z"/></g>`);
  // campos de Veyra e de Valtheris
  pick('veyra', 1, (x, y, i) => `<path class="g-field" d="M${x - 9} ${y + (i % 3)} q4 -3 9 0 t9 0 M${x - 7} ${y + 5} q4 -3 9 0 t8 0"/>`);
  pick('valtheris', 3, (x, y) => `<path class="g-field" d="M${x - 8} ${y} q4 -3 8 0 t8 0"/>`);
  pick('merovan', 3, (x, y) => `<path class="g-field" d="M${x - 8} ${y} q4 -3 8 0 t8 0"/>`);
  // pastos de Caldris
  pick('caldris', 2, (x, y) => `<path class="g-hill" d="M${x - 10} ${y + 4} Q${x} ${y - 6} ${x + 10} ${y + 4}"/>`);
  // ondas
  pick('mar', 1, (x, y, i) => (i % 2 ? `<path class="g-wave" d="M${x - 8} ${y} q4 -4 8 0 t8 0"/>` : ''));
  return s;
}

function settlements(): string {
  let s = '';
  for (const id of PROVS) {
    const d = PROV_DATA[id];
    const samp = (M.samples[id] ?? []).filter(([x, y]) => Math.hypot(x - d.center[0], y - d.center[1]) > 45 && Math.hypot(x - d.center[0], y - d.center[1]) < 120);
    const step = Math.max(1, Math.floor(samp.length / 3));
    d.settlements.forEach((name, i) => {
      const [x, y] = i === 0 ? [d.center[0], d.center[1] + 22] : samp[(i - 1) * step] ?? [d.center[0] + 30 * i, d.center[1] + 40];
      const capital = id === 'valtheris' && i === 0;
      s += capital
        ? `<g class="m-capital"><path d="M${x} ${y - 11} L${x + 3} ${y - 3} L${x + 11} ${y - 3} L${x + 4} ${y + 2} L${x + 7} ${y + 10} L${x} ${y + 5} L${x - 7} ${y + 10} L${x - 4} ${y + 2} L${x - 11} ${y - 3} L${x - 3} ${y - 3}Z"/></g><text class="m-town m-cap" x="${x}" y="${y + 26}">${name}</text>`
        : `<circle class="m-dot" cx="${x}" cy="${y}" r="${i === 0 ? 5 : 3.5}"/><text class="m-town" x="${x}" y="${y + 15}">${name}</text>`;
    });
  }
  return s;
}

function roads(): string {
  return ROADS.map(([a, b, , q]) => {
    const [x1, y1] = PROV_DATA[a].center, [x2, y2] = PROV_DATA[b].center;
    const mx = (x1 + x2) / 2 + (y2 - y1) * 0.08, my = (y1 + y2) / 2 - (x2 - x1) * 0.08;
    return `<path class="m-road" style="stroke-width:${1.4 + q * 1.4}" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}"/>`;
  }).join('');
}

let staticSvg = '';
export function mapSvg(): string {
  if (staticSvg) return staticSvg;
  staticSvg = `<svg id="map" viewBox="0 0 ${M.W} ${M.H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa de Eldoria">
  <defs>
    <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.18 0"/></filter>
    <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 5 H10" stroke="#3e5a5e" stroke-width="0.8" opacity="0.5"/></pattern>
    <radialGradient id="vign" cx="50%" cy="45%" r="70%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity="0.55"/></radialGradient>
  </defs>
  <rect width="${M.W}" height="${M.H}" class="m-paper"/>
  <g filter="url(#rough)">
    ${Object.entries(M.foreign).map(([k, d]) => `<path class="m-foreign" data-f="${k}" d="${d}"/>`).join('')}
    <path class="m-sea" d="${M.sea}"/><path d="${M.sea}" fill="url(#hatch)"/>
    ${PROVS.map((id) => `<path id="pv-${id}" class="m-prov" data-a="prov" data-v="${id}" d="${M.provinces[id]}"/>`).join('')}
    <path class="m-b-foreign" d="${M.borders.foreign}"/>
    <path class="m-b-internal" d="${M.borders.internal}"/>
    <path class="m-b-coast" d="${M.borders.coast}"/>
    <path class="m-b-kingdom" d="${M.borders.kingdom}"/>
    ${M.rivers.map((r) => `<path class="m-river" d="${r.d}"/>`).join('')}
  </g>
  <g class="m-glyphs">${glyphs()}</g>
  <g class="m-roads">${roads()}</g>
  <g id="flows"></g>
  <g class="m-settle">${settlements()}</g>
  ${M.rivers.map((r) => `<text class="m-rivername" x="${r.label[0]}" y="${r.label[1]}">${r.name}</text>`).join('')}
  ${Object.entries(M.foreignLabels).map(([k, [x, y]]) => `<text class="m-foreignname" x="${x}" y="${y}">${k}</text>`).join('')}
  <text class="m-seaname" x="560" y="1150">Mar Interior de Ordan</text>
  <g id="provlabels">${PROVS.map((id) => { const [x, y] = PROV_DATA[id].center; return `<g data-a="prov" data-v="${id}"><text class="m-provname" x="${x}" y="${y - 12}">${PROV_DATA[id].name.toUpperCase()}</text><text class="m-val" id="mv-${id}" x="${x}" y="${y + 50}"></text></g>`; }).join('')}</g>
  <g class="m-rose" transform="translate(905 1085)"><circle r="34" class="m-rose-c"/><path d="M0 -44 L7 0 L0 44 L-7 0Z" class="m-rose-n"/><path d="M-44 0 L0 6 L44 0 L0 -6Z" class="m-rose-e"/><text y="-50" class="m-rose-t">N</text></g>
  <g class="m-scale" transform="translate(40 1150)"><path d="M0 0 H130 M0 -5 V5 M65 -4 V4 M130 -5 V5"/><text x="65" y="-10">50 km</text></g>
  <rect width="${M.W}" height="${M.H}" fill="url(#vign)" pointer-events="none"/>
  <rect width="${M.W}" height="${M.H}" filter="url(#paper)" pointer-events="none" opacity="0.9"/>
</svg>`;
  return staticSvg;
}

function lerp(a: number[], b: number[], t: number) {
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
}
const WINE = [124, 36, 44], PARCH = [226, 208, 166], GREEN = [52, 92, 66], GOLD = [196, 150, 64], STONE = [120, 112, 100];

export function layerValue(w: World, id: ProvId, layer: Layer): { fill: string; label: string } {
  const r = w.reports[id];
  const p = w.provinces[id];
  if (!r) return { fill: 'rgb(200,190,160)', label: '?' };
  switch (layer) {
    case 'humor': {
      const t = Math.max(-1, Math.min(1, r.humor / 60));
      return { fill: t < 0 ? lerp(PARCH, WINE, -t) : lerp(PARCH, GREEN, t), label: humorWord(r.humor) };
    }
    case 'fome': return { fill: lerp(PARCH, WINE, Math.min(1, r.hunger * 4)), label: hungerWord(r.hunger) };
    case 'grao': return { fill: lerp(WINE, GOLD, Math.min(1, r.grainMonths / 8)), label: `${r.grainMonths.toFixed(1).replace('.', ',')} meses` };
    case 'preco': return { fill: lerp(PARCH, WINE, Math.min(1, Math.max(0, (r.grainPrice - 0.9) / 1.6))), label: `${n2(r.grainPrice)} c/saca` };
    case 'imposto': {
      const ex = p.exemptUntilMonth >= Math.floor((71 + w.day) / 30);
      return { fill: lerp(PARCH, [92, 60, 30], Math.min(1, (ex ? 0 : p.taxRate) / 0.25)), label: ex ? 'isenta' : pct(p.taxRate) };
    }
    case 'ordem': {
      const t = { calma: 0, tensa: 0.35, motins: 0.7, revolta: 1 }[r.unrest];
      return { fill: lerp(PARCH, WINE, t), label: UNREST_WORD[r.unrest] };
    }
    case 'tropas': return { fill: lerp(PARCH, STONE, Math.min(1, r.soldiers / 4000)), label: `${n0(r.soldiers)} soldados` };
  }
}

export function paintMap(w: World, layer: Layer, selected: ProvId | null) {
  for (const id of PROVS) {
    const el = document.getElementById(`pv-${id}`);
    const v = layerValue(w, id, layer);
    if (el) { el.style.fill = v.fill; el.classList.toggle('sel', id === selected); }
    const t = document.getElementById(`mv-${id}`);
    if (t) t.textContent = v.label;
  }
  const g = document.getElementById('flows');
  if (!g) return;
  const C = (k: string): [number, number] => k === 'mar' ? [560, 1120] : PROV_DATA[k as ProvId].center;
  const grain = w.flows.filter((f) => f.g === 'grao' && f.qty > 400);
  g.innerHTML = grain.map((f) => {
    const [x1, y1] = f.a === 'mar' ? (f.b === 'altamar' ? [560, 1140] : borderOut(f.b as ProvId)) : C(f.a);
    const [x2, y2] = f.b === 'mar' ? (f.a === 'altamar' ? [560, 1140] : borderOut(f.a as ProvId)) : C(f.b);
    const wdt = Math.min(9, 1.5 + f.qty / 2500);
    const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12, my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
    return `<path class="m-flow" style="stroke-width:${wdt}" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}"/>`;
  }).join('');
}
function borderOut(id: ProvId): [number, number] {
  const [x, y] = PROV_DATA[id].center;
  return [x + (x - 520) * 0.9, y + (y - 590) * 0.9];
}
