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
      </g>
    </g>
  </g>`;
}

// ---------- cabelo de trás ----------
function cabeloTras() {
  return `<g id="cabelo-tras" filter="url(#sob-seco)">
    ${P('M290 108 C206 104 160 170 156 256 C152 346 160 432 176 520 C190 540 214 544 232 530 C222 470 214 400 214 330 C214 262 238 222 290 218 C344 220 372 262 376 326 C380 400 374 470 362 530 C380 544 404 540 416 520 C430 432 436 344 430 256 C424 168 374 108 290 108 Z', C.breu)}
    ${feixe({ x0: 250, y0: 130, x1: 196, y1: 330, n: 5, larg: 24, cores: [C.ocre, C.ocreE, C.ocre, C.verde], esp: 44, curva: -8, op: [0.9, 1] })}
    ${feixe({ x0: 190, y0: 300, x1: 196, y1: 510, n: 4, larg: 18, cores: [C.ocre, C.ocreE, C.verde], esp: 30, curva: -4, op: [0.85, 1] })}
    ${feixe({ x0: 300, y0: 112, x1: 262, y1: 200, n: 3, larg: 22, cores: [C.ocre, C.cremeS], esp: 50, op: [0.9, 1] })}
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
        ${P('M226 312 C240 306 262 306 280 312 C276 318 266 320 256 318 C244 318 234 318 226 312 Z', C.breu2)}
        ${P('M228 326 C242 332 262 334 278 326 C272 338 254 342 240 338 C234 334 230 330 228 326 Z', C.ocre)}
        ${P('M302 300 C318 292 342 294 354 306 C352 322 338 330 322 330 C310 328 302 318 302 300 Z', C.breu)}
        <!-- sombra sob o nariz caindo no lábio de cima -->
        ${P('M282 402 C290 400 300 400 308 402 C304 410 296 414 288 412 Z', C.cremeS)}
        <!-- queixo: plano de sombra sob o lábio -->
        ${P('M266 464 C280 468 296 468 310 462 C304 474 292 480 280 478 C272 474 268 470 266 464 Z', C.breu)}
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
        ${P('M212 302 C226 286 252 280 274 284 C282 286 288 292 292 300 C278 296 258 296 240 302 C230 305 220 306 212 302 Z', C.breu, ' id="sobrancelha-esq"')}
        ${P('M304 296 C318 286 340 286 358 296 C344 294 326 296 312 302 Z', C.breu, ' id="sobrancelha-dir"')}
      </g>
      <g id="olhos">
        <g id="olho-esq">
          ${P('M228 320 C238 310 258 308 276 316 C266 326 246 328 228 320 Z', C.breu)}
          ${P('M236 322 C246 318 260 318 270 320 C262 326 248 328 236 322 Z', C.cremeS)}
          <circle cx="254" cy="320" r="6.5" fill="${C.breu}"/>
          <circle cx="251" cy="318" r="1.8" fill="${C.creme}"/>
          ${P('M226 320 C238 304 264 302 282 314 L280 320 C262 310 244 312 230 324 Z', C.breu)}
        </g>
        <g id="olho-dir">
          ${P('M312 314 C326 306 342 308 352 316 C340 322 324 322 312 314 Z', '#0f0e1c')}
          <circle cx="334" cy="316" r="1.6" fill="${C.azul}"/>
        </g>
      </g>
      <g id="nariz">
        ${P('M278 380 C284 394 296 400 310 398 C318 396 322 390 322 382 C314 390 304 390 296 388 C288 388 282 384 278 380 Z', C.breu)}
        ${P('M282 386 C286 390 292 392 296 390 C292 386 288 384 282 386 Z', C.breu)}
        ${P('M286 330 C284 350 282 368 280 380', 'none', ` stroke="${C.ocreE}" stroke-width="3" stroke-linecap="round"`)}
      </g>
      <g id="boca">
        ${P('M256 440 C272 432 290 432 300 436 C312 432 326 436 338 444 C322 444 310 444 300 446 C286 446 270 446 256 440 Z', C.breu)}
        ${P('M264 446 C280 456 304 458 326 450 C316 462 298 466 282 462 C274 458 268 452 264 446 Z', C.ferrugem, ' id="labio-inf"')}
        ${P('M276 450 C284 452 292 452 300 450', 'none', ` stroke="${C.creme}" stroke-width="2.5" stroke-linecap="round" opacity=".8"`)}
      </g>
    </g>

    <!-- pinceladas por cima dos planos do rosto: o que dá a cara de tinta -->
    <g id="pinceladas-rosto" filter="url(#sob-arrasto)">
      <g clip-path="url(#sob-clip-rosto)">
        ${feixe({ x0: 334, y0: 210, x1: 318, y1: 300, n: 3, larg: 10, cores: [C.breu], esp: 18, op: [0.8, 1] })}
        ${feixe({ x0: 236, y0: 250, x1: 300, y1: 262, n: 3, larg: 8, cores: [C.cremeS, C.creme], esp: 14, op: [0.6, 0.9] })}
        ${feixe({ x0: 224, y0: 368, x1: 246, y1: 450, n: 3, larg: 8, cores: [C.ocreE, C.ocre], esp: 16, op: [0.5, 0.8] })}
        ${feixe({ x0: 342, y0: 330, x1: 330, y1: 470, n: 3, larg: 10, cores: [C.breu2, C.breu], esp: 30, op: [0.6, 0.9] })}
      </g>
    </g>

    ${cabeloFrente()}
  </g>`;
}

// ---------- cabelo da frente: massa escura com pinceladas secas de ocre, verde e azul-cinza ----------
function cabeloFrente() {
  return `<g id="cabelo-frente">
    <g filter="url(#sob-seco)">
      ${P('M204 290 C206 236 236 204 288 200 C330 200 362 214 380 244 C352 226 322 224 298 232 C272 242 248 262 236 290 C226 280 214 280 204 290 Z', C.breu)}
      ${P('M206 286 C208 240 232 210 276 202 C262 222 248 248 238 284 C228 278 216 278 206 286 Z', C.ocre)}
      ${P('M180 300 C176 380 184 450 200 520 L226 526 C214 460 208 390 210 320 Z', C.breu2)}
      ${P('M172 500 L182 560 L194 516 L206 572 L214 520 L232 548 L232 520 Z', C.breu)}
      ${P('M364 520 L372 566 L382 522 L396 556 L402 516 L416 540 L418 510 Z', C.breu)}
    </g>
    <g filter="url(#sob-seco)">
      ${feixe({ x0: 236, y0: 214, x1: 206, y1: 330, n: 4, larg: 16, cores: [C.ocre, C.verde, C.ocreE, C.azulC], esp: 30, curva: -4, op: [0.85, 1] })}
      ${feixe({ x0: 200, y0: 320, x1: 204, y1: 510, n: 4, larg: 14, cores: [C.ocreE, C.verde, C.azul, C.ocre], esp: 26, curva: -4, op: [0.8, 1] })}
      ${feixe({ x0: 300, y0: 206, x1: 250, y1: 262, n: 3, larg: 14, cores: [C.ocre, C.verde, C.cremeS], esp: 36, op: [0.85, 1] })}
      ${feixe({ x0: 398, y0: 290, x1: 392, y1: 512, n: 2, larg: 12, cores: [C.azul, C.breu2], esp: 18, curva: 8, op: [0.5, 0.8] })}
    </g>
    <g filter="url(#sob-arrasto)">
      ${feixe({ x0: 226, y0: 232, x1: 202, y1: 420, n: 5, larg: 6, cores: [C.creme, C.azulC, C.verde], esp: 28, curva: -4, op: [0.6, 0.9] })}
    </g>
  </g>`;
}

// ---------- coroa: ouro em ocre, sombra em breu, brilho em creme ----------
function coroa() {
  const pontas = [[226, 28], [258, 42], [296, 58], [334, 42], [364, 28]];
  const base = (x) => 190 + 10 * Math.cos(((x - 296) / 150) * (Math.PI / 2));
  const ps = pontas.map(([x, h]) => {
    const y = base(x) - 8;
    return P(`M${x - 13} ${f(y)} L${x - 2} ${f(y - h)} L${x + 2} ${f(y - h)} L${x + 13} ${f(y)} Z`, C.ocre) +
      P(`M${x + 1} ${f(y - h)} L${x + 13} ${f(y)} L${x + 3} ${f(y)} Z`, x > 300 ? C.breu : C.ocreE) +
      `<circle cx="${x}" cy="${f(y - h - 5)}" r="${h > 50 ? 7 : 5}" fill="${x > 320 ? C.ocreE : C.creme}"/>`;
  }).join('');
  // contorno escuro por trás, para o ouro não se perder no cabelo ocre
  const sombra = pontas.map(([x, h]) => { const y = base(x) - 8; return P(`M${x - 17} ${f(y + 4)} L${x - 3} ${f(y - h - 4)} L${x + 3} ${f(y - h - 4)} L${x + 17} ${f(y + 4)} Z`, C.breu) + `<circle cx="${x}" cy="${f(y - h - 5)}" r="${h > 50 ? 10 : 8}" fill="${C.breu}"/>`; }).join('');
  return `<g id="coroa" filter="url(#sob-seco-fino)">
    ${sombra}
    ${P('M208 214 C250 236 334 236 382 210 L376 172 C332 190 256 190 212 174 Z', C.breu)}
    ${ps}
    ${P('M214 208 C250 226 334 226 376 206 L372 178 C332 196 256 196 218 180 Z', C.ocre)}
    ${P('M300 196 C330 194 352 188 372 178 L376 206 C352 218 326 224 300 224 Z', C.ocreE)}
    ${P('M330 192 C348 188 362 184 372 178 L376 206 C362 214 348 218 334 220 Z', C.breu)}
    ${P('M220 184 C252 198 290 200 316 198 L316 204 C290 206 250 204 220 190 Z', C.creme)}
    <ellipse cx="296" cy="210" rx="9" ry="7" fill="${C.vinho}"/>
    <ellipse cx="256" cy="206" rx="5" ry="4.5" fill="${C.vinho}"/>
    <circle cx="293" cy="207" r="2" fill="${C.creme}"/>
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
    </g></g>
    <g transform="translate(296 330) scale(1.32) translate(-296 -310)">${coroa()}</g>
    <rect id="tela" width="600" height="800" filter="url(#sob-tela)" opacity=".2" style="mix-blend-mode:multiply"/>
  </g>
</svg>
`;
fs.writeFileSync(saida, svg);
console.log(saida, (svg.length / 1024).toFixed(1), 'KB');
