// Empacota o jogo num único HTML (artifact) e numa pasta PWA (dist/pwa).
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const r = await build({ entryPoints: ['src/ui/main.ts'], bundle: true, minify: !process.env.DEV, format: 'iife', target: 'es2020', write: false, loader: { '.json': 'json' } });
const js = r.outputFiles[0].text;
const css = readFileSync('src/ui/style.css', 'utf8');
const page = (pwa: boolean) => `${pwa ? '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8">' : ''}
<title>Imperium</title>
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#16110d">
${pwa ? '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg">' : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Alegreya+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>${css}</style>${pwa ? '</head><body>' : ''}
<div id="app"><header id="hdr"></header><main id="main"></main><nav id="nav" aria-label="Telas"></nav><div id="over"></div></div>
<script>${js.replace(/<\/script/g, '<\\/script')}</script>
${pwa ? `<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});</script>` : ''}
${pwa ? '</body></html>' : ''}`;
mkdirSync('dist/pwa', { recursive: true });
writeFileSync('dist/imperium.html', page(false));
writeFileSync('dist/pwa/index.html', page(true));
writeFileSync('dist/pwa/manifest.webmanifest', JSON.stringify({ name: 'Imperium', short_name: 'Imperium', lang: 'pt-BR', start_url: '.', display: 'standalone', orientation: 'portrait', background_color: '#16110d', theme_color: '#16110d', icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, null, 1));
writeFileSync('dist/pwa/icon.svg', readFileSync('src/ui/icon.svg', 'utf8'));
// Service worker: rede primeiro (o jogador sempre recebe a versão nova), cache só quando estiver sem internet.
const swVersion = Date.now().toString(36);
writeFileSync('dist/pwa/sw.js', `const C='imperium-${swVersion}';self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon.svg'])));self.skipWaiting()});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});`);
console.log('imperium.html', (page(false).length / 1024).toFixed(0), 'KB');
