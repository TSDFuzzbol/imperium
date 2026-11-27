# Sistema: população, humor e ordem

- **Regras:** PROPOSTA · **Código:** IMPLEMENTADO · `src/engine/systems/people.ts`
- **Fonte:** Memória Mestra §6.3 (grupos de população, nível 2), ESPEC_FUNDACAO §4

## 1. Objetivo
Os 5 estratos de cada província (camponeses, artesãos, mercadores, clero, nobreza local) nascem, morrem, migram, sentem e lembram.
## 2. Escopo
Dentro: demografia, migração por estradas, humor por estrato com memória coletiva, inquietação com histerese (calma, tensa, motins, revolta). Fora: soldados como estrato, crença religiosa, personagens que "sobem" do povo (§6.3).
## 3. Dependências
Economia (fome, carência, preço do pão, renda), decretos (impostos, isenção, grão), legitimidade (agitadores e sermões viram memória), Karsk (saques).
## 4. Estados e dados
`strata.*.pop/humor`, `Province.grievances`, `unrest`, `unrestMonths`.
## 5. Regras
Humor mira um alvo feito de fome, medo do preço, impostos, memórias e decretos; inquietação sobe e desce com histerese. Números em ESPEC_FUNDACAO §4.
## 6. Entradas e saídas
Saída: humor, inquietação, fatos `humor:*`, `inquietacao:*`, `fome:*`, `pop:*`.
## 7. Interações
→ Economia (revolta corta produção e comércio); → Legitimidade (povo de cada província é um grupo); → Karsk (instabilidade que Karsk percebe).
## 8. Critérios de aceitação
Humor em [-100, 100]; população finita e não negativa; imposto alto → humor pior → inquietação, explicável pelos Fios (testado).
## 9. Testes
`tests/engine.test.ts`, `tests/longrun.test.ts`.
## 10. Lacunas
Crença, cultura, classes urbanas, personagens que emergem do povo.
