// Gera assets/svg/fundo-valtheris-parallax.svg: Valtheris ao entardecer, em camadas para parallax.
// Fundo TEMPORÁRIO: segura o lugar até chegarem as pinturas em assets/backgrounds/.
// uso: node gen-fundo.cjs <saida.svg>
const fs = require('fs');
const saida = process.argv[2];
let semente = 1207;
const rnd = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;
const r = (a, b) => a + (b - a) * rnd();
const f = (n) => Math.round(n);
const W = 600, H = 1300, M = 90; // M = sobra lateral para o deslocamento do parallax

// Silhueta de serra: pontos com ruído, fechada embaixo.
function serra(y0, amp, passo, base) {
  let d = `M${-M} ${base} L${-M} ${y0}`;
  let y = y0;
  for (let x = -M; x <= W + M; x += passo) {
    y = Math.max(y0 - amp, Math.min(y0 + amp * 0.4, y + r(-amp * 0.45, amp * 0.45)));
    d += ` L${f(x)} ${f(y)}`;
  }
  return d + ` L${W + M} ${base} Z`;
}

// Casa: corpo + telhado íngreme, com janela acesa às vezes.
function casa(x, chao, w, h, corCorpo, corTelhado, corLuz, pLuz) {
  const tel = h * r(0.6, 1.0);
  let s = `<path d="M${f(x)} ${f(chao)} V${f(chao - h)} L${f(x + w / 2)} ${f(chao - h - tel)} L${f(x + w)} ${f(chao - h)} V${f(chao)} Z" fill="${corCorpo}"/>`;
  s += `<path d="M${f(x - 2)} ${f(chao - h + 1)} L${f(x + w / 2)} ${f(chao - h - tel)} L${f(x + w + 2)} ${f(chao - h + 1)} L${f(x + w / 2)} ${f(chao - h - tel + 4)} Z" fill="${corTelhado}"/>`;
  if (rnd() < pLuz) {
    const jw = Math.max(2, w * 0.14), jh = jw * 1.5;
    s += `<rect x="${f(x + w * r(0.2, 0.6))}" y="${f(chao - h * r(0.4, 0.75))}" width="${f(jw)}" height="${f(jh)}" fill="${corLuz}"/>`;
  }
  return s;
}

// Torre com telhado cônico.
function torre(x, chao, w, h, cor, corTel, luz) {
  const tel = w * r(1.4, 2.2);
  let s = `<path d="M${f(x)} ${f(chao)} V${f(chao - h)} H${f(x + w)} V${f(chao)} Z" fill="${cor}"/>`;
  s += `<path d="M${f(x - w * 0.12)} ${f(chao - h)} L${f(x + w / 2)} ${f(chao - h - tel)} L${f(x + w * 1.12)} ${f(chao - h)} Z" fill="${corTel}"/>`;
  if (luz) s += `<rect x="${f(x + w * 0.38)}" y="${f(chao - h * 0.7)}" width="${f(Math.max(2, w * 0.22))}" height="${f(Math.max(3, w * 0.36))}" fill="${luz}"/>`;
  return s;
}

function castelo() {
  // Valtheris sobre a colina: muralha, torres, palácio e a agulha da catedral.
  const c = '#2a2c31', ct = '#1e2025', luz = '#f2a648';
  let s = '';
  s += `<path d="M${-M} 760 C80 720 160 640 250 600 C300 580 360 585 420 610 C500 650 560 700 ${W + M} 730 V900 H${-M} Z" fill="#23252a"/>`; // colina
  s += `<path d="M150 650 L180 640 V600 H420 V640 L460 660 V700 H150 Z" fill="${c}"/>`; // muralha
  for (let x = 150; x < 460; x += 12) s += `<rect x="${x}" y="${x < 180 || x > 420 ? 640 : 592}" width="7" height="9" fill="${c}"/>`; // ameias
  s += torre(140, 700, 26, 90, c, ct, luz) + torre(434, 710, 26, 80, c, ct, luz);
  s += torre(196, 610, 24, 70, c, ct, luz) + torre(380, 610, 24, 80, c, ct, false);
  s += `<path d="M240 610 V500 H360 V610 Z" fill="#2e3036"/>`; // palácio
  s += `<path d="M232 500 L300 450 L368 500 Z" fill="${ct}"/>`;
  for (let i = 0; i < 5; i++) s += `<rect x="${252 + i * 22}" y="${530 + (i % 2) * 34}" width="5" height="9" fill="${luz}" opacity="${r(0.6, 1).toFixed(2)}"/>`;
  s += torre(262, 500, 20, 70, '#2e3036', ct, luz) + torre(320, 500, 18, 60, '#2e3036', ct, false);
  // catedral com agulha
  s += `<path d="M286 470 V360 H314 V470 Z" fill="#30323a"/><path d="M282 360 L300 240 L318 360 Z" fill="${ct}"/>`;
  s += `<path d="M300 240 V214 M292 224 H308" stroke="#8e939a" stroke-width="2" opacity=".6"/>`;
  s += `<rect x="296" y="380" width="8" height="16" rx="4" fill="${luz}"/>`;
  // recorte de luz quente do lado do poente
  s += `<path d="M140 700 V610 M196 610 V540 M240 610 V500 M286 470 V360" stroke="#d9782a" stroke-width="2" opacity=".35"/>`;
  return s;
}

function cidade(chao0, n, escala, corCorpo, corTel, pLuz, seedShift) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const w = r(30, 60) * escala, h = r(30, 70) * escala;
    const x = -M + (i / n) * (W + 2 * M) + r(-10, 10);
    const chao = chao0 + r(-20, 30) * escala;
    s += rnd() < 0.1 ? torre(x, chao, w * 0.5, h * 1.8, corCorpo, corTel, '#f2a648') : casa(x, chao, w, h, corCorpo, corTel, '#f2a648', pLuz);
  }
  return s;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" id="fundo-valtheris" data-peca="fundo-valtheris-parallax" data-temporario="sim">
  <title>Valtheris ao entardecer (temporário)</title>
  <desc>Fundo em camadas para parallax. Cada camada tem data-profundidade de 0 (parada) a 1 (acompanha o dedo). As camadas passam ${M} unidades de cada lado para o deslocamento não mostrar borda. Substituir por pinturas em assets/backgrounds/.</desc>
  <defs>
    <linearGradient id="fv-ceu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c1f24"/><stop offset=".3" stop-color="#3a3d42"/><stop offset=".46" stop-color="#6e5a4a"/><stop offset=".55" stop-color="#b9764a"/><stop offset=".62" stop-color="#5f646b"/>
    </linearGradient>
    <radialGradient id="fv-sol" cx="22%" cy="52%" r="45%"><stop offset="0" stop-color="#ffcf98" stop-opacity=".55"/><stop offset="1" stop-color="#f2a648" stop-opacity="0"/></radialGradient>
    <linearGradient id="fv-nevoa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9aeb3" stop-opacity="0"/><stop offset=".5" stop-color="#a9aeb3" stop-opacity=".45"/><stop offset="1" stop-color="#7d848c" stop-opacity="0"/></linearGradient>
    <linearGradient id="fv-chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16110d" stop-opacity="0"/><stop offset=".4" stop-color="#16110d"/></linearGradient>
    ${['#2a2d33', '#4b525b', '#5f646b', '#8a6a52'].map((c, i) => `<radialGradient id="fv-nuvem${i}"><stop offset="0" stop-color="${c}"/><stop offset=".55" stop-color="${c}" stop-opacity=".6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('\n    ')}
    <filter id="fv-b6" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="fv-b14" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="fv-b2"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="fv-grao" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>

  <g id="camada-ceu" data-profundidade="0.05">
    <rect x="${-M}" y="0" width="${W + 2 * M}" height="${H}" fill="url(#fv-ceu)"/>
    <rect x="${-M}" y="0" width="${W + 2 * M}" height="${H}" fill="url(#fv-sol)"/>
    <g opacity=".85">
      ${Array.from({ length: 14 }, () => `<ellipse cx="${f(r(-M, W + M))}" cy="${f(r(150, 560))}" rx="${f(r(110, 240))}" ry="${f(r(24, 56))}" fill="url(#fv-nuvem${Math.floor(r(0, 4))})" opacity="${r(0.45, 0.9).toFixed(2)}"/>`).join('\n      ')}
    </g>
  </g>

  <g id="camada-montanhas" data-profundidade="0.15">
    <path d="${serra(560, 70, 30, 900)}" fill="#4b525b" opacity=".9" filter="url(#fv-b2)"/>
    <path d="${serra(620, 50, 24, 900)}" fill="#3a3f46"/>
  </g>

  <g id="camada-castelo" data-profundidade="0.35">
    ${castelo()}
  </g>

  <g id="camada-nevoa" data-profundidade="0.5">
    <rect x="${-M}" y="640" width="${W + 2 * M}" height="200" fill="url(#fv-nevoa)" filter="url(#fv-b14)"/>
    <ellipse cx="120" cy="760" rx="220" ry="30" fill="#a9aeb3" opacity=".25" filter="url(#fv-b14)"/>
  </g>

  <g id="camada-cidade" data-profundidade="0.7">
    ${cidade(870, 16, 1.2, '#1e1d1f', '#2e2422', 0.35)}
    <rect x="${-M}" y="880" width="${W + 2 * M}" height="${H - 880}" fill="#17151a"/>
    ${cidade(980, 12, 1.7, '#141214', '#241b18', 0.3)}
    <rect x="${-M}" y="990" width="${W + 2 * M}" height="${H - 990}" fill="#110f10"/>
  </g>

  <g id="camada-frente" data-profundidade="1">
    ${casa(-M, H, 230, 210, '#0b0908', '#16110d', '#f2a648', 1)}
    ${torre(W - 40, H, 110, 300, '#0b0908', '#120e0c', '#f2a648')}
    <path d="M${W - 156} 1030 H${W - 104}" stroke="#2a221c" stroke-width="5" stroke-linecap="round"/>
    <path d="M${W - 150} 1040 H${W - 110} V1150 L${W - 130} 1170 L${W - 150} 1150 Z" fill="#6e1c20"/>
    <path d="M${W - 150} 1040 H${W - 142} V1157 L${W - 150} 1150 Z" fill="#a3343a" opacity=".6"/>
    <rect x="${-M}" y="${H - 220}" width="${W + 2 * M}" height="220" fill="url(#fv-chao)"/>
  </g>

  <rect id="grao" x="0" y="0" width="${W}" height="${H}" filter="url(#fv-grao)" opacity=".06" style="mix-blend-mode:overlay"/>
</svg>
`;
fs.writeFileSync(saida, svg);
console.log(saida, (svg.length / 1024).toFixed(1), 'KB');
