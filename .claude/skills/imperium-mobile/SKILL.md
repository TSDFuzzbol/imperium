---
name: imperium-mobile
description: Use ao mexer na interface do IMPERIUM para celular — telas, navegação, toque, barras, folhas, acessibilidade, tamanhos de tela, PWA, offline, iOS Safari e o comportamento do relógio do jogo na tela.
---

# imperium-mobile

## Objetivo
Uma interface vertical, de toque, legível e rápida no iPhone, que comunique profundidade sem virar labirinto de menus.

## Quando usar
Qualquer mudança em `src/ui/`, `tools/build.ts` (PWA), service worker ou manifesto.

## Responsabilidades
- Estrutura de telas da Memória Mestra §12.2 (Salão, Reino, Crônica, Mesa): PROPOSTA em uso.
- Regra dos três toques (PROPOSTA): informação importante a no máximo 3 toques do Salão.
- Tela fixa, sem zoom e sem rolagem lateral (pedido do Tales).
- PWA instalável e funcionando offline.

## Procedimento
1. Antes: `npm run build && node tools/audit.cjs` para ter as capturas de referência em `out/audit/`.
2. Faça a mudança. Uma tela por módulo (ADR-0006).
3. Depois: build, `tools/audit.cjs`, `tools/playtest.cjs` com 3 sementes; olhe as capturas em 390×844 e em 360 px.
4. Passe `docs/design/POLIMENTO.md` item a item e relate com honestidade o que falhou.

## Critérios de qualidade (resumo do POLIMENTO)
- Alvos de toque ≥ 40×40 px; texto ≥ 13 px (corrido ≥ 16 px); contraste ≥ 4,5:1.
- Áreas seguras do iPhone (`env(safe-area-inset-*)`), sem nada sob o notch ou a barra.
- Animações < 300 ms e desligadas com `prefers-reduced-motion`.
- Nenhum "NaN", "undefined" ou "null" na tela; números no formato brasileiro.
- A simulação nunca trava a tela (se travar, ver `imperium-performance`).

## Limitações
Ainda não há teste visual no CI. Safari real não está disponível na nuvem: o Chromium com emulação de toque é aproximação; peça ao Tales para conferir no iPhone o que for sensível (barras, teclado, áreas seguras).

## Relação com outras skills
`imperium-visual-direction` (estética), `imperium-gameplay` (fluxos), `imperium-performance` (fluidez), `imperium-testing` (audit e playtest).

## Referências
`docs/design/POLIMENTO.md`, Memória Mestra §12, `src/ui/`, `tools/audit.cjs`, `tools/playtest.cjs`; diretrizes de interface humana da Apple para toque e áreas seguras; WCAG 2.2 (contraste, alvo mínimo).
