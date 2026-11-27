# Sistema: tempo e ciclo

- **Regras:** CONFIRMADO (D4: dias corridos, pausa, 3 velocidades, ciclos mensais). Calendário de 12 meses de 30 dias e início em 12/03/1427: PROPOSTA.
- **Código:** IMPLEMENTADO e TESTADO · `src/engine/sim.ts`, `src/engine/core.ts`, relógio da tela em `src/ui/app.ts`
- **Fonte:** Memória Mestra §13.2; ESPEC_FUNDACAO §1 e §3

## 1. Objetivo
Fazer o mundo andar sozinho, com o dia a dia vivo e o custo baixo dos ciclos mensais.
## 2. Escopo
Dentro: avanço de dia, fechamento de mês, ordem dos sistemas, pausa automática. Fora: estações com clima próprio (só a chuva mensal existe), ciclos mais longos para Estados estrangeiros.
## 3. Dependências
Todos os sistemas do ciclo mensal.
## 4. Estados e dados
`World.day` (dias desde o início), `World.pauseRequest`. Datas calculadas por `dateOf`.
## 5. Regras
`stepDay`: ordens que chegaram → relatórios que chegaram → audiências vencidas → (último dia do mês) ciclo mensal na ordem fixa de `monthly()` → dia + 1.
A interface roda 1 dia a cada 700, 220 ou 60 ms e para quando `pauseRequest` é preenchido (se a pausa automática estiver ligada).
## 6. Entradas e saídas
Entrada: o `World`. Saída: o `World` mutado; `true` se fechou um mês.
## 7. Interações
É o maestro: define a ordem e, portanto, as dependências implícitas entre sistemas.
## 8. Critérios de aceitação
Determinismo; um ano de jogo em menos de 1 s em servidor; nada de NaN ou negativo em 10 anos.
## 9. Testes
`tests/engine.test.ts` (determinismo, ordens viajam), `tests/longrun.test.ts` (10 anos, orçamento de tempo).
## 10. Lacunas
Pessoas e agenda "por dia" (§13.2) ainda não existem, porque não há personagens. Estados estrangeiros em ciclos próprios: PENDENTE.
