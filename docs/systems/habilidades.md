# Sistema: habilidades do soberano

- **Regras:** CONFIRMADO: os 12 nomes, chance mostrada só em %, 2d6 por baixo, 2 natural sempre falha e 12 sempre acerta (piso 3%, teto 97%), morte do soberano só em ocasiões raras e anunciadas. PROPOSTA: efeitos de cada teste, base por ofício, convicções, fadiga e abalo.
- **Código:** IMPLEMENTADO e TESTADO · `src/engine/skills.ts`
- **Fonte:** `docs/design/PROPOSTA_ATRIBUTOS_DO_SOBERANO.md`

## 1. Objetivo
O reino é governado por uma pessoa: quem o soberano é muda o que ele percebe e o que consegue.
## 2. Escopo
Dentro: 4 atributos e 12 habilidades (1 a 6), base pelo ofício e laço, 6 pontos livres na criação, vozes interiores nas audiências, testes ativos com efeito real e uma tentativa por audiência, Tinta e Pó reduzindo desvio na coleta. Fora: habilidades subindo com o uso, convicções, fadiga e abalo.
## 3. Dependências
Audiências (`reports.ts`), legitimidade (modificador pela aceitação do grupo), economia (Tinta e Pó).
## 4. Estados e dados
`Sovereign.skills`, `World.lastCheck`, `Dispatch.voices`, `Dispatch.tried`.
## 5. Regras
Chance = P(2d6 + habilidade + modificador ≥ dificuldade), com 2 e 12 naturais fixos. Modificador = aceitação do grupo ÷ 25, entre −3 e +3.
## 6. Entradas e saídas
Entrada: `runCheck`. Saída: mudança em aceitação, humor, moral ou memória; entrada na Crônica.
## 7. Interações
→ Legitimidade, população, guarnições; → economia (Tinta e Pó).
## 8. Critérios de aceitação
Mais habilidade nunca reduz a chance; nunca 0% nem 100%; determinístico pela semente (testados).
## 9. Testes
`tests/skills.test.ts`.
## 10. Lacunas
O documento de proposta ainda usa nomes antigos em parte do texto (PENDENCIAS C6).
