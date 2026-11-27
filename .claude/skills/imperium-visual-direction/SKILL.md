---
name: imperium-visual-direction
description: Use ao criar ou revisar qualquer coisa visual do IMPERIUM — retratos, mapas, ícones, paleta, tipografia, componentes de interface, fundos e SVGs — para manter a identidade própria e o guia de arte.
---

# imperium-visual-direction

## Objetivo
Uma identidade visual própria e consistente: fantasia baixa, escura e pintada; pedra fria, luz de vela, acentos raros de ouro e vinho; rostos realistas e sérios. Muito visual, como o Tales pediu.

## Quando usar
Retratos (`src/ui/portrait.ts`), mapa (`src/ui/map.ts`), CSS (`src/ui/style.css`), ícones, SVGs em `assets/`, qualquer cor ou fonte nova.

## Responsabilidades
- Seguir `docs/design/ART_STYLE.md` (fonte da verdade da arte; PROPOSTA até o Tales aprovar) e a seção "Onde cada coisa fica" dela.
- Usar só cores da paleta do guia; cor nova entra primeiro no guia.
- Retratos em estilo pintado inspirado em Disco Elysium, mas originais: nada de copiar personagens, traços ou composições de outro jogo.
- Coordenar com a frente de arte (assets em `assets/svg/`, `assets/backgrounds/`, ateliê em `src/atelie/`, geradores em `tools/arte/`, quando existirem na `main`).

## Procedimento
1. Leia `docs/design/ART_STYLE.md` inteiro.
2. Esboce e gere a peça; renderize em tamanho de celular (deviceScaleFactor 2 para o Tales ver).
3. Compare com o guia: valor, temperatura, um acento por tela, sem contorno de cartum, sem preto e branco puros.
4. Se houver ateliê, confira a peça nele ao lado das outras.
5. Mostre ao Tales a captura antes de trocar algo que ele já viu e aprovou.

## Critérios de qualidade
- Paleta e regras de forma do guia respeitadas.
- Legível em 390 px; contraste de texto mantido.
- Peso: SVG enxuto; nenhuma imagem pesada sem necessidade (o jogo cabe em ~350 KB hoje).
- Originalidade: nada que lembre identificavelmente outro jogo.

## Limitações
Direção visual é design: mudanças grandes de estilo são PROPOSTA e precisam do ok do Tales. Não há geração de imagem por IA no pipeline; a arte é SVG por código.

## Relação com outras skills
`imperium-mobile` (legibilidade e toque), `imperium-performance` (peso dos SVGs e filtros), `imperium-gameplay` (o retrato reage ao humor).

## Referências
`docs/design/ART_STYLE.md`, Memória Mestra §12.1 e §12.5, `src/ui/portrait.ts`, `src/ui/style.css`.
