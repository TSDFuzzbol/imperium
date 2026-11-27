// Teste do macaco: joga o build em tela de celular com cliques e barras aleatórios.
// Uso: node tools/playtest.cjs [semente] [ações]
const { chromium } = require('playwright');
const fs = require('fs');
const seed = Number(process.argv[2] || 1), N = Number(process.argv[3] || 500);
let r = seed;
const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
const SKIP = ['newgame', 'import', 'doimport', 'export'];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = new Set(), issues = new Set();
  p.on('pageerror', (e) => errs.add(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_/.test(m.text())) errs.add(m.text()); });
  const html = fs.readFileSync('dist/imperium.html', 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">' + html + '</body></html>');
  await p.waitForTimeout(600);
  for (let step = 0; step < 8 && !(await p.$('[data-a=crstart]')); step++) {
    const opts = await p.$$('[data-a=cr],[data-a=crlook],[data-a=crtrait],[data-a=crscar],[data-a=skill]:not([disabled])');
    for (let i = 0; i < 8 && opts.length; i++) await opts[Math.floor(rnd() * opts.length)].click().catch(() => {});
    await p.click('[data-a=crnext]');
  }
  await p.fill('#cr-name', 'Teste ' + seed).catch(() => {});
  await p.click('[data-a=crstart]');
  await p.waitForTimeout(200);
  const counts = {};
  for (let i = 0; i < N; i++) {
    const roll = rnd();
    if (roll < 0.12) {
      await p.evaluate(() => document.querySelector('[data-a=speed][data-v="3"]')?.click());
      await p.waitForTimeout(400 + rnd() * 1200);
      await p.evaluate(() => document.querySelector('[data-a=speed][data-v="0"]')?.click());
    } else if (roll < 0.2) {
      const rs = await p.$$('input[type=range]');
      if (rs.length) {
        const e = rs[Math.floor(rnd() * rs.length)];
        await e.evaluate((el, f) => {
          el.value = String(Number(el.min) + (Number(el.max) - Number(el.min)) * f);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, rnd()).catch(() => {});
      }
    } else {
      const vis = await p.evaluate((skip) => {
        const out = [];
        document.querySelectorAll('[data-a]').forEach((el, idx) => {
          if (el.disabled || skip.includes(el.dataset.a)) return;
          const bb = el.getBoundingClientRect();
          if (bb.width > 0 && bb.height > 0 && bb.top >= 0 && bb.bottom <= 844) {
            const top = document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2);
            if (top && (top === el || el.contains(top) || top.closest('[data-a]') === el)) out.push(idx);
          }
        });
        return out;
      }, SKIP);
      if (vis.length) {
        const idx = vis[Math.floor(rnd() * vis.length)];
        const a = await p.evaluate((k) => {
          const el = document.querySelectorAll('[data-a]')[k];
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return el.dataset.a;
        }, idx);
        counts[a] = (counts[a] || 0) + 1;
      }
    }
    if (i % 25 === 0) {
      const chk = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, txt: document.body.innerText }));
      if (chk.sw > 391) issues.add('rolagem lateral ' + chk.sw);
      for (const bad of ['NaN', 'undefined', 'null', 'Infinity']) if (new RegExp('\\b' + bad + '\\b').test(chk.txt)) issues.add('texto com ' + bad);
    }
  }
  const st = await p.evaluate(() => (document.querySelector('.hdr-date')?.innerText || '') + ' | ' + (document.querySelector('.hdr-res')?.innerText || '').replace(/\n/g, ' '));
  await p.screenshot({ path: 'out/playtest-' + seed + '.png' });
  console.log(JSON.stringify({ seed, estado: st, erros: [...errs], problemas: [...issues], cliques: counts }));
  await b.close();
})();
