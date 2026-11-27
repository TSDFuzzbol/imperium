// Gerador determinístico (sfc32). O estado vive dentro do mundo, então salvar e
// carregar preserva a sequência exata de sorteios.
export type RngState = [number, number, number, number];

export function seedRng(seed: number): RngState {
  // splitmix32 para espalhar a semente
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
  const st: RngState = [next(), next(), next(), next()];
  for (let i = 0; i < 12; i++) rand(st);
  return st;
}

/** Número em [0,1). Muta o estado. */
export function rand(st: RngState): number {
  let [a, b, c, d] = st;
  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
  const t = (((a + b) >>> 0) + d) >>> 0;
  d = (d + 1) >>> 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) >>> 0;
  c = (c << 21) | (c >>> 11);
  c = (c + t) >>> 0;
  st[0] = a >>> 0; st[1] = b >>> 0; st[2] = c >>> 0; st[3] = d;
  return t / 4294967296;
}

export function range(st: RngState, lo: number, hi: number): number {
  return lo + (hi - lo) * rand(st);
}

/** Normal padrão (Box-Muller). */
export function gauss(st: RngState): number {
  const u = Math.max(1e-12, rand(st));
  const v = rand(st);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function chance(st: RngState, p: number): boolean {
  return rand(st) < p;
}
