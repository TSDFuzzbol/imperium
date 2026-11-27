// Auditoria de polimento: percorre todas as telas num celular e checa toque, letra, contraste e transbordo.
// Uso: node tools/audit.cjs [largura]   (padrão 390). Saída: out/audit/*.png e um relatório no console.
const { chromium } = require('playwright');
const fs = require('fs');
const W = Number(process.argv[2] || 390), H = 844;
const OUT = 'out/audit';
fs.mkdirSync(OUT, { recursive: true });

const CHECK = (W) => {
  const lum = (c) => {
    const m = c.match(/[\d.]+/g); if (!m) return null;
    const [r, g, b, a = 1] = m.map(Number);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return { L: 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b), a };
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url')) return null; // gradiente: não dá pra medir
      const l = lum(cs.backgroundColor);
      if (l && l.a > 0.9) return l.L;
    }
    return lum('rgb(22,17,13)').L;
  };
  const key = (el) => (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (el.dataset.a ? `[${el.dataset.a}]` : ''));
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const res = { small: {}, tap: {}, contrast: {}, overflow: {}, words: [] };
  // letra pequena e contraste: elementos com texto próprio
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || !vis(el)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!own) continue;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs < 13) (res.small[key(el)] ??= { px: fs, ex: own.slice(0, 30) });
    const fg = lum(cs.color), bg = bgOf(el);
    if (fg && bg !== null) {
      const ratio = (Math.max(fg.L, bg) + 0.05) / (Math.min(fg.L, bg) + 0.05);
      const big = fs >= 24 || (fs >= 18.5 && Number(cs.fontWeight) >= 600);
      if (ratio < (big ? 3 : 4.5)) (res.contrast[key(el)] ??= { ratio: ratio.toFixed(2), ex: own.slice(0, 30) });
    }
    if (/\b(NaN|undefined|null|Infinity)\b/.test(own)) res.words.push(own.slice(0, 60));
  }
  // alvos de toque
  for (const el of document.querySelectorAll('button, [data-a], input, select, textarea, summary, a')) {
    if (el.closest('svg') || !vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) (res.tap[key(el)] ??= { w: Math.round(r.width), h: Math.round(r.height) });
  }
  // transbordo
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || el.closest('.tbl') || el.closest('.layers') || !vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > W + 1 || r.left < -1) (res.overflow[key(el)] ??= { left: Math.round(r.left), right: Math.round(r.right) });
  }
  res.pageW = document.documentElement.scrollWidth;
  return res;
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: Number(process.env.DPR || 1) });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const html = fs.readFileSync('dist/imperium.html', 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">' + html + '</body></html>');
  await p.waitForTimeout(1200);
  const report = {};
  const shot = async (name, scrollTo) => {
    if (scrollTo !== undefined) await p.evaluate((y) => { const m = document.querySelector('#main'); if (m) m.scrollTop = y; }, scrollTo);
    await p.waitForTimeout(450);
    await p.screenshot({ path: `${OUT}/${W}-${name}.png` });
    report[name] = await p.evaluate(CHECK, W);
  };
  const click = (sel) => p.evaluate((s) => document.querySelector(s)?.dispatchEvent(new MouseEvent('click', { bubbles: true })), sel);

  await shot('01-intro');
  for (let i = 1; i <= 5; i++) { await click('[data-a=crnext]'); if (i === 4) { for (const k of ['lingua', 'lingua', 'peso', 'encanto', 'faro', 'vela']) await click(`[data-a=skill][data-v=${k}][data-d="+"]`); } await shot(`0${i + 1}-criacao-${i}`, 0); }
  await shot('06b-criacao-baixo', 2000);
  await click('[data-a=crstart]');
  await shot('07-tutorial');
  await click('summary'); await click('[data-a=closehelp]');
  await shot('08-salao', 0);
  await shot('09-salao-meio', 700);
  await shot('10-salao-fim', 5000);
  await p.evaluate(() => document.querySelector('.sk-card summary')?.click());
  await shot('10b-salao-habilidades', 0);
  await click('.opt.check'); await p.waitForTimeout(300); await shot('10c-teste-rolando');
  await p.waitForTimeout(1200); await shot('10d-teste-resultado');
  await click('[data-a=closecheck]');
  await click('[data-a=view][data-v=reino]'); await shot('11-reino', 0);
  await shot('12-reino-tabela', 2000);
  await click('[data-a=prov][data-v=dornhelm]'); await shot('13-provincia');
  await click('.sheet .row:not([disabled])'); await shot('14-fios');
  await click('.threads li.has'); await shot('15-fios-2');
  await click('[data-a=closefios]'); await click('[data-a=closeprov]');
  await click('[data-a=speed][data-v="3"]'); await p.waitForTimeout(5000); await click('[data-a=speed][data-v="0"]');
  await click('[data-a=view][data-v=cronica]'); await shot('16-cronica', 0);
  await click('[data-a=view][data-v=mesa]'); await shot('17-mesa', 0);
  await click('[data-a=verb][data-v=enviar_tropas]'); await shot('18-mesa-tropas', 0);
  await shot('19-mesa-tesouro', 900);
  await shot('20-mesa-jogo', 5000);
  await click('[data-a=view][data-v=salao]'); await shot('21-salao-depois', 0);

  // resumo agrupado
  const agg = { small: {}, tap: {}, contrast: {}, overflow: {}, words: new Set(), pageW: new Set() };
  for (const [name, r] of Object.entries(report)) {
    for (const k of ['small', 'tap', 'contrast', 'overflow']) for (const [sel, v] of Object.entries(r[k])) (agg[k][sel] ??= { ...v, telas: [] }).telas.push(name.slice(0, 2));
    r.words.forEach((x) => agg.words.add(x));
    agg.pageW.add(r.pageW);
  }
  const out = { largura: W, erros: errs, larguraDaPagina: [...agg.pageW], textoQuebrado: [...agg.words], letraPequena: agg.small, toquePequeno: agg.tap, contrasteBaixo: agg.contrast, transbordo: agg.overflow };
  fs.writeFileSync(`${OUT}/relatorio-${W}.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
