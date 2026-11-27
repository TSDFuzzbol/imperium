---
name: imperium-testing
description: Use ao escrever, rodar ou interpretar testes do IMPERIUM — unidade, cadeias entre sistemas, determinismo, longa duração, cenários extremos, regressão, auditoria visual, teste do macaco e critérios de aceitação.
---

# imperium-testing

## Objetivo
Provar que a simulação é íntegra, reproduzível e causal, e que a interface funciona no celular. Testes guiam o trabalho, não enfeitam o PR.

## Quando usar
Em toda tarefa que muda código, e sempre que um resultado parecer estranho.

## Responsabilidades
- Manter as camadas de `docs/testing/ESTRATEGIA.md`.
- Registrar cada rodada relevante em `docs/testing/RESULTADOS.md`.
- Transformar todo bug corrigido num teste que falharia antes.

## Procedimento
1. Antes de mudar: `npm test` (deve estar verde; se não, registre).
2. Escreva o teste da cadeia esperada (use `reaches()` para verificar os Fios).
3. Implemente. Rode só os testes que falharam enquanto corrige (`npx tsx --test tests/arquivo.test.ts`).
4. Ao final: `npm run typecheck && npm test && npm run build`; para mudanças de simulação, `npx tsx tools/sementes.ts 30 10`; para interface, `node tools/audit.cjs` e `node tools/playtest.cjs <semente> 400` com 3 sementes.
5. Relate números reais no PR: quantos testes, quantos passaram, o que não foi rodado e por quê.

## Critérios de qualidade
- Sementes fixas; nada depende de hora ou máquina.
- Invariantes técnicos sempre; faixas de valores de jogo só depois de aprovadas pelo Tales.
- Teste rápido: a suíte inteira em menos de ~10 s no CI.

## Limitações (regras duras)
- **Nunca** apague, pule ou afrouxe um teste para passar.
- **Nunca** invente regra de jogo para um teste passar.
- Problema que depende de design vira `test.todo` com referência a `docs/development/PENDENCIAS.md`.

## Relação com outras skills
Todas. Em especial `imperium-simulation` (cadeias), `imperium-performance` (orçamentos) e `imperium-code-review` (cobertura do que mudou).

## Referências
`docs/testing/ESTRATEGIA.md`, `docs/testing/RESULTADOS.md`, `tests/`, `tools/sementes.ts`, `tools/audit.cjs`, `tools/playtest.cjs`; `node:test` e `node:assert/strict`; Playwright (já instalado na nuvem; não rodar `playwright install`).
