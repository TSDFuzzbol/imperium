---
name: imperium-performance
description: Use quando a tarefa pode afetar velocidade, memória, tamanho do save, tamanho do build ou fluidez do IMPERIUM no celular — novos sistemas por mês, muitas entidades, Fios, renderização de telas e mapa, Web Worker.
---

# imperium-performance

## Objetivo
Simulação profunda que roda liso num iPhone, sem "simulação falsa": otimizar com agregação e níveis de detalhe, nunca cortando causalidade.

## Quando usar
- Sistema novo no ciclo mensal ou diário; entidades novas em quantidade.
- Mudança nos Fios, na Crônica ou no formato do save.
- Tela que redesenha muito, animação, mapa.
- Qualquer relato de "travou" ou "esquentou".

## Responsabilidades
Vigiar os orçamentos e medir antes de otimizar.

| Orçamento | Hoje (27/11/2026) | Limite de alerta |
|---|---|---|
| Um ano de jogo (servidor) | ~50 ms | 1 s no teste; 2 s num iPhone antigo |
| Save após 10 anos | ~4,5 MB | depois da E1: definir (sugestão 5 MB em 30 anos) |
| Build (`imperium.html`) | ~351 KB | 1 MB |
| Um dia de jogo na velocidade máxima | 60 ms de intervalo | o passo + render precisa caber nisso |

## Procedimento
1. Meça: `npx tsx tools/sementes.ts 10 10` (tempo e save por semente) e o teste de orçamento em `tests/longrun.test.ts`.
2. Ache o gargalo real (perfil com `--cpu-prof` do Node, ou `performance.now()` em volta de cada sistema do ciclo).
3. Otimize o gargalo: estruturas indexadas, agregação por nível de detalhe (Memória Mestra §6.3), resumo de fatos antigos, Web Worker para tirar a simulação da tela (E2).
4. Meça de novo e registre em `docs/testing/RESULTADOS.md`.

## Critérios de qualidade
- O determinismo continua (teste de 10 anos passa).
- Nenhuma cadeia causal some por otimização; se um Fio é resumido, o resumo diz o que foi resumido.
- Ganho medido, com número antes e depois.

## Limitações
A nuvem não tem iPhone: números de servidor são proxy. Peça ao Tales para notar travadas reais.

## Relação com outras skills
`imperium-architecture` (Worker, persistência), `imperium-simulation` (custo dos sistemas), `imperium-mobile` (render), `imperium-testing` (orçamentos como testes).

## Referências
`tests/longrun.test.ts`, `tools/sementes.ts`, `src/engine/core.ts` (`pruneFacts`), ADR-0004, `docs/architecture/AVALIACAO_TECNOLOGICA.md`.
