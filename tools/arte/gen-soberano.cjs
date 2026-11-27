// Gera assets/svg/soberano.svg a partir de soberano.base.svg.
// O molde tem o fundo, a roupa, os olhos e a boca desenhados à mão.
// Aqui saem as partes que pedem muitas formas parecidas: mechas de cabelo, planos de pele e a coroa.
// uso: node gen-soberano.cjs <molde.svg> <saida.svg>
const fs = require('fs');
const [, , molde, saida] = process.argv;

// ---------- utilidades ----------
let semente = 1427;
const rnd = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;
const r = (a, b) => a + (b - a) * rnd();
const f = (n) => Math.round(n);

function bez(P, t) {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
}
// Fita que afina: a forma básica de uma mecha ou de uma pincelada.
function fita(P, w0, w1, t0 = 0, t1 = 1, n = 12) {
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * (i / n);
    const a = bez(P, Math.max(0, t - 0.01)), b = bez(P, Math.min(1, t + 0.01));
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    const s = (i / n);
    // começa já com corpo, engorda no primeiro terço e afina até a ponta
    const w = (w0 + (w1 - w0) * s) * Math.min(1, 0.45 + s * 3) * 0.5;
    const p = bez(P, t);
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
  }
  const pts = L.concat(R.reverse());
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(m[0])} ${f(m[1])}`;
  }
  return d + 'Z';
}
const path = (d, fill, op = 1, extra = '') => `<path d="${d}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}${extra}/>`;

// ---------- cabelo ----------
// Mechas onduladas que descem de baixo do aro da coroa até a altura do queixo.
function lado(esq) {
  const s = esq ? 1 : -1, X = (x) => (esq ? x : 600 - x);
  const base = [], meio = [], luz = [], recorte = [];
  const N = 15;
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1); // 0 = junto ao rosto, 1 = por fora
    const x0 = 226 - k * 46 + r(-3, 3), y0 = 200 + k * 22 + r(-4, 4);
    const x3 = 212 - k * 34 + r(-5, 5), y3 = 418 + k * 44 + r(-10, 10);
    const onda = r(14, 26);
    const P = [[X(x0), y0], [X(x0 - onda - 6 * k), y0 + 80], [X(x3 + onda), y3 - 80], [X(x3 - 4), y3]];
    const ponta = [[X(x3 - 4), y3], [X(x3 - 8), y3 + 12], [X(x3 - 18), y3 + 16], [X(x3 - 26 - 6 * k), y3 + 8]];
    base.push(path(fita(P, r(26, 34), 8), esq ? '#130e0b' : '#0d0a08'));
    if (k > 0.25 && rnd() < 0.7) base.push(path(fita(ponta, 9, 1), esq ? '#1d1511' : '#0f0b09'));
    meio.push(path(fita(P, r(12, 20), 1.5, 0.02, 0.96), esq ? (i % 2 ? '#2b2019' : '#1f1712') : (i % 2 ? '#181210' : '#110d0a'), r(0.8, 1)));
    if (esq && i % 3 === 1) luz.push(path(fita(P, r(3, 4.5), 0.6, r(0.06, 0.12), r(0.4, 0.55)), k < 0.5 ? '#8a735f' : '#6a5646', r(0.5, 0.7)));
    if (esq && i % 4 === 0) luz.push(path(fita(P, 12, 2, 0.08, 0.5), '#5a4838', 0.35, ' filter="url(#sob-b4)"'));
    else if (i === N - 1 || i === N - 4) recorte.push(path(fita(P, 2.4, 0.5, 0.1, 0.7), '#8e939a', 0.22));
    // ponta enrolada para dentro
    const pe = [X(x3 - 4), y3];
    const C = [pe, [X(x3 - 4 + 10 * s * -1), y3 + 14], [X(x3 + 16), y3 + 16], [X(x3 + 18), y3 + 4]];
    
  }
  return { base, meio, luz, recorte };
}

function cabeloTras() {
  const fios = [];
  for (let i = 0; i < 0; i++) {
    const x = 180 + i * 30 + r(-6, 6);
    fios.push(path(fita([[x, 108], [x - 16, 130], [x + 12, 152], [x - 4, 176]], 9, 2), '#2a1f18', 0.7));
  }
  return `    <g id="cabelo-tras" data-pivo="300 300">
      <path d="M300 100 C220 96 168 146 158 214 C150 262 156 310 160 352 C162 390 154 420 162 452 C168 476 186 488 200 482 C196 470 204 462 214 470 C222 476 232 474 236 466 L364 466 C368 474 378 476 386 470 C396 462 404 470 400 482 C414 488 432 476 438 452 C446 420 438 390 440 352 C444 310 450 262 442 214 C432 146 380 96 300 100 Z" fill="#0f0b09"/>
      ${fios.join('\n      ')}
      <path d="M440 220 C450 290 444 360 440 410 C438 440 434 460 428 470" fill="none" stroke="#8e939a" stroke-width="2.2" stroke-linecap="round" opacity=".3"/>
    </g>`;
}

function cabeloFrente() {
  const E = lado(true), D = lado(false);
  // mechas na testa, saindo de baixo da coroa
  // calota: cobre o topo da cabeça por baixo do aro, para a pele não aparecer dentro da coroa
  const calota = '<path d="M200 236 C204 184 248 160 300 158 C352 160 396 184 400 236 C362 218 238 218 200 236 Z" fill="#140f0c"/>';
  const brilhoCalota = '<path d="M226 214 C244 200 268 194 290 194" fill="none" stroke="#5e4c3e" stroke-width="6" stroke-linecap="round" opacity=".5" filter="url(#sob-b2)"/>';
  return `    <g id="cabelo-frente">
      ${calota}
      ${brilhoCalota}
      <g id="cabelo-esq" data-pivo="214 210">
        ${E.base.join('\n        ')}
        ${E.meio.join('\n        ')}
        ${E.luz.join('\n        ')}
      </g>
      <g id="cabelo-dir" data-pivo="386 210">
        ${D.base.join('\n        ')}
        ${D.meio.join('\n        ')}
        ${D.recorte.join('\n        ')}
      </g>
      <!-- sombra que a coroa projeta na testa -->
      <path d="M220 224 C256 244 344 244 380 224 L380 240 C344 258 256 258 220 240 Z" fill="#0b0908" opacity=".45" filter="url(#sob-b4)"/>
    </g>`;
}

// ---------- planos da pele ----------
// Pintura em planos: cada forma é um plano do rosto, com borda quase nítida (desfoque baixo).
function planos() {
  return `      <g id="rosto-planos" clip-path="url(#sob-clip-rosto)">
        <!-- lado da vela: testa, maçã do rosto, queixo -->
        <g id="rosto-luz" filter="url(#sob-b8)">
          <path d="M214 248 C236 216 276 206 318 212 C330 236 330 262 322 288 C300 284 268 288 240 300 C228 286 218 270 214 248 Z" fill="#dcb497" opacity=".85"/>
          <path d="M226 344 C240 338 262 340 278 348 C282 364 280 378 272 390 C254 390 236 384 224 370 C220 360 220 352 226 344 Z" fill="#dcb497" opacity=".6"/>
          <path d="M268 450 C278 440 300 438 316 446 C314 460 304 470 290 470 C278 468 270 462 268 450 Z" fill="#d2a688" opacity=".8"/>
          <path d="M244 236 C262 226 286 222 304 226" fill="none" stroke="#f0d2b8" stroke-width="8" stroke-linecap="round" opacity=".6"/>
        </g>
        <!-- brilhos de pele: arco da sobrancelha, maçã, ponte do nariz -->
        <g filter="url(#sob-b2)">
          <path d="M232 292 C246 284 266 282 284 288" fill="none" stroke="#f0d2b8" stroke-width="4" stroke-linecap="round" opacity=".55"/>
          <path d="M232 350 C244 346 258 348 268 354" fill="none" stroke="#f6dcc4" stroke-width="5" stroke-linecap="round" opacity=".5"/>
        </g>
        <!-- o lado esquerdo do rosto vira para longe da luz -->
        <path d="M206 300 C204 340 208 380 218 410" fill="none" stroke="#8f6350" stroke-width="12" stroke-linecap="round" opacity=".45" filter="url(#sob-b4)"/>
        <!-- vão sob a maçã do rosto e linha do maxilar -->
        <g filter="url(#sob-b4)">
          <path d="M220 392 C232 404 248 412 262 416 C254 430 248 442 248 452 C234 440 224 420 220 392 Z" fill="#8f6350" opacity=".55"/>
          <path d="M226 430 C240 452 262 468 290 474" fill="none" stroke="#7a4e40" stroke-width="7" stroke-linecap="round" opacity=".5"/>
        </g>
        <!-- órbitas dos olhos -->
        <g filter="url(#sob-b4)">
          <path d="M232 306 C242 300 262 300 284 306 C292 314 292 324 286 332 C268 336 248 334 234 328 C228 320 228 312 232 306 Z" fill="#7a4e40" opacity=".55"/>
          <path d="M290 300 C296 306 298 316 296 326" fill="none" stroke="#6e4434" stroke-width="6" stroke-linecap="round" opacity=".45"/>
          <path d="M244 338 C256 344 270 344 280 338" fill="none" stroke="#8f6350" stroke-width="4" stroke-linecap="round" opacity=".35"/>
        </g>
        <!-- sombra fria: terminador duro junto ao nariz, macio no resto -->
        <g id="rosto-sombra">
          <path d="M346 190 C342 236 334 268 326 292 C318 312 314 336 315 362 C316 380 320 392 330 400 C344 410 350 432 340 478 L420 478 L420 190 Z" fill="#6a4a46" opacity=".9" filter="url(#sob-b2)"/>
          <path d="M324 300 C336 298 352 300 366 308 C368 318 362 326 350 330 C338 330 326 324 320 314 Z" fill="#3a2626" opacity=".6" filter="url(#sob-b4)"/>
          <!-- luz refletida no maxilar (vem da roupa e do peito) -->
          <path d="M372 404 C366 424 354 446 334 460" fill="none" stroke="#8a5a48" stroke-width="8" stroke-linecap="round" opacity=".55" filter="url(#sob-b4)"/>
          <path d="M370 334 C380 346 384 362 380 378" fill="none" stroke="#8a6050" stroke-width="7" stroke-linecap="round" opacity=".4" filter="url(#sob-b4)"/>
          <!-- recorte frio da borda -->
          <path d="M396 280 C398 320 396 360 390 392 C384 420 372 440 360 452" fill="none" stroke="#8e939a" stroke-width="2.4" opacity=".35" filter="url(#sob-b2)"/>
        </g>
        <!-- dobras: nariz-boca e sob o lábio -->
        <g fill="none" stroke-linecap="round" filter="url(#sob-b2)">
          <path d="M282 394 C272 402 268 414 270 428" stroke="#7a4a3a" stroke-width="3" opacity=".5"/>
          <path d="M318 394 C328 402 332 414 330 428" stroke="#2c1a16" stroke-width="3" opacity=".6"/>
          <path d="M290 446 C296 448 304 448 310 446" stroke="#5a3428" stroke-width="5" opacity=".55"/>
        </g>
        <!-- sob o nariz e linha do cabelo -->
        <g filter="url(#sob-b4)">
          <ellipse cx="302" cy="400" rx="18" ry="5" fill="#4a2c22" opacity=".7"/>
          <path d="M206 260 C230 226 270 214 300 218 C330 214 370 226 394 260" fill="none" stroke="#2c1a12" stroke-width="12" opacity=".55"/>
        </g>
        <!-- sangue: bochecha, nariz, orelha da luz -->
        <g filter="url(#sob-b8)" opacity=".26">
          <ellipse cx="244" cy="384" rx="22" ry="16" fill="#b0544a"/>
          <ellipse cx="300" cy="382" rx="10" ry="8" fill="#b0544a"/>
        </g>
      </g>`;
}

// ---------- pele de marta na borda da capa ----------
function pele() {
  const out = [];
  const bordas = [
    { P: [[236, 556], [176, 596], [126, 676], [104, 820]], esq: true },
    { P: [[364, 556], [424, 596], [474, 676], [496, 820]], esq: false },
  ];
  for (const { P, esq } of bordas) {
    const s = esq ? 1 : -1;
    const base = [], tufos = [], luz = [];
    base.push(path(fita(P, 46, 40), esq ? '#211a15' : '#110d0b'));
    for (let i = 0; i < 70; i++) {
      const t = rnd() * 0.98 + 0.01, p = bez(P, t);
      const ang = r(-0.9, 0.9) + (esq ? Math.PI * 0.15 : Math.PI * 0.85);
      const len = r(12, 24), x = p[0] + r(-16, 16), y = p[1] + r(-10, 10);
      const q = [[x, y], [x + Math.cos(ang) * len * 0.3, y + Math.sin(ang) * len * 0.3 + 3], [x + Math.cos(ang) * len * 0.7, y + Math.sin(ang) * len * 0.7 + 6], [x + Math.cos(ang) * len, y + Math.sin(ang) * len + 8]];
      const lado = esq ? (x < p[0] ? 1 : 0.7) : 0.5;
      const cor = esq ? ['#3a2f27', '#4a3e33', '#2a221c'][i % 3] : ['#1c1714', '#241d18', '#15110e'][i % 3];
      tufos.push(path(fita(q, r(4, 7), 0.6, 0, 1, 6), cor, lado));
      if (esq && i % 4 === 0 && t < 0.6) luz.push(path(fita(q, 2.2, 0.4, 0, 1, 6), '#8a7a68', 0.5));
      if (!esq && i % 9 === 0) luz.push(path(fita(q, 1.8, 0.4, 0, 1, 6), '#8e939a', 0.3));
    }
    out.push(`<g id="pele-${esq ? 'esq' : 'dir'}">${base.join('')}${tufos.join('')}${luz.join('')}</g>`);
  }
  return `    <g id="pele-capa" transform="translate(0 0)">
      ${out.join('\n      ')}
    </g>`;
}

// ---------- coroa ----------
function coroa() {
  // pontas em forma de folha com pérola, menos altas que antes para não parecer chapéu
  const pontas = [
    { x: 300, h: 92, w: 30 },
    { x: 252, h: 66, w: 24 }, { x: 348, h: 66, w: 24 },
    { x: 214, h: 50, w: 18 }, { x: 386, h: 50, w: 18 },
  ];
  const base = (x) => 196 - 10 * Math.cos(((x - 300) / 190) * (Math.PI / 2)) + 10; // segue a curva do aro
  const folhas = pontas.map(({ x, h, w }) => {
    const y = base(x), top = y - h;
    const d = `M${x - w} ${y} C${x - w * 0.6} ${y - h * 0.35} ${x - w * 0.55} ${y - h * 0.7} ${x} ${top} C${x + w * 0.55} ${y - h * 0.7} ${x + w * 0.6} ${y - h * 0.35} ${x + w} ${y} Z`;
    const luz = `M${x - w * 0.8} ${y - 2} C${x - w * 0.45} ${y - h * 0.38} ${x - w * 0.35} ${y - h * 0.7} ${x - 1} ${top + 4}`;
    const sombra = `M${x + 2} ${top + 6} C${x + w * 0.35} ${y - h * 0.65} ${x + w * 0.4} ${y - h * 0.35} ${x + w * 0.8} ${y - 2}`;
    const sob = x > 300 ? 0.85 : 1;
    return `<path d="${d}" fill="url(#sob-ouro)"/>
        <path d="${d}" fill="url(#sob-ouro-lado)"/>
        <path d="M${x} ${y - 4} V${top + h * 0.35}" stroke="#3a2a10" stroke-width="1.4" opacity=".6"/>
        <path d="${luz}" fill="none" stroke="#f3e2a6" stroke-width="1.6" stroke-linecap="round" opacity="${(0.75 * sob * (x < 330 ? 1 : 0.4)).toFixed(2)}"/>
        <path d="${sombra}" fill="none" stroke="#2a1e0c" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
        <circle cx="${x}" cy="${top - 4}" r="${w > 25 ? 6 : 4.5}" fill="#d8cdb8"/>
        <circle cx="${x}" cy="${top - 4}" r="${w > 25 ? 6 : 4.5}" fill="url(#sob-ouro-lado)"/>
        <circle cx="${x - 1.6}" cy="${top - 5.6}" r="1.6" fill="#fffaf0" opacity="${x < 330 ? 0.95 : 0.5}"/>`;
  });
  return `    <g id="coroa" data-pivo="300 210">
      <path id="coroa-fundo" d="M214 190 C252 172 348 172 386 190 L388 176 C350 160 250 160 212 176 Z" fill="#2a1e0c"/>
      <g id="coroa-pontas">
        ${folhas.join('\n        ')}
      </g>
      <g id="coroa-aro">
        <path d="M204 214 C250 236 350 236 396 214 L392 188 C350 208 250 208 208 188 Z" fill="url(#sob-aro)"/>
        <path d="M204 214 C250 236 350 236 396 214 L392 188 C350 208 250 208 208 188 Z" fill="url(#sob-ouro-lado)"/>
        <path d="M208 189 C250 209 350 209 392 189" fill="none" stroke="#f3e2a6" stroke-width="2" opacity=".7"/>
        <path d="M204 213 C250 235 350 235 396 213" fill="none" stroke="#24190a" stroke-width="2.6"/>
        <g fill="none" stroke="#3a2a10" stroke-width="1.3" opacity=".8">
          <path d="M224 206 C230 200 238 202 238 210 M376 206 C370 200 362 202 362 210 M278 214 C284 208 290 210 288 218 M322 214 C316 208 310 210 312 218"/>
        </g>
        <ellipse cx="300" cy="216" rx="11" ry="8.5" fill="url(#sob-gema)"/>
        <ellipse cx="300" cy="216" rx="11" ry="8.5" fill="none" stroke="#3a2a10" stroke-width="2"/>
        <ellipse cx="256" cy="212" rx="6" ry="5" fill="url(#sob-gema)"/>
        <ellipse cx="344" cy="212" rx="6" ry="5" fill="url(#sob-gema)" opacity=".75"/>
        <circle cx="296" cy="213" r="2.2" fill="#ffe8e0"/>
        <circle cx="254" cy="210" r="1.4" fill="#ffe8e0"/>
      </g>
      <!-- reflexo que corre pela coroa (animação "brilho") -->
      <g id="coroa-reflexo" opacity="0">
        <path d="M232 220 L248 120 L258 120 L244 222 Z" fill="#fff6dc" opacity=".6" filter="url(#sob-b2)"/>
      </g>
    </g>`;
}

let s = fs.readFileSync(molde, 'utf8');
s = s.replace('{{CABELO_TRAS}}', cabeloTras()).replace('{{PLANOS}}', planos()).replace('{{CABELO_FRENTE}}', cabeloFrente()).replace('{{COROA}}', coroa()).replace('{{PELE}}', pele());
// gradiente do aro: metal reflete o salão escuro no meio
s = s.replace('</defs>', `  <linearGradient id="sob-aro" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0d690"/><stop offset=".28" stop-color="#b8933e"/><stop offset=".55" stop-color="#4a3412"/><stop offset=".8" stop-color="#8f7034"/><stop offset="1" stop-color="#3a2a10"/>
    </linearGradient>
  </defs>`);
fs.writeFileSync(saida, s);
console.log(saida, (s.length / 1024).toFixed(1), 'KB');
