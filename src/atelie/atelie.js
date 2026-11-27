// Ateliê do Imperium: mostra cada peça de arte isolada, liga e desliga camadas e testa animações no celular.
// As peças vêm de assets/svg/. Na versão de arquivo único, o build injeta os SVGs em window.ATELIE_SVGS.
(function () {
  'use strict';

  const PECAS = [
    { arq: 'soberano.svg', nome: 'O soberano', tipo: 'retrato' },
    { arq: 'fundo-valtheris-parallax.svg', nome: 'Valtheris em camadas', tipo: 'parallax' },
  ];
  const BASE = '../assets/svg/';
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (s) => document.querySelector(s);
  const palco = $('#palco'), dica = $('#dica');
  let svg = null, peca = null, laços = [], parallax = null;

  // ---------- zoom travado (o iOS ignora user-scalable=no em alguns casos) ----------
  ['gesturestart', 'gesturechange'].forEach((t) => document.addEventListener(t, (e) => e.preventDefault(), { passive: false }));
  let ultimoToque = 0;
  document.addEventListener('touchend', (e) => { const t = Date.now(); if (t - ultimoToque < 320) e.preventDefault(); ultimoToque = t; }, { passive: false });

  // ---------- carregar ----------
  async function texto(arq) {
    if (window.ATELIE_SVGS && window.ATELIE_SVGS[arq]) return window.ATELIE_SVGS[arq];
    const r = await fetch(BASE + arq, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`Não achei ${arq} (${r.status}).`);
    return r.text();
  }

  async function abrir(i) {
    pararTudo();
    peca = PECAS[i];
    document.querySelectorAll('#pecas button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    palco.innerHTML = '';
    dica.textContent = 'Carregando…';
    let src;
    try { src = await texto(peca.arq); } catch (e) { dica.textContent = e.message; return; }
    palco.innerHTML = src;
    svg = palco.querySelector('svg');
    const vb = svg.viewBox.baseVal;
    const ratio = vb.width / vb.height;
    if (peca.tipo === 'parallax') {
      // mostra a peça como a tela de um celular em pé
      palco.style.aspectRatio = '9 / 16';
      palco.style.width = `min(100%, calc(64vh * 9 / 16))`;
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      palco.style.touchAction = 'none';
    } else {
      palco.style.aspectRatio = `${vb.width} / ${vb.height}`;
      palco.style.width = `min(100%, calc(62vh * ${ratio}))`;
      palco.style.touchAction = 'pan-y';
    }
    palco.style.justifySelf = 'center'; palco.style.marginInline = 'auto';
    prepararPivos();
    montarAnimacoes();
    montarCamadas();
    montarFicha(src, vb);
    if (peca.tipo === 'parallax') { iniciarParallax(); dica.textContent = 'Arraste o dedo no quadro para ver as camadas se moverem.'; }
    else dica.textContent = calmo ? 'Movimento reduzido está ligado no aparelho: toque numa animação para vê-la.' : 'O retrato está "vivo": respira, pisca e olha em volta.';
    if (peca.tipo === 'retrato' && !calmo) ligar('vivo');
  }

  // data-pivo="x y" vira transform-origin em unidades do viewBox
  function prepararPivos() {
    svg.querySelectorAll('[data-pivo]').forEach((g) => {
      const [x, y] = g.getAttribute('data-pivo').split(/\s+/).map(Number);
      g.style.transformOrigin = `${x}px ${y}px`;
    });
  }
  const el = (id) => svg && svg.querySelector('#' + id);
  function pivo(id, x, y) { const g = el(id); if (g) g.style.transformOrigin = `${x}px ${y}px`; return g; }

  // ---------- animações ----------
  const aleat = (a, b) => a + Math.random() * (b - a);
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  function piscar() {
    ['olho-esq', 'olho-dir'].forEach((id) => {
      const g = el(id); if (!g) return;
      const [x, y] = g.getAttribute('data-pivo').split(' ').map(Number);
      g.style.transformOrigin = `${x}px ${y + 3}px`;
      g.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)', offset: 0.45 }, { transform: 'scaleY(.08)', offset: 0.6 }, { transform: 'scaleY(1)' }], { duration: 190, easing: 'ease-in-out' });
    });
  }
  function olhar(dx, ms = 260) {
    ['iris-esq', 'iris-dir'].forEach((id) => {
      const g = el(id); if (!g) return;
      const atual = g.dataset.x || '0';
      g.animate([{ transform: `translateX(${atual}px)` }, { transform: `translateX(${dx}px)` }], { duration: ms, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
      g.dataset.x = String(dx);
    });
  }
  function respirar() {
    const a = [];
    const c = el('corpo'), h = el('cabeca');
    if (c) a.push(c.animate([{ transform: 'translateY(0) scaleY(1)' }, { transform: 'translateY(-2px) scaleY(1.006)' }, { transform: 'translateY(0) scaleY(1)' }], { duration: 4200, iterations: Infinity, easing: 'ease-in-out' }));
    if (h) a.push(h.animate([{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-3px) rotate(-.4deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 4200, iterations: Infinity, easing: 'ease-in-out' }));
    return a;
  }
  async function falar(ms = 2200) {
    const boca = el('boca-interior'), lab = el('labio-inf');
    if (!boca || !lab) return;
    boca.style.transformOrigin = '300px 423px'; lab.style.transformOrigin = '300px 425px';
    const fim = Date.now() + ms;
    while (Date.now() < fim && peca && peca.tipo === 'retrato') {
      const ab = aleat(0.35, 1), d = aleat(110, 190);
      boca.animate([{ transform: 'scaleY(0)' }, { transform: `scaleY(${ab})` }, { transform: 'scaleY(0)' }], { duration: d * 2, easing: 'ease-in-out' });
      lab.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${(ab * 6).toFixed(1)}px)` }, { transform: 'translateY(0)' }], { duration: d * 2, easing: 'ease-in-out' });
      await esperar(d * 2 + aleat(0, 90));
    }
  }
  function franzir(ligado) {
    const e = el('sobrancelha-esq'), d = el('sobrancelha-dir');
    const op = { duration: 220, easing: 'ease-out', fill: 'forwards' };
    if (e) e.animate([{ transform: ligado ? 'none' : 'translateY(4px) rotate(5deg)' }, { transform: ligado ? 'translateY(4px) rotate(5deg)' : 'none' }], op);
    if (d) d.animate([{ transform: ligado ? 'none' : 'translateY(4px) rotate(-5deg)' }, { transform: ligado ? 'translateY(4px) rotate(-5deg)' : 'none' }], op);
  }
  function brilho() {
    const g = el('coroa-reflexo'); if (!g) return;
    g.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: 'translateX(150px)' }], { duration: 900, easing: 'ease-in-out' });
  }
  function vela() {
    const g = el('luz-vela'); if (!g) return [];
    const k = Array.from({ length: 12 }, (_, i) => ({ opacity: i % 2 ? aleat(0.55, 0.8) : aleat(0.9, 1) }));
    return [g.animate(k, { duration: 2600, iterations: Infinity, easing: 'ease-in-out' })];
  }

  // laço "vivo": respira e, de vez em quando, pisca ou olha
  function vivo() {
    const anims = respirar();
    let ativo = true;
    (async () => {
      while (ativo) {
        await esperar(aleat(1800, 4200));
        if (!ativo) break;
        const s = Math.random();
        if (s < 0.6) { piscar(); if (Math.random() < 0.2) { await esperar(240); piscar(); } }
        else if (s < 0.85) { olhar(aleat(-5, 5)); await esperar(aleat(900, 1600)); if (ativo) olhar(0); }
        else brilho();
      }
    })();
    return { parar() { ativo = false; anims.forEach((a) => a.cancel()); olhar(0, 1); } };
  }

  const ANIM_RETRATO = [
    { id: 'vivo', nome: 'Vivo', sub: 'respira, pisca e olha', laco: () => vivo() },
    { id: 'respirar', nome: 'Respirar', sub: 'corpo e cabeça', laco: () => { const a = respirar(); return { parar: () => a.forEach((x) => x.cancel()) }; } },
    { id: 'piscar', nome: 'Piscar', sub: 'olho-esq e olho-dir', uma: piscar },
    { id: 'olhar', nome: 'Olhar em volta', sub: 'iris-esq e iris-dir', uma: async () => { olhar(-6); await esperar(800); olhar(6); await esperar(800); olhar(0); } },
    { id: 'falar', nome: 'Falar', sub: 'boca e lábio de baixo', uma: () => falar() },
    { id: 'franzir', nome: 'Franzir a testa', sub: 'sobrancelhas', laco: () => { franzir(true); return { parar: () => franzir(false) }; } },
    { id: 'brilho', nome: 'Brilho da coroa', sub: 'coroa-reflexo', uma: brilho },
    { id: 'vela', nome: 'Chama da vela', sub: 'luz-vela', laco: () => { const a = vela(); return { parar: () => a.forEach((x) => x.cancel()) }; } },
  ];
  const ANIM_PARALLAX = [
    { id: 'passeio', nome: 'Passeio', sub: 'move sozinho', laco: () => passeio() },
    { id: 'giro', nome: 'Inclinar o celular', sub: 'usa o giroscópio', laco: () => giroscopio() },
  ];

  function lista() { return peca.tipo === 'parallax' ? ANIM_PARALLAX : ANIM_RETRATO; }
  function montarAnimacoes() {
    const box = $('#anims'); box.innerHTML = '';
    for (const a of lista()) {
      const b = document.createElement('button');
      b.dataset.anim = a.id;
      if (a.laco) b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<b>${a.nome}</b><span>${a.sub}${a.laco ? ' · liga e desliga' : ''}</span>`;
      b.addEventListener('click', () => (a.laco ? (laços.find((l) => l.id === a.id) ? desligar(a.id) : ligar(a.id)) : a.uma()));
      box.appendChild(b);
    }
  }
  function ligar(id) {
    const a = lista().find((x) => x.id === id); if (!a || !a.laco) return;
    // "vivo" e "respirar" mexem nos mesmos grupos: um desliga o outro
    if (id === 'vivo') desligar('respirar'); if (id === 'respirar') desligar('vivo');
    if (id === 'passeio') desligar('giro'); if (id === 'giro') desligar('passeio');
    const h = a.laco(); if (!h) return;
    laços.push({ id, h });
    const b = document.querySelector(`[data-anim="${id}"]`); if (b) b.setAttribute('aria-pressed', 'true');
  }
  function desligar(id) {
    const i = laços.findIndex((l) => l.id === id); if (i < 0) return;
    laços[i].h.parar(); laços.splice(i, 1);
    const b = document.querySelector(`[data-anim="${id}"]`); if (b) b.setAttribute('aria-pressed', 'false');
  }
  function pararTudo() {
    [...laços].forEach((l) => desligar(l.id));
    if (svg) svg.getAnimations ? svg.getAnimations({ subtree: true }).forEach((a) => a.cancel()) : null;
    if (parallax) { parallax.parar(); parallax = null; }
  }
  $('#parar').addEventListener('click', () => { pararTudo(); if (peca && peca.tipo === 'parallax') iniciarParallax(); });

  // ---------- parallax ----------
  function iniciarParallax() {
    const camadas = [...svg.querySelectorAll('[data-profundidade]')].map((g) => ({ g, d: +g.getAttribute('data-profundidade') }));
    const sobra = 80; // unidades de viewBox que cada camada pode andar no máximo
    const st = { alvo: [0, 0], atual: [0, 0], vivo: true, fonte: 'dedo' };
    const passo = () => {
      if (!st.vivo) return;
      st.atual[0] += (st.alvo[0] - st.atual[0]) * 0.12;
      st.atual[1] += (st.alvo[1] - st.atual[1]) * 0.12;
      for (const { g, d } of camadas) g.style.transform = `translate(${(-st.atual[0] * sobra * d).toFixed(2)}px, ${(-st.atual[1] * 24 * d).toFixed(2)}px)`;
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
    const mover = (e) => {
      if (st.fonte !== 'dedo') return;
      const r = palco.getBoundingClientRect();
      st.alvo = [Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)), Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))];
    };
    const soltar = () => { if (st.fonte === 'dedo') st.alvo = [0, 0]; };
    palco.addEventListener('pointermove', mover); palco.addEventListener('pointerdown', mover);
    palco.addEventListener('pointerup', soltar); palco.addEventListener('pointercancel', soltar); palco.addEventListener('pointerleave', soltar);
    parallax = {
      st,
      parar() {
        st.vivo = false;
        palco.removeEventListener('pointermove', mover); palco.removeEventListener('pointerdown', mover);
        palco.removeEventListener('pointerup', soltar); palco.removeEventListener('pointercancel', soltar); palco.removeEventListener('pointerleave', soltar);
        camadas.forEach(({ g }) => (g.style.transform = ''));
      },
    };
  }
  function passeio() {
    if (!parallax) return null;
    const st = parallax.st; st.fonte = 'passeio';
    let vivo = true; const t0 = performance.now();
    const passo = (t) => { if (!vivo) return; const s = (t - t0) / 1000; st.alvo = [Math.sin(s * 0.7) * 0.9, Math.sin(s * 0.45) * 0.3]; requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
    return { parar() { vivo = false; st.fonte = 'dedo'; st.alvo = [0, 0]; } };
  }
  function giroscopio() {
    if (!parallax) return null;
    const st = parallax.st;
    const ouvir = (e) => { if (e.gamma == null) return; st.alvo = [Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 25))]; };
    const comecar = () => { st.fonte = 'giro'; window.addEventListener('deviceorientation', ouvir); dica.textContent = 'Incline o celular devagar.'; };
    const D = window.DeviceOrientationEvent;
    if (!D) { dica.textContent = 'Este navegador não informa a inclinação do aparelho.'; return null; }
    if (typeof D.requestPermission === 'function') {
      D.requestPermission().then((r) => { if (r === 'granted') comecar(); else { dica.textContent = 'Sem permissão para o giroscópio. Use o dedo no quadro.'; desligar('giro'); } }).catch(() => { dica.textContent = 'O Safari não deixou usar o giroscópio.'; desligar('giro'); });
    } else comecar();
    return { parar() { window.removeEventListener('deviceorientation', ouvir); st.fonte = 'dedo'; st.alvo = [0, 0]; } };
  }

  // ---------- camadas ----------
  const OLHO = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const OLHO_F = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M10.6 5.6A10 10 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 3.9M6.2 7.2A17 17 0 0 0 2 12s3.6 6.5 10 6.5a9.6 9.6 0 0 0 4.2-.9"/></svg>';
  function montarCamadas() {
    const ul = $('#camadas'); ul.innerHTML = '';
    const gs = [...svg.querySelectorAll('g[id]')];
    $('#ncamadas').textContent = `${gs.length} grupos`;
    for (const g of gs) {
      let prof = 0, p = g.parentElement;
      while (p && p !== svg) { if (p.tagName === 'g' && p.id) prof++; p = p.parentElement; }
      const li = document.createElement('li');
      const info = g.getAttribute('data-profundidade') != null ? `profundidade ${g.getAttribute('data-profundidade')}` : g.getAttribute('data-pivo') ? `giro em ${g.getAttribute('data-pivo')}` : '';
      li.innerHTML = `<button class="nome" style="padding-left:${prof * 14}px">${g.id}${info ? ` <i>${info}</i>` : ''}</button><button class="olho" aria-label="Esconder ${g.id}">${OLHO}</button>`;
      li.querySelector('.nome').addEventListener('click', () => {
        g.animate([{ opacity: 1 }, { opacity: 0.1 }, { opacity: 1 }, { opacity: 0.1 }, { opacity: 1 }], { duration: 900 });
        dica.textContent = `#${g.id}`;
      });
      li.querySelector('.olho').addEventListener('click', (e) => {
        const oculto = g.style.display === 'none';
        g.style.display = oculto ? '' : 'none';
        li.classList.toggle('oculta', !oculto);
        e.currentTarget.innerHTML = oculto ? OLHO : OLHO_F;
        e.currentTarget.setAttribute('aria-label', `${oculto ? 'Esconder' : 'Mostrar'} ${g.id}`);
      });
      ul.appendChild(li);
    }
  }

  // ---------- ficha ----------
  function montarFicha(src, vb) {
    const kb = (new Blob([src]).size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    const linhas = [
      ['Arquivo', `assets/svg/${peca.arq}`],
      ['Tamanho', `${kb} KB`],
      ['viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`],
      ['Grupos', String(svg.querySelectorAll('g[id]').length)],
      ['Filtros', String(svg.querySelectorAll('filter').length)],
      ['Situação', svg.getAttribute('data-temporario') === 'sim' ? 'Temporário, até chegar a pintura' : 'PROPOSTA de estilo'],
    ];
    $('#ficha').innerHTML = linhas.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
  }

  // ---------- fundo do palco ----------
  document.querySelectorAll('[data-fundo]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-fundo]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    palco.className = `palco fundo-${b.dataset.fundo}`;
  }));

  // ---------- peças ----------
  const nav = $('#pecas');
  PECAS.forEach((p, i) => { const b = document.createElement('button'); b.textContent = p.nome; b.addEventListener('click', () => abrir(i)); nav.appendChild(b); });
  abrir(0);
})();
