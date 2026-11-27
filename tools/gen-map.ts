// Gera o mapa ilustrado de Eldoria (geografia PROPOSTA) a partir dos centros das províncias.
// Saída: src/data/map.json com caminhos SVG prontos.
import { Delaunay } from 'd3-delaunay';
import { writeFileSync } from 'node:fs';
import { PROV_DATA, ROADS } from '../src/data/eldoria';
import { PROVS } from '../src/engine/types';
import { seedRng, rand } from '../src/engine/rng';

const W = 1000, H = 1200;
const rng = seedRng(1427);
// ruído de valor suave
const G = 9;
const grid: number[] = Array.from({ length: (G + 1) * (G + 1) * 4 }, () => rand(rng) * 2 - 1);
function noise(x: number, y: number, layer = 0) {
  const gx = (x / W) * G, gy = (y / H) * G;
  const ix = Math.floor(gx), iy = Math.floor(gy);
  const fx = gx - ix, fy = gy - iy;
  const s = (t: number) => t * t * (3 - 2 * t);
  const at = (i: number, j: number) => grid[(layer * (G + 1) * (G + 1) + Math.min(G, j) * (G + 1) + Math.min(G, i)) % grid.length];
  const a = at(ix, iy), b = at(ix + 1, iy), c = at(ix, iy + 1), d = at(ix + 1, iy + 1);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}

// pontos com grade perturbada
const pts: [number, number][] = [];
const step = 26;
for (let y = -step; y < H + step; y += step) for (let x = -step; x < W + step; x += step) {
  pts.push([x + (rand(rng) - 0.5) * step * 0.9, y + (rand(rng) - 0.5) * step * 0.9]);
}
const del = Delaunay.from(pts);
const vor = del.voronoi([-40, -40, W + 40, H + 40]);

const C: [number, number] = [520, 590];
function inKingdom(x: number, y: number) {
  const dx = (x - C[0]) / 430, dy = (y - C[1]) / 520;
  const r = Math.sqrt(dx * dx + dy * dy);
  return r + 0.16 * noise(x, y, 1) + 0.06 * noise(x * 3, y * 3, 2) < 1;
}
function inSea(x: number, y: number) {
  // Mar Interior de Ordan, ao sul (Altamar no litoral norte)
  const dx = (x - 560) / 330, dy = (y - 1240) / 190;
  return Math.sqrt(dx * dx + dy * dy) + 0.12 * noise(x * 2, y * 2, 3) < 1;
}
function foreignOf(x: number, y: number): string {
  const a = (Math.atan2(y - C[1], x - C[0]) * 180) / Math.PI; // -180..180, 0 = leste, 90 = sul
  if (a > -125 && a <= -35) return 'Mordane';
  if (a > -35 && a <= 48) return 'Karsk';
  if (a > 48 && a <= 95) return 'Theryn';
  if (a > 95 && a <= 140) return 'Edria';
  if (a > 140 || a <= -160) return 'Valedorn';
  return 'Mordane';
}

type Region = string; // id de província, 'mar' ou nome estrangeiro
const region: Region[] = [];
for (let i = 0; i < pts.length; i++) {
  const [x, y] = pts[i];
  if (inSea(x, y)) { region.push('mar'); continue; }
  if (!inKingdom(x, y)) { region.push(foreignOf(x, y)); continue; }
  let best = '', bd = Infinity;
  for (const id of PROVS) {
    const [cx, cy] = PROV_DATA[id].center;
    const d = Math.hypot(x - cx, y - cy) * (1 + 0.22 * noise(x + cx, y + cy, 1 + (cx % 3)));
    if (d < bd) { bd = d; best = id; }
  }
  region.push(best);
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const polys: Record<string, string[]> = {};
const sampleCells: Record<string, [number, number][]> = {};
for (let i = 0; i < pts.length; i++) {
  const poly = vor.cellPolygon(i);
  if (!poly) continue;
  const d = 'M' + poly.slice(0, -1).map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z';
  (polys[region[i]] ??= []).push(d);
  (sampleCells[region[i]] ??= []).push([r1(pts[i][0]), r1(pts[i][1])]);
}
// bordas: arestas entre células de regiões diferentes
const borders = { internal: [] as string[], kingdom: [] as string[], coast: [] as string[], foreign: [] as string[] };
const adj: Record<string, Set<string>> = {};
for (let i = 0; i < pts.length; i++) {
  for (const j of del.neighbors(i)) {
    if (j <= i) continue;
    const a = region[i], b = region[j];
    if (a === b) continue;
    const pi = vor.cellPolygon(i), pj = vor.cellPolygon(j);
    if (!pi || !pj) continue;
    const shared = pi.filter(([x, y]) => pj.some(([u, v]) => Math.abs(u - x) < 1e-6 && Math.abs(v - y) < 1e-6));
    const uniq = shared.filter((p, k) => shared.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === k);
    if (uniq.length < 2) continue;
    const seg = `M${r1(uniq[0][0])} ${r1(uniq[0][1])}L${r1(uniq[1][0])} ${r1(uniq[1][1])}`;
    const pa = (PROVS as readonly string[]).includes(a), pb = (PROVS as readonly string[]).includes(b);
    if (pa && pb) { borders.internal.push(seg); (adj[a] ??= new Set()).add(b); (adj[b] ??= new Set()).add(a); }
    else if (a === 'mar' || b === 'mar') borders.coast.push(seg);
    else if (pa || pb) borders.kingdom.push(seg);
    else borders.foreign.push(seg);
  }
}
// confere vizinhanças contra as estradas
const roadSet = new Set(ROADS.map(([a, b]) => [a, b].sort().join('|')));
const adjSet = new Set<string>();
for (const [a, s] of Object.entries(adj)) for (const b of s) adjSet.add([a, b].sort().join('|'));
for (const r of roadSet) if (!adjSet.has(r)) console.warn('estrada sem fronteira:', r);
for (const r of adjSet) if (!roadSet.has(r)) console.warn('fronteira sem estrada:', r);
const coastProvs = new Set<string>();
for (let i = 0; i < pts.length; i++) if (region[i] === 'altamar' || region[i] === 'veyra' || region[i] === 'merovan') {
  for (const j of del.neighbors(i)) if (region[j] === 'mar') coastProvs.add(region[i]);
}
console.log('províncias no litoral:', [...coastProvs].join(', '));

// rios (PROPOSTA): curvas suaves por pontos de controle
function smooth(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const rivers = [
  { name: 'Serath', d: smooth([[575, -20], [560, 90], [540, 230], [530, 380], [505, 520], [560, 640], [660, 730], [740, 820], [830, 905], [930, 960], [1030, 990]]), label: [600, 690] as [number, number] },
  { name: 'Ilyr', d: smooth([[-30, 450], [80, 500], [180, 560], [250, 650], [300, 760], [330, 880], [300, 980], [210, 1070], [120, 1160], [60, 1230]]), label: [262, 735] as [number, number] },
  { name: 'Dorn', d: smooth([[1030, 240], [960, 320], [925, 420], [915, 520], [935, 620], [985, 700], [1030, 740]]), label: [940, 560] as [number, number] },
];

const out = {
  W, H,
  provinces: Object.fromEntries(PROVS.map((id) => [id, polys[id].join('')])),
  foreign: Object.fromEntries(Object.entries(polys).filter(([k]) => !(PROVS as readonly string[]).includes(k) && k !== 'mar').map(([k, v]) => [k, v.join('')])),
  sea: polys.mar.join(''),
  borders: Object.fromEntries(Object.entries(borders).map(([k, v]) => [k, v.join('')])),
  rivers,
  samples: Object.fromEntries(Object.entries(sampleCells).map(([k, v]) => [k, v.filter((_, i) => i % 3 === 0)])),
  foreignLabels: { Mordane: [520, 40], Karsk: [960, 380], Theryn: [930, 1060], Edria: [90, 1010], Valedorn: [40, 330] },
};
writeFileSync(new URL('../src/data/map.json', import.meta.url), JSON.stringify(out));
console.log('map.json', JSON.stringify(out).length, 'bytes');
