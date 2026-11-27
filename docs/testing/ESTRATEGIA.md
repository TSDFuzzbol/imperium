# Estratégia de testes

**27/11/2026.** O objetivo não é cobrir linhas: é provar que a simulação é íntegra, reproduzível e causal, e que a interface funciona num celular.

## 1. Camadas

| Camada | O que prova | Onde | Roda no CI |
|---|---|---|---|
| Unidade | Funções puras com regra clara (ex.: chance do 2d6 nunca é 0% nem 100%) | `tests/skills.test.ts` | Sim |
| Cadeia (integração entre sistemas) | Uma causa produz o efeito esperado através de vários sistemas, e os Fios mostram o caminho | `tests/engine.test.ts` (`cadeia: ...`) | Sim |
| Determinismo | Mesma semente + mesmas ordens = mesmo mundo; salvar e carregar no meio não muda o futuro | `tests/engine.test.ts`, `tests/longrun.test.ts` | Sim |
| Invariantes de longa duração | 10 anos, 3 sementes: nada NaN, negativo ou fora de faixa; nenhum Fio solto | `tests/longrun.test.ts` | Sim |
| Orçamento de desempenho | Um ano de jogo em menos de 1 s | `tests/longrun.test.ts` | Sim |
| Interface (visual) | Capturas de todas as telas em 390×844; toque ≥ 40 px, letra, contraste, transbordo | `tools/audit.cjs` | Não (manual na sessão) |
| Interface (macaco) | Cliques e barras aleatórios por meses de jogo; erros de console, NaN, rolagem lateral | `tools/playtest.cjs` | Não (manual na sessão) |
| Polimento | Lista humana de leitura, toque, layout, estados, texto, movimento | `docs/design/POLIMENTO.md` | Não |

## 2. Regras
1. **Testes de cadeia valem mais que testes de função.** Todo sistema novo entra com pelo menos uma cadeia que atravessa outro sistema e é verificada pelos Fios (`reaches()`).
2. **Testes técnicos não fixam design.** Invariantes (sem NaN, sem negativo, Fios íntegros) valem sempre. Faixas de valor de jogo (ex.: "o preço do pão fica entre X e Y") só entram depois de o Tales aprovar a calibração.
3. **Nunca** apagar, pular ou afrouxar um teste para passar. Se o teste revelar um problema de design, ele vira `test.todo` com link para a pendência, e o problema vai para `docs/development/PENDENCIAS.md`.
4. Todo bug corrigido ganha um teste que falharia antes da correção.
5. Sementes fixas sempre. Para investigar, reproduza com a mesma semente e siga os Fios (`tools/why.ts`).

## 3. Cenários extremos a cobrir (próximos)
- Imposto máximo em todas as províncias por 2 anos.
- Tesouro zerado e dívida máxima.
- Todas as casas em Conspiração.
- Revolta simultânea em 4 províncias.
- Guarnição de Rhovan zerada (já acontece sem intervenção, ver RESULTADOS).
- Save antigo carregado numa versão nova (depende da E1).

## 4. Integração contínua
`.github/workflows/ci.yml` roda em todo Pull Request e em push para branches `claude/**`: `npm ci` → `npm run typecheck` → `npm test` → `npm run build`. O workflow de publicação (`pages.yml`) repete os mesmos passos antes de publicar a `main`.

Próximo passo: rodar `tools/audit.cjs` e `tools/playtest.cjs` no CI com o Playwright instalado pelo workflow, guardando as capturas como artefato do PR, para o Tales ver pelo celular.
