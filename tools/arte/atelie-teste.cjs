// Testa o ateliê num celular de 390x844 com toque: erros, rolagem lateral, alvos de toque, animações e camadas.
// uso: npm run build && node tools/arte/atelie-teste.cjs [pasta-de-saida]
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const out = process.argv[2] || 'out/atelie';
fs.mkdirSync(out, { recursive: true });
const raiz = path.resolve('dist/pwa');
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  const p = path.join(raiz, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': tipos[path.extname(p)] || 'application/octet-stream' }); r.end(b); });
}).listen(0);
const falhas = [];
const checar = (ok, msg) => { if (!ok) falhas.push(msg); console.log(ok ? 'ok  ' : 'FALHA', msg); };
(async () => {
  const b = await chromium.launch();
  for (const [rotulo, url] of [['site', `http://localhost:${srv.address().port}/atelie/`], ['arquivo-unico', 'file://' + path.resolve('dist/atelie.html')]]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: rotulo === 'site' ? 2 : 1 });
    const p = await ctx.newPage();
    const erros = []; p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/fonts\.g/.test(m.text()) && erros.push(m.text()));
    await p.goto(url); await p.waitForSelector('#palco svg'); await p.waitForTimeout(800);
    checar(!erros.length, `${rotulo}: sem erros no console ${erros.join(' | ')}`);
    const lat = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    checar(lat <= 0, `${rotulo}: sem rolagem lateral (${lat}px)`);
    const pequenos = await p.evaluate(() => [...document.querySelectorAll('button')].filter((x) => { const r = x.getBoundingClientRect(); return r.width && (r.height < 40 || r.width < 40); }).map((x) => x.textContent.trim().slice(0, 20)));
    checar(!pequenos.length, `${rotulo}: alvos de toque com 40px ou mais ${pequenos.join(', ')}`);
    const anims = await p.evaluate(() => document.querySelector('#palco svg').getAnimations({ subtree: true }).length);
    checar(anims === 0, `${rotulo}: retrato estático, sem animação (${anims})`);
    await p.screenshot({ path: `${out}/${rotulo}-1-retrato.png` });
    await p.locator('#palco').screenshot({ path: `${out}/${rotulo}-2-retrato-palco.png` });
    // esconder a coroa
    const idx = await p.evaluate(() => [...document.querySelectorAll('#camadas li')].findIndex((li) => li.textContent.startsWith('coroa ') || li.textContent.trim() === 'coroa' || li.querySelector('.nome').firstChild.textContent.trim() === 'coroa'));
    await p.locator('#camadas li').nth(idx).locator('.olho').tap();
    const escondida = await p.evaluate(() => document.querySelector('#palco #coroa').style.display === 'none');
    checar(escondida, `${rotulo}: esconder a camada "coroa" funciona`);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/${rotulo}-3-camadas.png`, fullPage: false });
    // parallax
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.locator('#pecas button').nth(1).click(); await p.waitForSelector('#palco #camada-frente'); await p.waitForTimeout(300);
    const box = await p.locator('#palco').boundingBox();
    await p.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5); await p.waitForTimeout(700);
    const desloc = await p.evaluate(() => getComputedStyle(document.querySelector('#camada-frente')).transform);
    checar(desloc !== 'none', `${rotulo}: parallax move a camada da frente (${desloc})`);
    await p.screenshot({ path: `${out}/${rotulo}-4-parallax.png` });
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log(falhas.length ? `\n${falhas.length} falha(s).` : '\nTudo certo.');
  process.exit(falhas.length ? 1 : 0);
})();
