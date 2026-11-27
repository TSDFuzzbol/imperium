# Sistema: os Fios e a Crônica

- **Regras:** PROPOSTA (Memória Mestra §12.3, pilar 3)
- **Código:** IMPLEMENTADO e TESTADO · `src/engine/core.ts` (`fact`, `latest`, `pruneFacts`, `chron`, `remember`, `decayMemory`)
- **Decisão técnica:** ADR-0004

## 1. Objetivo
Responder "por que isso aconteceu?" com a cadeia real de causas, para a emergência não parecer aleatoriedade.
## 2. Escopo
Dentro: fatos com fatores e referências; índice do fato mais recente por chave; poda mensal; Crônica (até 400 entradas); memórias que se apagam com o tempo. Fora: Fios filtrados pelo que o rei sabe (informação imperfeita nos Fios).
## 3. Dependências
Nenhuma. Todos os sistemas dependem dele.
## 4. Estados e dados
`World.facts`, `World.factIndex`, `World.seq`, `World.chronicle`; `Grievance[]` em províncias e grupos.
## 5. Regras
- Um fato guarda valor, unidade, fonte e fatores; fatores com valor quase zero e sem referência são descartados.
- A poda mantém o que é alcançável a partir do índice, das 160 últimas entradas da Crônica, dos despachos, relatórios e memórias.
- Memória: cada lembrança perde `decay` do peso por mês e some abaixo de 0,5.
## 6. Entradas e saídas
Chamados por todos os sistemas; lidos pela tela de Fios.
## 7. Interações
Todos.
## 8. Critérios de aceitação
- Nenhum fio aponta para fato podado (testado por 10 anos).
- Uma cadeia decreto → efeito é alcançável pelos Fios (testado: imposto → humor → inquietação).
- **Não cumprido ainda:** tamanho limitado. Hoje cresce ~1.000 fatos (~500 KB) por ano de jogo.
## 9. Testes
`tests/engine.test.ts` (`reaches`), `tests/longrun.test.ts` (`checkThreads`).
## 10. Lacunas
Orçamento de tamanho (etapa E1); Fios com "rumor" e "desconhecido" segundo a informação do rei.
