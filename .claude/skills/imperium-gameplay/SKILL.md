---
name: imperium-gameplay
description: Use ao implementar mecânicas e interações do jogador no IMPERIUM — decretos, audiências, testes de habilidade, criação do soberano, agenda, decisões, estados de jogo e o que o jogador consegue fazer e entender.
---

# imperium-gameplay

## Objetivo
Transformar regras aprovadas em ações que o jogador entende, sente e consegue explicar, com a liberdade de "tentar quase tudo" e um mundo que pode recusar.

## Quando usar
- Novo verbo de decreto, opção de audiência, teste de habilidade, passo da criação.
- Mudar o que acontece quando o jogador age.
- Ligar uma ação a uma consequência visível.

## Responsabilidades
- Toda ação passa por autoridade, capacidade, obediência e legitimidade (Memória Mestra §5.2) quando o sistema correspondente existir.
- Feedback: o efeito aparece em até um mês de jogo e pode ser rastreado nos Fios.
- Respeitar as regras CONFIRMADAS: nada de barras que encerram o jogo (estilo Reigns rejeitado); recursos sem teto; testes mostram só a %; morte do soberano rara e anunciada; legitimidade sem timers; rei ou rainha.

## Procedimento
1. Confirme que a regra existe e qual o estado dela (CONFIRMADO ou PROPOSTA). Se não existe, escreva a proposta em português simples para o Tales, com alternativas, antes de codar.
2. Defina: entrada do jogador → comando no motor (`issue`, `runCheck`) → efeito no `World` → fato nos Fios → o que a tela mostra.
3. Implemente a regra no motor (nunca na interface) e a apresentação na interface.
4. Teste: uma cadeia no motor e o fluxo na tela com `tools/playtest.cjs`.
5. Jogue de verdade: crie um soberano, use a mecânica, veja se a consequência é perceptível e justa.

## Critérios de qualidade
- A interface nunca muda o `World` direto.
- O jogador entende por que deu certo ou errado (Fios, vozes, Crônica).
- Opção impossível aparece desativada e diz por quê.
- Nada de evento roteirizado que ignore o estado do mundo.

## Limitações
Não cria regra nova sem marcar PROPOSTA. Não implementa sistema cujas regras não foram aprovadas (ver `docs/development/PENDENCIAS.md`).

## Relação com outras skills
`imperium-simulation` (efeitos), `imperium-mobile` (como a ação cabe no dedo), `imperium-visual-direction` (como aparece), `imperium-testing`.

## Referências
Memória Mestra §3 (experiência do jogador), §5 (soberania), §14.1 (critério da fatia vertical); `docs/systems/decretos.md`, `habilidades.md`, `informacao.md`; `src/engine/decrees.ts`, `src/engine/skills.ts`.
