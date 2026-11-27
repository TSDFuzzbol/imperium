// Confere o jogo publicado num celular emulado (iPhone 13): carrega, sem erros, sem rolagem lateral.
// Uso: node tools/smoke.cjs https://tsdfuzzbol.github.io/imperium/
const { chromium, devices } = require('playwright');
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch();
  const c = await b.newContext({ ...devices['iPhone 13'] });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  let res;
  for (let i = 0; i < 6; i++) { res = await p.goto(url, { waitUntil: 'networkidle' }).catch(() => null); if (res && res.ok()) break; await p.waitForTimeout(10000); }
  await p.waitForTimeout(1500);
  const info = await p.evaluate(async () => ({
    title: document.title,
    sw: !!(await navigator.serviceWorker?.getRegistration()),
    overflow: document.documentElement.scrollWidth > innerWidth,
    text: document.body.innerText.slice(0, 120).replace(/\s+/g, ' '),
  }));
  const man = await p.request.get(new URL('manifest.webmanifest', url).href);
  await p.screenshot({ path: 'smoke.png' });
  console.log(JSON.stringify({ status: res && res.status(), manifest: man.status(), ...info, errs }));
  await b.close();
  const ok = res && res.ok() && man.ok() && info.title === 'Imperium' && !info.overflow && errs.length === 0;
  process.exit(ok ? 0 : 1);
})();
