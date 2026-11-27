---
name: imperium-code-review
description: Use para revisar mudanças no IMPERIUM (um PR, uma branch ou o diff atual) em busca de bugs, quebra de determinismo, Fios soltos, regras de design alteradas em silêncio, riscos de arquitetura e implementações frágeis.
---

# imperium-code-review

## Objetivo
Pegar o que os testes não pegam, antes do Tales fazer o merge pelo celular.

## Quando usar
Antes de marcar um PR como pronto; quando o Tales pedir revisão; depois de mudanças grandes em `src/engine/`.

## Procedimento
1. Leia o diff inteiro (`git diff origin/main...HEAD`) e a descrição do PR.
2. Passe a lista abaixo. Para cada achado, mostre o cenário concreto que quebra (entrada → resultado errado).
3. Rode `npm run typecheck && npm test`; se mexeu na simulação, `npx tsx tools/sementes.ts 10 10` e compare com `docs/testing/RESULTADOS.md`.
4. Classifique: **grave** (bug ou regra quebrada), **pré-existente** (já estava lá), **detalhe**.
5. Relate no PR em português, com o rodapé exigido pelo `CLAUDE.md` quando comentar no GitHub.

## Lista de verificação
**Determinismo e estado**
- [ ] Nada de `Math.random`, `Date.now`, `new Date`, DOM ou armazenamento em `src/engine/`.
- [ ] Iteração sobre listas fixas; nada depende da ordem de inserção de objetos criados dinamicamente.
- [ ] Todo estado novo está no `World` e é serializável.
**Integridade da simulação**
- [ ] Subtrações limitadas (sem população, estoque, soldados ou dinheiro negativos).
- [ ] Divisões protegidas contra zero; sem NaN propagando.
- [ ] Valores em faixa (humor e aceitação em [-100, 100], frações em [0, 1]).
- [ ] Todo valor visível tem fato com causas; `ref` aponta para fato que existe.
- [ ] Nenhuma grandeza cresce sem limite sem motivo de design.
**Design**
- [ ] Nenhuma regra CONFIRMADA mudou em silêncio; constantes novas comentadas como PROPOSTA.
- [ ] Nada de barra que encerra o jogo, timer de legitimidade ou dado na tela (regras do Tales).
**Arquitetura**
- [ ] Regras de dependência de `docs/architecture/VISAO_GERAL.md` §3.
- [ ] A interface não escreve no `World` direto.
**Testes e docs**
- [ ] Mudança de comportamento tem teste; bug corrigido tem teste de regressão.
- [ ] Nenhum teste apagado, pulado ou afrouxado.
- [ ] Docs atualizadas conforme `imperium-documentation`.

## Critérios de qualidade
Achados concretos e verificáveis; sem lista de gosto pessoal. Poucos achados certos valem mais que muitos duvidosos.

## Limitações
Não aprova nem faz merge: isso é do Tales. Não reescreve o PR de outra pessoa; sugere.

## Relação com outras skills
Aplica as regras de todas as outras; usa `imperium-testing` para confirmar achados.

## Referências
`CLAUDE.md` §5, `docs/architecture/VISAO_GERAL.md`, `docs/testing/ESTRATEGIA.md`, agente `.claude/agents/imperium-revisor.md`.
