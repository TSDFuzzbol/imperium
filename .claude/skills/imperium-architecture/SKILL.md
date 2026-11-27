---
name: imperium-architecture
description: Use ao decidir estrutura de código do IMPERIUM — novos módulos, pastas, dependências entre motor e interface, formato do World, persistência, Web Worker, escolha de biblioteca ou tecnologia, ou qualquer mudança que atravesse vários sistemas.
---

# imperium-architecture

## Objetivo
Manter o código do IMPERIUM capaz de sustentar anos de desenvolvimento: motor puro e determinístico, módulos com fronteiras claras, decisões registradas.

## Quando usar
- Criar um módulo, pasta ou camada nova.
- Mudar `World` (`src/engine/types.ts`) ou o formato do save.
- Adicionar dependência npm, biblioteca de interface ou ferramenta de build.
- Mover código entre `engine`, `ui`, `data`, `tools`.
- Qualquer tarefa que toque mais de dois sistemas.

## Responsabilidades
- Fazer valer as regras de dependência de `docs/architecture/VISAO_GERAL.md` §3.
- Registrar toda decisão técnica relevante em `docs/decisions/ADR-NNNN-*.md`.
- Manter o mapa "Hoje" de `VISAO_GERAL.md` igual ao código.
- Avaliar tecnologia com critérios explícitos (`AVALIACAO_TECNOLOGICA.md`), nunca por conveniência.

## Procedimento
1. Leia `docs/architecture/VISAO_GERAL.md`, os ADRs e a spec dos sistemas tocados.
2. Escreva em 5 linhas: problema, opções (pelo menos 2), escolha, custo, como reverter.
3. Se a mudança alterar o que o jogador vê ou uma regra de jogo, pare: é design. Explique ao Tales e espere o ok (`CLAUDE.md` §3).
4. Mudanças de pasta acontecem aos poucos, junto com trabalho real, nunca numa reorganização isolada.
5. Ao mudar `World`: suba a versão do save e escreva a migração com teste (depois da etapa E1; antes dela, avise no PR que saves antigos podem quebrar).
6. Atualize ADR, `VISAO_GERAL.md` e `ESTADO_DA_IMPLEMENTACAO.md` no mesmo PR.

## Critérios de qualidade
- `grep -rn "from '../ui\|window\.\|document\.\|Math.random\|Date.now" src/engine` não encontra nada.
- O `World` continua serializável por `JSON.stringify` e o teste de determinismo passa.
- Toda dependência nova tem motivo escrito e tamanho medido no build.
- Nenhum sistema chama outro diretamente; a ordem do ciclo vive só em `src/engine/sim.ts`.

## Limitações
Não decide regras de jogo, números de calibração nem lore. Não aprova a própria PROPOSTA técnica grande (ADR-0005, ADR-0006): o Tales aprova.

## Relação com outras skills
`imperium-simulation` (dados e ciclo), `imperium-performance` (Worker e orçamento), `imperium-testing` (testes de migração e determinismo), `imperium-documentation` (ADRs), `imperium-code-review` (verifica as regras).

## Referências
- `docs/architecture/VISAO_GERAL.md`, `docs/architecture/AVALIACAO_TECNOLOGICA.md`, `docs/decisions/`
- `src/engine/types.ts` (World), `src/engine/sim.ts` (ciclo), `tools/build.ts` (build)
- Padrões úteis: núcleo funcional com casca imperativa; event sourcing leve (`World.log` reproduz a partida); Web Workers com mensagens de comando e instantâneo.
