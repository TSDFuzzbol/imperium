# ADR-0006: interface em módulos; biblioteca só se precisar

- **Estado:** PROPOSTA
- **Data:** 27/11/2026

## Contexto
`src/ui/app.ts` tem 765 linhas com telas, estado de tela, relógio, salvamento e criação de personagem. Personagens, Conselho e audiências vão multiplicar as telas.

## Opções
1. Continuar num arquivo só.
2. Dividir em `ui/screens/` (uma por tela) e `ui/components/`, mantendo o HTML em template strings e o `render()` atual.
3. Adotar Preact (cerca de 4 KB) com sinais.

## Decisão proposta
Opção 2 agora (etapa M0), sem mudar nada que o jogador vê, verificada com `tools/audit.cjs` antes e depois. Reavaliar a opção 3 quando entrarem personagens (M1), se o custo de atualizar telas à mão ficar alto.

## Consequências
- Salvamento sai da interface para `src/persistence/` (preparando a E1).
- Toda tela nova nasce como módulo próprio.
