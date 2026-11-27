# Estado da implementação

**Atualizado em 27/11/2026**, a partir do código da `main` (commit `66911ea`) e dos testes rodados nesta data.

Legenda em `CLAUDE.md` §4. "Regras" diz se as regras do sistema foram aprovadas pelo Tales; "Código" diz o que existe de verdade.

## Resumo honesto

Existe uma **fatia jogável da fase 1 (Fundação técnica)**: um motor de simulação determinístico em TypeScript com economia, povo, tesouro, legitimidade por grupo, Karsk, decretos compostos, informação imperfeita e os Fios, mais uma interface mobile com criação de personagem, Salão, Reino, Crônica e Mesa. Quase todas as **fórmulas e números são PROPOSTA**: funcionam, mas não foram aprovados.

Ainda **não existe**: personagens com nome e vontade própria, Conselho com ocupantes, vida privada, dinastia, diplomacia, guerra além de incursões, religião e a Corrente, texto livre por IA, outros Estados ativos. Ou seja, o pilar "agentes com interesses próprios" só existe em nível de **grupo** (casas, Ordem, exército, Liga, povo de cada província), não de pessoa.

## Por módulo

| Módulo | Onde | Regras | Código | Testes |
|---|---|---|---|---|
| Relógio (dias corridos, ciclo mensal) | `src/engine/sim.ts`, `core.ts` | CONFIRMADO (D4); calendário 12×30 e início em 12/03/1427 são PROPOSTA | IMPLEMENTADO | TESTADO |
| RNG determinístico e sementes | `src/engine/rng.ts` | CONFIRMADO (princípio 11) | IMPLEMENTADO | TESTADO (2 e 10 anos) |
| Estado do mundo serializável | `src/engine/types.ts`, `world.ts` | CONFIRMADO (motor separado da UI) | IMPLEMENTADO, `version: 1`, sem migração de saves | TESTADO (salvar e carregar no meio) |
| Os Fios (log de causalidade) | `src/engine/core.ts` (`fact`, `pruneFacts`) | PROPOSTA (12.3) | IMPLEMENTADO | TESTADO (cadeias; integridade em 10 anos) |
| Crônica | `core.ts` (`chron`), `sim.ts` | PROPOSTA | IMPLEMENTADO (guarda as últimas 400 entradas) | Parcial |
| Clima e colheita | `systems/economy.ts` | PROPOSTA | IMPLEMENTADO | TESTADO (seca → colheita → preço) |
| Produção, renda, comércio, consumo, preços (6 bens) | `systems/economy.ts` | PROPOSTA | IMPLEMENTADO | Parcial |
| População: demografia, migração, humor, memória, inquietação | `systems/people.ts` | PROPOSTA | IMPLEMENTADO | TESTADO (imposto → humor → inquietação) |
| Guarnições (soldo, moral, deserção) | `systems/people.ts` | PROPOSTA | IMPLEMENTADO | TESTADO (pagar soldo melhora a moral) |
| Tesouro e dívida | `systems/treasury.ts` | PROPOSTA | IMPLEMENTADO | TESTADO (o caixa fecha) |
| Legitimidade contínua por grupo e degraus | `systems/politics.ts` | Direção CONFIRMADA (D9); números PROPOSTA | IMPLEMENTADO | Parcial |
| Karsk (único vizinho ativo) | `systems/karsk.ts` | PROPOSTA | IMPLEMENTADO, com problema: tropas crescem sem limite (ver RESULTADOS) | Só integridade |
| Decretos compostos (12 verbos) | `src/engine/decrees.ts` | Base CONFIRMADA (D3); verbos e efeitos PROPOSTA | IMPLEMENTADO; ordens viajam pelas estradas; executor não distorce nem sabota ainda | TESTADO (ordem só vale quando chega) |
| Relatórios com atraso, fonte e certeza; despachos | `src/engine/reports.ts` | PROPOSTA (12.4) | IMPLEMENTADO | Parcial |
| Habilidades do soberano, vozes e testes 2d6 em % | `src/engine/skills.ts` | Nomes, % e 2d6 CONFIRMADOS; efeitos PROPOSTA | IMPLEMENTADO | TESTADO |
| Criação do soberano em 4 passos (rei ou rainha) | `src/ui/app.ts`, `world.ts` | Estrutura CONFIRMADA; listas e efeitos PROPOSTA | IMPLEMENTADO | Só pelo playtest |
| Interface: Salão, Reino (mapa), Crônica, Mesa, Fios, tutorial | `src/ui/` | Estrutura de telas PROPOSTA (12.2) | IMPLEMENTADO (um arquivo `app.ts` de 765 linhas) | `tools/audit.cjs`, `tools/playtest.cjs` (manuais) |
| Retratos pintados em SVG | `src/ui/portrait.ts` | Estilo PROPOSTA (`docs/design/ART_STYLE.md`) | IMPLEMENTADO | Visual, manual |
| Salvamento local (IndexedDB), exportar e importar | `src/ui/app.ts` | — | IMPLEMENTADO, um espaço só; o save cresce ~500 KB por ano de jogo | Ver RESULTADOS |
| PWA e publicação no GitHub Pages | `tools/build.ts`, `.github/workflows/pages.yml` | CONFIRMADO (D5) | IMPLEMENTADO; fontes vêm do Google Fonts e não ficam offline | — |
| Personagens com nome (nível 1 de agentes) | — | PENDENTE (elenco não definido) | Não existe | — |
| Conselho com ocupantes, nomear e destituir | — | Cargos CONFIRMADOS; ocupantes PENDENTES | Não existe | — |
| Execução de ordens por agentes (cumprir, atrasar, distorcer, sabotar) | — | PROPOSTA (5.3) | Não existe | — |
| Vida privada, dinastia, sucessão | — | PENDENTE | Não existe | — |
| Diplomacia com os 7 Estados | — | PENDENTE (fase 4) | Não existe | — |
| Guerra além de incursões | — | PENDENTE (fase 5) | Não existe | — |
| Religião, Ordem da Fé como instituição, a Corrente | — | Direção CONFIRMADA; regras PENDENTES | Só a Ordem como grupo de legitimidade | — |
| Texto livre interpretado por IA | — | CONFIRMADO como extra (D3) | Não existe (o texto fica gravado no decreto) | — |
| Cartas do rei antigo, rede dos de baixo | — | PROPOSTA | Não existe | — |
| Convicções, fadiga e abalo | — | PROPOSTA | Não existe | — |

## Coisas no repositório que merecem atenção

- `pwa/` na raiz é uma cópia antiga do build. O que vai ao ar é `dist/pwa`, gerado pelo CI. Não apaguei; ver PENDENCIAS.
- `out/playtest-7.png` é uma captura de teste que entrou no commit inicial.
- `tools/` mistura ferramentas permanentes (build, audit, playtest, gen-map) com scripts de calibração de uma vez só (`dbg.ts`, `grain.ts`, `goods.ts`, `why.ts`, `shot*.cjs`).
