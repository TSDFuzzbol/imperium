---
name: imperium-documentation
description: Use ao fim de toda sessão de trabalho no IMPERIUM e sempre que uma decisão, um estado de implementação, uma spec de sistema ou uma pendência mudar, para manter a continuidade entre sessões e a documentação fiel ao código.
---

# imperium-documentation

## Objetivo
Qualquer sessão nova retoma o projeto só lendo o repositório. A documentação diz a verdade sobre o código e separa CONFIRMADO, PROPOSTA e PENDENTE.

## Quando usar
- Fim de toda sessão (obrigatório).
- Ao tomar decisão técnica (ADR), mudar um sistema (spec), receber resposta do Tales (pendência).

## Responsabilidades
| Documento | Quando atualizar |
|---|---|
| `docs/development/RELATORIO_DA_ULTIMA_SESSAO.md` | Toda sessão (substituir) |
| `docs/development/ESTADO_DA_IMPLEMENTACAO.md` | Algo mudou de estado |
| `docs/development/ROADMAP.md` | Etapa começou, terminou ou mudou |
| `docs/development/PENDENCIAS.md` | Pergunta nova ou respondida |
| `docs/decisions/ADR-*.md` | Decisão técnica |
| `docs/systems/*.md` | Sistema mudou |
| `docs/testing/RESULTADOS.md` | Rodada relevante de testes |
| `CLAUDE.md` | Regra permanente mudou |
| `docs/design/*` (Memória Mestra etc.) | Só com decisão do Tales; documentos criativos não são reescritos sem necessidade |

## Procedimento
1. Compare o que foi feito com `ESTADO_DA_IMPLEMENTACAO.md` e corrija os estados.
2. Escreva o relatório da sessão: o que mudou, testes e resultados, o que não ficou bom, próximo passo, perguntas ao Tales.
3. Decisão do Tales: registre data e frase dele; mude PROPOSTA para CONFIRMADO só com ok explícito.
4. Releia: frases completas, português simples, sem jargão.

## Critérios de qualidade
- Nada descrito como IMPLEMENTADO que não esteja no código; nada TESTADO sem teste que passa.
- Datas absolutas (27/11/2026), nunca "ontem".
- Sem duplicação: um fato mora num lugar e os outros apontam para ele.
- A Memória Mestra continua sendo a fonte central de intenção; documentos de módulo detalham, sem contradizer em silêncio.

## Limitações
Não muda lore nem regra de design ao "arrumar" texto. Correções de consistência em documento criativo (ex.: nomes antigos de habilidades) são propostas ao Tales antes.

## Relação com outras skills
Todas produzem material para esta; `imperium-architecture` (ADRs), `imperium-testing` (resultados).

## Referências
`CLAUDE.md` §8, `docs/README.md`, `docs/decisions/ADR-0000-modelo.md`, `docs/systems/_MODELO.md`, Memória Mestra §0.2.
