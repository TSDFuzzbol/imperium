const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack));
  const html = require('fs').readFileSync('dist/imperium.html', 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">' + html + '</body></html>');
  await p.waitForTimeout(1500);
  for (let i = 0; i < 4; i++) await p.click('[data-a=crnext]');
  // arrasta a idade
  const r = await p.$('#cr-age'); const bb = await r.boundingBox();
  await p.mouse.move(bb.x + 5, bb.y + bb.height / 2); await p.mouse.down();
  await p.mouse.move(bb.x + bb.width * 0.8, bb.y + bb.height / 2, { steps: 10 }); await p.mouse.up();
  console.log('age label:', await p.$eval('.cr-age b', e => e.textContent));
  await p.screenshot({ path: 'out/8-face.png' });
  await p.click('[data-a=crstart]'); await p.waitForTimeout(400); await p.click('[data-a=closehelp]');
  await p.screenshot({ path: 'out/9-salao.png' });
  await p.click('[data-a=view][data-v=mesa]');
  const q = await p.$('#d-rate'); const qb = await q.boundingBox();
  await p.mouse.move(qb.x + qb.width * 0.27, qb.y + qb.height / 2); await p.mouse.down();
  await p.mouse.move(qb.x + qb.width * 0.6, qb.y + qb.height / 2, { steps: 10 }); await p.mouse.up();
  console.log('rate:', await p.$eval('.sc-text', e => e.textContent));
  console.log('errors', errs);
  await b.close();
})();
