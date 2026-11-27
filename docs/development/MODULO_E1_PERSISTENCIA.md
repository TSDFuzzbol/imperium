# Módulo E1: persistência versionada e orçamento dos Fios

**Estado: PROPOSTA técnica · primeiro módulo recomendado (27/11/2026).** Não depende de nenhuma decisão de design: não muda regra de jogo, números nem o que o jogador vê (exceto ganhar vários espaços de salvamento, que é interface e precisa do ok do Tales; ver item 5).

## 1. Objetivo
Garantir que um reinado longo pode ser salvo, carregado e continuado em versões futuras do jogo, com tamanho limitado e sem perder a explicação dos acontecimentos.

## 2. Escopo
Dentro:
- Versão do save com migrações encadeadas (`v1 → v2 → ...`), cada uma testada.
- Persistência fora da interface: `src/persistence/` (IndexedDB, exportar, importar).
- Orçamento dos Fios: fatos antigos que só são segurados por memórias viram **fatos-resumo** (rótulo, valor, data, "cadeia resumida") em vez de manter a cadeia inteira.
- Teste de 30 anos com orçamento de tamanho.
Fora: nuvem, sincronização entre aparelhos, conquistas.

## 3. Dependências
Nenhuma etapa anterior. Toca `src/engine/core.ts` (poda), `src/engine/types.ts` (versão), `src/ui/app.ts` (sai o código de salvamento).

## 4. Estados e dados
- `World.version` passa a ser número crescente.
- Novo campo opcional no fato: `summary?: true` e `summarized?: number` (quantos fatos a cadeia tinha).

## 5. Regras (técnicas)
- Carregar: lê o JSON, aplica migrações até a versão atual; se falhar, não apaga nada e oferece exportar o arquivo bruto.
- Poda: além da regra atual, fatos com mais de N meses que só são alcançados por memórias viram resumo. N e o orçamento são parâmetros técnicos (sugestão: 24 meses; 5 MB em 30 anos).
- **Precisa do ok do Tales:** mostrar vários espaços de salvamento na tela (sugestão: 3 espaços + salvamento automático).

## 6. Entradas e saídas
`save(world, slot)`, `load(slot) → World | erro explicado`, `migrate(json) → World`, `exportSave()`, `importSave(texto)`.

## 7. Interações
Fios (poda), interface (menu de salvar e carregar), CI (testes de migração).

## 8. Critérios de aceitação
1. Um save `version: 1` gerado pela `main` de 27/11/2026 carrega na versão nova e o futuro é idêntico ao de antes da migração (mesma semente e ordens).
2. 30 anos sem intervenção: save abaixo do orçamento definido.
3. Nenhum Fio solto em 30 anos; todo fato-resumo diz que é resumo.
4. Determinismo de 10 anos continua passando.
5. Interface sem mudança visível além dos espaços de salvamento (verificado com `tools/audit.cjs` antes e depois).

## 9. Testes
- `tests/persistence.test.ts`: migração v1 → atual com um save fixo guardado em `tests/fixtures/`.
- `tests/longrun.test.ts`: troca o `test.todo` do tamanho do save por um teste real.
- Fios: teste de que a explicação de um efeito recente continua completa depois da poda.

## 10. Documentação
Atualizar ADR-0004 (orçamento), novo ADR de persistência, `docs/systems/fios.md`, `ESTADO_DA_IMPLEMENTACAO.md`.

## Por que este e não outro
- É o único item do roadmap que não espera decisão de design.
- Todos os módulos seguintes (personagens, Conselho, casas) mudam o `World`. Sem migração, cada um quebraria os saves do Tales.
- O crescimento do save já foi medido (4,5 MB em 10 anos) e vai piorar com personagens.
