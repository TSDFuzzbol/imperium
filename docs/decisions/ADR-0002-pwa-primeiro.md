# ADR-0002: PWA primeiro

- **Estado:** CONFIRMADO (D5, 26/11/2026)

## Contexto
O conteúdo adulto confirmado (Memória Mestra §7) limita App Store e Google Play. O responsável usa iPhone.

## Decisão
O jogo é distribuído como PWA (site instalável) no GitHub Pages. Lojas talvez depois, embrulhando a mesma PWA (Capacitor é o caminho sugerido) com conteúdo desligável.

## Consequências
- `tools/build.ts` gera `dist/pwa` (manifest, ícone, service worker de rede primeiro) e `dist/imperium.html` (arquivo único para o artifact do claude.ai).
- Pendente: fontes do Google Fonts não ficam offline; empacotar as fontes no build.
- Risco: o Safari pode apagar dados de sites pouco usados. Exportar o save é a proteção.
