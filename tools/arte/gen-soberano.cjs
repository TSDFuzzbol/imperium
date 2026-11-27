// Gera assets/svg/soberano.svg: retrato do soberano em pintura expressionista de pincel seco.
// Poucas cores chapadas (creme, ocre, azul-breu, azul-cinza, verde-sálvia), sombras como grandes manchas
// de azul quase preto, planos duros no rosto e bordas quebradas por filtro de pincel. Estilo PROPOSTA.
// uso: node tools/arte/gen-soberano.cjs assets/svg/soberano.svg
const fs = require('fs');
const saida = process.argv[2] || 'assets/svg/soberano.svg';

let semente = 1427;
const rnd = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;
const r = (a, b) => a + (b - a) * rnd();
const f = (n) => Math.round(n);

// ---------- paleta (ver docs/design/ART_STYLE.md) ----------
const C = {
  creme: '#ecdcbf', cremeS: '#d6bf95',
  ocre: '#d29a36', ocreE: '#a66d1f',
  breu: '#1b1a30', breu2: '#2b2b4a',
  azul: '#8c9db1', azulC: '#bcc7d1',
  verde: '#8e9f68', ferrugem: '#9a4a2c', vinho: '#6e2230',
};

function bez(P, t) {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
}
// Pincelada: fita que começa com corpo e termina seca, numa curva de Bézier.
function fita(P, w0, w1, n = 10) {
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = bez(P, Math.max(0, t - 0.02)), b = bez(P, Math.min(1, t + 0.02));
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) * Math.min(1, 0.6 + t * 4) * 0.5;
    const p = bez(P, t);
    L.push([p[0] - (dy / d) * w, p[1] + (dx / d) * w]); R.push([p[0] + (dy / d) * w, p[1] - (dx / d) * w]);
  }
  const pts = L.concat(R.reverse());
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + 'Z';
}
const P = (d, cor, extra = '') => `<path d="${d}" fill="${cor}"${extra}/>`;
// Feixe de pinceladas secas acompanhando uma direção (para cabelo, fundo, roupa).
function feixe({ x0, y0, x1, y1, n, larg, cores, esp = 26, curva = 0, op = [0.75, 1] }) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0.5 : i / (n - 1);
    const ox = (k - 0.5) * esp + r(-4, 4), oy = r(-8, 8);
    const ax = x0 + ox, ay = y0 + oy, bx = x1 + ox * r(0.6, 1.3) + r(-10, 10), by = y1 + r(-14, 14);
    const mx = (ax + bx) / 2 + curva + r(-8, 8), my = (ay + by) / 2;
    const Q = [[ax, ay], [mx, my - (by - ay) * 0.15], [mx, my + (by - ay) * 0.15], [bx, by]];
    out.push(P(fita(Q, r(larg * 0.6, larg * 1.2), r(1, larg * 0.4)), cores[i % cores.length], ` opacity="${r(op[0], op[1]).toFixed(2)}"`));
  }
  return out.join('');
}

// ---------- fundo: blocos de tinta abstratos ----------
function fundo() {
  // blocos retos de tinta, largos, em camadas: base ocre, céu azul-cinza no alto à esquerda, luz creme à direita
  const bloco = (x0, y0, x1, y1, w, cor, op = 1) => P(fita([[x0, y0], [x0 + (x1 - x0) * 0.33, y0 + (y1 - y0) * 0.33 + r(-6, 6)], [x0 + (x1 - x0) * 0.66, y0 + (y1 - y0) * 0.66 + r(-6, 6)], [x1, y1]], w, w * 0.8, 6), cor, op < 1 ? ` opacity="${op}"` : '');
  return `<g id="fundo" filter="url(#sob-cerdas-h)">
    <rect x="-40" y="-40" width="680" height="880" fill="${C.cremeS}"/>
    ${P('M-40 300 C80 330 120 520 60 860 L-40 860 Z', C.ocre)}
    ${P('M640 640 C520 640 470 720 450 860 L640 860 Z', C.ocre)}
    ${P('M170 -40 C220 60 360 80 430 -40 Z', C.ocre)}
    <g filter="url(#sob-seco-h)">
      ${bloco(-40, 60, 330, -20, 100, C.azul)}
      ${bloco(-40, 170, 230, 90, 70, C.azul)}
      ${bloco(-40, 170, 150, 190, 50, C.azulC, 0.85)}
      ${bloco(400, 20, 640, 30, 80, C.creme)}
      ${bloco(380, 210, 640, 60, 120, C.creme)}
      ${bloco(470, 190, 640, 210, 70, C.cremeS)}
      ${bloco(420, 470, 640, 380, 130, C.creme)}
      ${bloco(470, 600, 640, 540, 70, C.cremeS, 0.9)}
      ${bloco(560, 280, 640, 300, 60, C.azul, 0.9)}
      ${bloco(-40, 470, 120, 450, 70, C.cremeS, 0.85)}
      ${bloco(-40, 660, 90, 650, 60, C.breu2, 0.8)}
    </g>
    <g filter="url(#sob-arrasto-h)">
      ${feixe({ x0: -10, y0: 250, x1: 190, y1: 268, n: 6, larg: 18, cores: [C.creme, C.cremeS, C.azulC], esp: 50, op: [0.7, 1] })}
      ${feixe({ x0: 410, y0: 60, x1: 620, y1: 52, n: 6, larg: 16, cores: [C.azul, C.ocre, C.cremeS], esp: 50, op: [0.6, 0.95] })}
      ${feixe({ x0: 440, y0: 320, x1: 620, y1: 340, n: 5, larg: 14, cores: [C.breu2, C.azul, C.ocreE], esp: 40, op: [0.5, 0.85] })}
      ${feixe({ x0: 380, y0: 0, x1: 620, y1: 250, n: 6, larg: 22, cores: [C.creme, C.azulC, C.cremeS], esp: 80, op: [0.6, 0.95] })}
      ${feixe({ x0: -20, y0: 520, x1: 140, y1: 400, n: 5, larg: 18, cores: [C.creme, C.azul, C.ocreE], esp: 60, op: [0.6, 0.9] })}
      ${feixe({ x0: 0, y0: 360, x1: 150, y1: 372, n: 4, larg: 14, cores: [C.ocreE, C.verde], esp: 40, op: [0.6, 0.9] })}
      ${feixe({ x0: 450, y0: 500, x1: 630, y1: 510, n: 5, larg: 14, cores: [C.ocre, C.verde, C.cremeS], esp: 50, op: [0.6, 0.95] })}
    </g>
  </g>`;
}

// ---------- corpo ----------
function corpo() {
  return `<g id="corpo" filter="url(#sob-seco)" transform="translate(0 -34)">
    <g id="pescoco">
      ${P('M246 452 C250 500 250 540 244 584 L338 584 C334 540 334 500 338 452 Z', C.creme)}
      ${P('M300 470 C306 510 316 548 338 584 L338 452 Z', C.breu)}
      ${P('M250 486 C270 512 300 520 336 506 L338 470 L248 470 Z', C.breu)}
      ${P('M252 540 C262 556 272 566 282 574', C.ocre, '')}
    </g>
    <g id="roupa">
      ${P('M30 830 C40 700 120 630 220 600 C238 594 250 582 256 568 L330 568 C336 582 350 594 370 600 C470 630 548 700 560 830 Z', C.breu)}
      ${P('M30 830 C40 720 100 650 190 612 C150 660 128 740 124 830 Z', C.vinho)}
      ${P('M40 830 C50 740 92 680 150 640 C122 700 108 760 104 830 Z', C.ferrugem, ' opacity=".7"')}
      ${P('M560 830 C552 720 500 650 420 612 C460 670 476 750 478 830 Z', C.breu2)}
      <g id="gola">
        ${P('M240 566 C238 586 234 604 226 620 C252 632 278 636 296 636 C316 636 342 630 364 618 C356 602 352 586 350 566 C330 582 312 588 296 588 C280 588 260 582 240 566 Z', C.breu2)}
        ${P('M226 620 C252 632 278 636 296 636 C316 636 342 630 364 618 L362 630 C340 642 316 648 296 648 C276 648 250 644 224 632 Z', C.ocre)}
        ${P('M240 566 C260 582 280 588 296 588 L296 598 C278 598 256 592 238 578 Z', C.ocre)}
        ${P('M300 636 C316 636 342 630 364 618 L362 630 C340 642 316 648 300 648 Z', C.ocreE)}
      </g>
      <g id="medalhao">
        <circle cx="296" cy="700" r="26" fill="${C.ocre}"/>
        ${P('M296 674 A26 26 0 0 1 296 726 C308 712 310 690 296 674 Z', C.ocreE)}
        <circle cx="296" cy="700" r="13" fill="${C.vinho}"/>
        ${P('M282 688 C286 680 294 676 302 676 C296 682 290 686 284 694 Z', C.creme)}
      </g>
      <g filter="url(#sob-arrasto)">
        ${feixe({ x0: 140, y0: 650, x1: 110, y1: 820, n: 5, larg: 12, cores: [C.azul, C.breu2], esp: 60, op: [0.45, 0.8] })}
        ${feixe({ x0: 228, y0: 650, x1: 240, y1: 820, n: 4, larg: 10, cores: [C.azul, C.azulC], esp: 40, op: [0.35, 0.65] })}
        ${feixe({ x0: 420, y0: 660, x1: 470, y1: 820, n: 4, larg: 10, cores: [C.breu, C.azul], esp: 40, op: [0.4, 0.7] })}
        ${feixe({ x0: 60, y0: 720, x1: 140, y1: 650, n: 4, larg: 10, cores: [C.ocre, C.ferrugem], esp: 30, op: [0.5, 0.8] })}
        ${feixe({ x0: 300, y0: 660, x1: 310, y1: 830, n: 8, larg: 5, cores: [C.azul, C.breu2, C.azulC], esp: 200, op: [0.3, 0.6] })}
        ${feixe({ x0: 268, y0: 470, x1: 262, y1: 580, n: 4, larg: 4, cores: [C.breu, C.cremeS], esp: 40, op: [0.4, 0.7] })}
      </g>
    </g>
  </g>`;
}

// ---------- cabelo de trás ----------
function cabeloTras() {
  // massa escura por trás, com borda de fora quebrada em mechas soltas
  const pontas = [];
  for (let i = 0; i < 7; i++) {
    const x = 166 + i * 7 + r(-3, 3);
    pontas.push(P(fita([[x + 10, 380], [x + 4, 450], [x - 4, 510], [x - 14 + r(-6, 6), 556 + r(-10, 14)]], r(12, 18), 1), i % 3 ? C.breu : C.ocreE));
  }
  for (let i = 0; i < 6; i++) {
    const x = 384 + i * 7 + r(-3, 3);
    pontas.push(P(fita([[x - 6, 380], [x, 450], [x + 6, 510], [x + 14 + r(-6, 6), 550 + r(-10, 14)]], r(12, 18), 1), C.breu));
  }
  return `<g id="cabelo-tras" filter="url(#sob-seco)">
    ${P('M290 108 C210 104 166 166 162 252 C158 330 166 410 178 486 L230 520 C220 470 214 400 214 330 C214 262 238 222 290 218 C344 220 372 262 376 326 C380 400 374 470 362 520 L410 488 C424 410 430 330 426 252 C420 168 372 108 290 108 Z', C.breu)}
    ${pontas.join('\n    ')}
    <!-- topo da cabeça iluminado pela esquerda -->
    ${P('M166 250 C170 196 190 158 222 136 C214 170 210 200 212 226 C196 232 180 240 166 250 Z', C.ocre)}
        ${feixe({ x0: 214, y0: 150, x1: 180, y1: 250, n: 3, larg: 10, cores: [C.ocreE, C.cremeS, C.verde], esp: 24, curva: -6, op: [0.8, 1] })}
  </g>`;
}

// ---------- rosto: planos duros ----------
function rosto() {
  const face = 'M288 196 C240 198 212 232 208 286 C204 334 208 374 218 410 C230 452 252 488 284 504 C298 510 312 508 324 498 C350 476 368 444 376 408 C384 368 386 322 382 282 C376 228 338 196 288 196 Z';
  return `<g id="cabeca">
    <clipPath id="sob-clip-rosto"><path d="${face}"/></clipPath>
    <g id="rosto" filter="url(#sob-seco-fino)">
      ${P(face, C.creme)}
      <g clip-path="url(#sob-clip-rosto)">
        <!-- meios-tons ocre: têmpora, sob a maçã do rosto, lado do nariz -->
        ${P('M200 250 C214 300 214 340 222 372 C212 360 204 330 200 290 Z', C.ocre)}
        ${P('M214 362 C230 384 250 394 266 398 C256 418 250 440 248 464 C232 444 220 410 214 362 Z', C.ocre)}
        ${P('M290 318 C286 340 280 366 276 386 C284 390 292 390 298 386 C296 360 296 338 290 318 Z', C.cremeS)}
        ${P('M250 226 C270 214 300 212 326 220 C312 234 290 240 266 240 C258 238 252 234 250 226 Z', C.ocre)}
        <!-- sombra: grande mancha azul-breu do lado oposto à luz -->
        ${P('M334 196 C344 230 338 264 326 292 L318 314 C306 334 302 358 302 380 C304 392 312 398 320 400 C332 412 334 430 328 448 C320 468 318 488 314 512 L400 512 L400 190 Z', C.breu)}
        <!-- luz refletida no maxilar, dentro da sombra -->
        ${P('M366 400 C362 424 352 446 338 462 C344 440 352 420 366 400 Z', C.breu2)}
        <!-- órbitas -->
        ${P('M302 300 C318 292 342 294 354 306 C352 322 338 330 322 330 C310 328 302 318 302 300 Z', C.breu)}
        <!-- sombra sob o nariz caindo no lábio de cima -->
        ${P('M282 402 C290 400 300 400 308 402 C304 410 296 414 288 412 Z', C.cremeS)}
        <!-- queixo: plano de sombra sob o lábio -->
        ${P('M270 470 C282 474 296 474 310 468 C304 480 292 484 282 482 C276 478 272 474 270 470 Z', C.breu)}
      </g>
    </g>

    <g id="queixo" filter="url(#sob-seco)">
      <g clip-path="url(#sob-clip-rosto)">
        ${P('M300 504 C318 498 334 484 344 466 L370 520 L292 520 Z', C.breu)}
        ${P('M234 452 C246 476 262 494 282 504 L270 520 L226 520 Z', C.ocre)}
      </g>
    </g>

    <g id="tracos" filter="url(#sob-seco-fino)">
      <g id="sobrancelhas">
        ${P('M208 300 C222 282 252 276 276 280 C286 282 292 290 296 300 C282 294 260 294 240 300 C228 304 216 306 208 300 Z', C.breu, ' id="sobrancelha-esq"')}
        ${P('M302 298 C318 284 344 284 362 296 C346 294 326 296 310 304 Z', C.breu, ' id="sobrancelha-dir"')}
      </g>
      <g id="olhos">
        <g id="olho-esq">
          <!-- órbita: mancha azul que desce da sobrancelha e abraça o olho -->
          ${P('M222 308 C236 302 262 302 284 310 C286 320 280 328 268 332 C252 334 236 330 226 322 C222 318 220 312 222 308 Z', C.breu)}
          <!-- pálpebra de baixo e bolsa sob o olho em ocre -->
          ${P('M232 330 C244 336 262 338 278 332 C274 342 262 346 250 345 C240 342 234 337 232 330 Z', C.ocre)}
          <!-- o branco do olho é estreito e sujo, quase coberto pela pálpebra pesada -->
          ${P('M234 326 C244 322 260 321 274 324 C266 331 248 333 234 326 Z', C.cremeS)}
          <circle cx="255" cy="325" r="6" fill="${C.breu}"/>
          <circle cx="252.5" cy="323.5" r="1.7" fill="${C.creme}"/>
          ${P('M228 326 C240 314 262 313 280 321 L279 325 C262 318 244 319 231 329 Z', C.breu)}
        </g>
        <g id="olho-dir">
          ${P('M300 304 C318 296 344 298 360 308 C360 322 348 332 332 334 C316 334 304 324 300 304 Z', '#100f20')}
          ${P('M312 320 C324 316 340 316 352 320 C342 326 324 327 312 320 Z', C.breu2)}
          <circle cx="332" cy="320" r="1.8" fill="${C.azul}"/>
        </g>
      </g>
      <g id="nariz">
        <!-- lado da luz do nariz em ocre, ponta em creme, base em mancha escura que se junta à sombra -->
        ${P('M288 316 C284 340 278 364 272 384 C280 384 286 382 290 378 C292 356 292 336 288 316 Z', C.ocre)}
        ${P('M272 382 C280 396 296 404 312 400 C320 398 326 390 326 380 C316 388 304 390 294 388 C284 388 278 386 272 382 Z', C.breu)}
        ${P('M276 384 C280 390 288 394 294 392 C290 386 284 382 276 384 Z', '#100f20')}
      </g>
      <g id="boca">
        <!-- lábio de cima em azul-breu, cheio; fenda larga com cantos caídos -->
        ${P('M252 442 C266 432 284 430 298 434 C312 430 328 434 342 446 C328 444 314 445 300 447 C284 448 266 448 252 442 Z', C.breu)}
        ${P('M262 448 C278 456 302 458 326 451 C318 461 302 467 286 465 C274 461 266 455 262 448 Z', '#86402a', ' id="labio-inf"')}
        ${P('M280 458 C288 460 296 460 304 458', 'none', ` stroke="${C.cremeS}" stroke-width="2.5" stroke-linecap="round" opacity=".7"`)}
        ${P('M252 442 C250 448 252 452 256 454 M342 446 C344 452 342 456 338 458', 'none', ` stroke="${C.breu}" stroke-width="3" stroke-linecap="round"`)}
      </g>
    </g>

    <!-- pinceladas por cima dos planos do rosto: o que dá a cara de tinta -->
    <g id="pinceladas-rosto" filter="url(#sob-arrasto)">
      <g clip-path="url(#sob-clip-rosto)">
        ${feixe({ x0: 334, y0: 210, x1: 318, y1: 300, n: 3, larg: 10, cores: [C.breu], esp: 18, op: [0.8, 1] })}
        ${feixe({ x0: 236, y0: 250, x1: 300, y1: 262, n: 3, larg: 8, cores: [C.cremeS, C.creme], esp: 14, op: [0.6, 0.9] })}
        ${feixe({ x0: 224, y0: 368, x1: 246, y1: 450, n: 3, larg: 8, cores: [C.ocreE, C.ocre], esp: 16, op: [0.5, 0.8] })}
        ${feixe({ x0: 342, y0: 330, x1: 330, y1: 470, n: 3, larg: 10, cores: [C.breu2, C.breu], esp: 30, op: [0.6, 0.9] })}
        <!-- azul arrastado sobre o creme, junto do terminador (a tinta escura vaza para a luz) -->
        ${feixe({ x0: 318, y0: 220, x1: 312, y1: 290, n: 3, larg: 5, cores: [C.breu, C.breu2], esp: 16, op: [0.45, 0.8] })}
        <!-- creme e azul-cinza arrastados por cima da sombra -->
        ${feixe({ x0: 360, y0: 240, x1: 356, y1: 400, n: 3, larg: 4, cores: [C.breu2, C.azul], esp: 30, op: [0.2, 0.4] })}
        <!-- ocre seco na pele iluminada -->
        ${feixe({ x0: 230, y0: 250, x1: 226, y1: 420, n: 5, larg: 5, cores: [C.ocre, C.cremeS, C.ocreE], esp: 30, op: [0.35, 0.7] })}
        ${feixe({ x0: 262, y0: 350, x1: 254, y1: 470, n: 4, larg: 4, cores: [C.cremeS, C.ocre], esp: 30, op: [0.3, 0.6] })}
      </g>
    </g>

    ${cabeloFrente()}
  </g>`;
}

// ---------- cabelo da frente: massa escura com pinceladas secas de ocre, verde e azul-cinza ----------
function cabeloFrente() {
  // lado da luz: faixa larga de ocre caindo da têmpora ao ombro, cortada por fios escuros
  const luz = 'M226 212 C200 236 184 280 180 340 C176 410 182 470 194 530 L222 534 C212 474 208 410 210 344 C212 290 222 250 244 222 Z';
  const fiosEscuros = [], fiosClaros = [];
  for (let i = 0; i < 6; i++) {
    const x = 186 + i * 6 + r(-2, 2);
    fiosEscuros.push(P(fita([[x + 26, 226 + i * 4], [x + 2, 300], [x - 4, 420], [x + 2 + r(-4, 4), 530]], r(3, 6), 1), i % 2 ? C.breu : C.breu2, ` opacity="${r(0.75, 1).toFixed(2)}"`));
  }
  for (let i = 0; i < 5; i++) {
    const x = 190 + i * 7 + r(-2, 2);
    fiosClaros.push(P(fita([[x + 22, 232], [x + 2, 300], [x - 2, 400], [x + r(-4, 4), 470 + r(0, 40)]], r(3, 5), 0.8), [C.creme, C.verde, C.azulC, C.cremeS, C.verde][i], ` opacity="${r(0.6, 0.95).toFixed(2)}"`));
  }
  return `<g id="cabelo-frente">
    <g filter="url(#sob-seco)">
      <!-- franja escura que cai da coroa e corta a testa -->
      ${P('M206 288 C206 236 236 206 290 202 C330 202 362 214 382 246 C356 228 326 226 302 234 C292 254 282 270 268 280 C270 262 272 250 268 244 C254 254 244 270 236 292 C226 282 214 282 206 288 Z', C.breu)}
      ${P('M210 282 C212 240 232 212 268 204 C256 224 246 248 240 280 C230 274 220 276 210 282 Z', C.ocre)}
      ${P(luz, C.ocre)}
      ${P('M180 340 C178 400 182 460 192 520 L200 520 C192 460 190 400 192 344 Z', C.ocreE)}
      <!-- lado da sombra: mecha escura com reflexo frio -->
      ${P('M376 250 C392 300 396 380 392 460 C390 490 384 510 376 526 L362 520 C372 470 376 400 372 330 C370 300 368 276 362 256 Z', C.breu2)}
    </g>
    <g filter="url(#sob-arrasto)">
      ${fiosEscuros.join('\n      ')}
      ${fiosClaros.join('\n      ')}
      ${feixe({ x0: 386, y0: 290, x1: 384, y1: 500, n: 3, larg: 6, cores: [C.azul, C.azulC], esp: 14, curva: 6, op: [0.5, 0.8] })}
      ${feixe({ x0: 414, y0: 250, x1: 416, y1: 470, n: 3, larg: 7, cores: [C.ocreE, C.verde, C.ocre], esp: 12, curva: 6, op: [0.6, 0.9] })}
      ${feixe({ x0: 282, y0: 210, x1: 250, y1: 270, n: 3, larg: 6, cores: [C.cremeS, C.verde, C.ocre], esp: 24, op: [0.7, 0.95] })}
    </g>
  </g>`;
}

// ---------- coroa: ouro em ocre, sombra em breu, brilho em creme ----------
function coroa() {
  // Coroa pintada como o resto: pontas tortas, sem círculos perfeitos, metade em sombra azul-breu,
  // brilho em pinceladas secas de creme e gemas como borrões.
  const pontas = [[224, 30, -4], [258, 44, -2], [297, 60, 1], [335, 42, 3], [366, 28, 5]];
  const base = (x) => 190 + 10 * Math.cos(((x - 296) / 150) * (Math.PI / 2));
  const fundo = [], ouro = [], sombra = [], brilho = [];
  for (const [x, h, inc] of pontas) {
    const y = base(x) - 6, tx = x + inc, ty = y - h;
    const w = h > 50 ? 18 : 15;
    fundo.push(P(`M${x - w - 4} ${f(y + 6)} L${f(tx - 4)} ${f(ty - 6)} L${f(tx + 5)} ${f(ty - 4)} L${x + w + 4} ${f(y + 6)} Z`, C.breu));
    ouro.push(P(`M${x - w} ${f(y)} C${f(x - w * 0.6)} ${f(y - h * 0.4)} ${f(tx - 4)} ${f(ty + h * 0.3)} ${f(tx - 1)} ${f(ty)} L${f(tx + 2)} ${f(ty + 1)} C${f(tx + 3)} ${f(ty + h * 0.35)} ${f(x + w * 0.6)} ${f(y - h * 0.4)} ${x + w} ${f(y)} Z`, C.ocre));
    // lado direito de cada ponta na sombra; as da direita quase inteiras
    sombra.push(P(`M${f(tx + 1)} ${f(ty + 2)} C${f(tx + 3)} ${f(ty + h * 0.35)} ${f(x + w * 0.6)} ${f(y - h * 0.4)} ${x + w} ${f(y)} L${f(x + (x > 320 ? -w * 0.6 : 2))} ${f(y)} Z`, x > 320 ? C.breu : C.ocreE));
    // remate da ponta: um borrão, não uma bolinha
    ouro.push(P(fita([[tx - 5, ty - 3], [tx - 2, ty - 7], [tx + 3, ty - 8], [tx + 6, ty - 3]], h > 50 ? 9 : 7, 3, 6), x > 320 ? C.ocreE : C.cremeS));
    if (x < 320) brilho.push(P(fita([[x - w * 0.55, y - 2], [x - w * 0.4, y - h * 0.35], [tx - 3, ty + h * 0.45], [tx - 1, ty + 6]], 6, 1.5, 8), C.creme, ' opacity=".9"'));
  }
  return `<g id="coroa">
    <g filter="url(#sob-seco)">
      ${fundo.join('')}
      ${P('M204 218 C250 240 336 240 386 212 L380 168 C334 188 256 188 208 170 Z', C.breu)}
    </g>
    <g filter="url(#sob-seco-fino)">
      ${ouro.join('')}
      ${sombra.join('')}
      ${P('M212 210 C252 230 334 230 378 206 L374 176 C334 194 256 194 216 178 Z', C.ocre)}
      ${P('M214 196 C254 214 334 214 376 192 L378 206 C334 228 252 228 212 210 Z', C.ocreE)}
      ${P('M318 196 C342 192 360 186 374 176 L378 206 C362 216 342 222 320 226 Z', C.breu)}
      ${P('M318 194 C340 190 360 184 374 174 L376 182 C360 192 342 198 320 202 Z', C.ocreE)}
      ${P('M330 220 C346 216 362 210 376 202 L377 207 C362 215 346 221 332 225 Z', C.azul, ' opacity=".7"')}
      ${P('M226 204 C230 198 236 198 238 206 C236 212 228 212 226 204 Z', C.ocreE)}
      ${P('M286 210 C288 202 302 200 306 208 C306 218 290 220 286 210 Z', C.vinho)}
      ${P('M250 206 C251 200 260 200 262 206 C261 213 252 213 250 206 Z', C.vinho)}
      ${P('M336 206 C337 201 345 201 346 206 C345 212 338 212 336 206 Z', '#4a1824')}
      ${P('M290 206 C292 203 296 202 298 204', 'none', ` stroke="${C.cremeS}" stroke-width="2" stroke-linecap="round"`)}
    </g>
    <g filter="url(#sob-arrasto-h)">
      ${feixe({ x0: 216, y0: 186, x1: 312, y1: 200, n: 3, larg: 7, cores: [C.creme, C.cremeS], esp: 12, op: [0.75, 1] })}
      ${feixe({ x0: 220, y0: 214, x1: 330, y1: 222, n: 3, larg: 4, cores: [C.ocreE, C.breu2], esp: 8, op: [0.5, 0.8] })}
    </g>
    <g filter="url(#sob-arrasto)">${brilho.join('')}</g>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" id="soberano" data-peca="soberano" data-versao="2">
  <title>O Soberano de Eldoria</title>
  <desc>Retrato em pintura expressionista de pincel seco: cores chapadas, sombras azul-breu e bordas quebradas. Estilo PROPOSTA, ver docs/design/ART_STYLE.md. Gerado por tools/arte/gen-soberano.cjs.</desc>
  <defs>
    <!-- borda de pincel: lascas verticais, no sentido das pinceladas do rosto, do cabelo e da roupa -->
    <filter id="sob-seco" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".09 .007" numOctaves="3" seed="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- a mesma ideia, mais contida, para olhos, boca e coroa -->
    <filter id="sob-seco-fino" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".12 .02" numOctaves="2" seed="9" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- pincel seco vertical: a tinta falha em riscos, como cerda arrastada em tela áspera -->
    <filter id="sob-arrasto" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".5 .012" numOctaves="2" seed="4" result="riscos"/>
      <feColorMatrix in="riscos" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.3" result="mascara"/>
      <feComposite in="SourceGraphic" in2="mascara" operator="in" result="seco"/>
      <feTurbulence type="fractalNoise" baseFrequency=".08 .006" numOctaves="2" seed="6" result="n"/>
      <feDisplacementMap in="seco" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- variantes horizontais, para os blocos do fundo -->
    <filter id="sob-seco-h" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".007 .09" numOctaves="3" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="sob-arrasto-h" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".012 .5" numOctaves="2" seed="5" result="riscos"/>
      <feColorMatrix in="riscos" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.3" result="mascara"/>
      <feComposite in="SourceGraphic" in2="mascara" operator="in" result="seco"/>
      <feTurbulence type="fractalNoise" baseFrequency=".006 .08" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="seco" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- cerdas: arrasta todas as bordas em riscos finos, como pincel seco -->
    <filter id="sob-cerdas" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".32 .006" numOctaves="2" seed="13" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="B" yChannelSelector="R"/>
    </filter>
    <filter id="sob-cerdas-h" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".006 .32" numOctaves="2" seed="14" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="B"/>
    </filter>
    <!-- trama da tela -->
    <filter id="sob-tela" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9 .02" numOctaves="2" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <clipPath id="sob-quadro"><rect width="600" height="800"/></clipPath>
  </defs>
  <g clip-path="url(#sob-quadro)">
    ${fundo()}
    <g id="figura" filter="url(#sob-cerdas)"><g transform="translate(296 330) scale(1.32) translate(-296 -310)">
      ${cabeloTras()}
      ${corpo()}
      ${rosto()}
      ${coroa()}
    </g></g>
    <rect id="tela" width="600" height="800" filter="url(#sob-tela)" opacity=".2" style="mix-blend-mode:multiply"/>
  </g>
</svg>
`;
fs.writeFileSync(saida, svg);
console.log(saida, (svg.length / 1024).toFixed(1), 'KB');
