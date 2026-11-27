---
name: imperium-simulation
description: Use ao criar ou mudar sistemas de simulação do IMPERIUM — economia, população, legitimidade, instituições, agentes e personagens, Karsk e Estados, informação imperfeita, os Fios — ou ao investigar por que algo aconteceu numa partida.
---

# imperium-simulation

## Objetivo
Um mundo persistente, interdependente e causal: agentes com estado, interesses e informação própria, cujas decisões produzem consequências diretas, indiretas e atrasadas, sempre explicáveis pelos Fios.

## Quando usar
- Implementar ou alterar qualquer arquivo em `src/engine/systems/`, `decrees.ts`, `reports.ts`, `core.ts`.
- Adicionar entidades (personagens, instituições, Estados).
- Investigar um resultado estranho de uma semente.

## Responsabilidades
- Garantir que cada sistema lê e escreve estado usado por outros (nada decorativo).
- Registrar causas com `fact()` e referências (`ref`) para os fatos de origem.
- Preservar determinismo e serialização.
- Separar regra CONFIRMADA de número PROPOSTA, comentando cada constante.

## Procedimento
1. Leia a spec do sistema em `docs/systems/` e as seções citadas da Memória Mestra. Se a spec não tem as 10 partes, complete o que for técnico e liste o que falta de design em `docs/development/PENDENCIAS.md`. **Não invente regra de design para preencher lacuna.**
2. Escreva a cadeia que o sistema deve produzir (ex.: imposto → preço → humor → degrau de uma casa) e transforme-a num teste de cadeia antes de codar.
3. Implemente como função `(w: World, c?: Cycle) => void`, chamada da ordem fixa em `sim.ts`. Sorteios só com `w.rng`. Itere sobre listas fixas.
4. Todo valor que o jogador pode ver ganha um fato com fatores somando o valor (quando numérico) e `ref` para as causas.
5. Informação imperfeita: o que o rei vê passa por `reports.ts` (fonte, certeza, atraso, ruído). Agentes decidem pelo que acreditam, não pelo valor verdadeiro.
6. Rode `npm test` e `npx tsx tools/sementes.ts 30 10`; compare com `docs/testing/RESULTADOS.md` e explique diferenças.
7. Atualize a spec (seções 4, 5, 7, 8) e o mapa de ligações em `docs/systems/README.md`.

## Critérios de qualidade
- O novo sistema aparece em pelo menos uma cadeia testada que atravessa outro sistema.
- Nenhum Fio solto (teste de longa duração).
- Sem espiral sem freio: em 30 sementes × 10 anos, nenhuma grandeza cresce sem limite sem motivo de design.
- Agregação permitida (Memória Mestra §6.3), desde que a causalidade sobreviva.

## Limitações
Fórmulas, limiares e comportamento de agentes são PROPOSTA até o Tales aprovar. Não transformar PROPOSTA em CONFIRMADO. Não simplificar em silêncio um sistema complexo: diga o que ficou de fora.

## Relação com outras skills
`imperium-gameplay` (como o jogador age sobre o sistema), `imperium-testing` (cadeias e invariantes), `imperium-performance` (custo por mês), `imperium-architecture` (formato de dados).

## Referências
- `docs/systems/*.md`, `docs/design/ESPEC_FUNDACAO.md` (fórmulas atuais), Memória Mestra §4.4, §5, §6, §10.
- `src/engine/core.ts` (`fact`, `latest`, `remember`), `tools/why.ts`, `tools/sementes.ts`.
- Ideias de referência (estudar princípios, nunca copiar): modelos de agentes com crenças, desejos e intenções; utilidade com informação parcial; dinâmica de sistemas (estoques, fluxos, realimentação); histerese para evitar oscilação.
