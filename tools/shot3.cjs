const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(e.stack));
  const html = require('fs').readFileSync('dist/imperium.html', 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">' + html + '</body></html>');
  await p.waitForTimeout(1200);
  for (let i = 0; i < 4; i++) await p.click('[data-a=crnext]');
  await p.click('[data-a=crstart]'); await p.waitForTimeout(400);
  await p.click('summary >> text=Os Fios'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/10-help.png' });
  await p.click('[data-a=closehelp]');
  await p.click('[data-a=speed][data-v="2"]'); await p.waitForTimeout(1500);
  await p.click('.help-b'); await p.click('summary >> text=Tesouro'); await p.waitForTimeout(1500);
  console.log('still open:', await p.$$eval('details[open]', d => d.length), 'speed paused:', await p.$eval('.speed .on', e => e.dataset.v));
  console.log('errors', errs);
  await b.close();
})();
