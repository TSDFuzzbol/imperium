# Imperium: checklist de polimento

Regra do Tales (27/11/2026): ser muito crítico, e tudo tem que estar muito bem polido. Esta lista é passada a cada entrega, antes de publicar.

## Como rodar
No código (`codigo/`), primeiro `npm run build`. Depois:
1. `node tools/audit.cjs` tira capturas de todas as telas num celular de 390×844 e checa toque, letra, contraste e transbordo. Saída em `out/audit/`.
2. `node tools/playtest.cjs <semente> 400` faz o teste do macaco: cliques e barras aleatórios por meses de jogo. Rodar 3 sementes.
3. `npm test` roda os testes do motor.
4. Olhar cada captura e responder à lista abaixo com honestidade. O que falhar é corrigido ou entra no relatório como pendente.

## Lista
**Leitura**
- [ ] Nenhum texto com menos de 13 px. Falas e textos corridos com 16 px ou mais.
- [ ] Contraste de pelo menos 4,5:1 em texto normal e 3:1 em títulos grandes.
- [ ] Nada de itálico ou serifada fina em texto longo.
- [ ] Linhas de texto com no máximo cerca de 65 caracteres.

**Toque**
- [ ] Todo alvo de toque tem pelo menos 40×40 px, ou está numa linha inteira tocável.
- [ ] Toque dá resposta visível imediata (estado pressionado ou mudança na tela).
- [ ] Nada de zoom, nada de rolagem lateral, nada de arrastar a página sem querer.
- [ ] Barras deslizantes funcionam com o dedo no iPhone sem travar.

**Layout**
- [ ] A tela de 390 px não corta nada. A de 360 px também não.
- [ ] Margens laterais iguais em todas as telas.
- [ ] Cartões do mesmo tipo têm o mesmo espaçamento interno.
- [ ] Folhas (ficha da província, Fios, tutorial) fecham pelo ✕ e mostram o que está atrás.

**Estados**
- [ ] Toda lista tem um estado vazio com texto útil.
- [ ] Botões sem efeito possível aparecem desativados e dizem por quê.
- [ ] Números sem dado ainda (primeiro mês) não aparecem como "0 coroas".
- [ ] Nenhum "NaN", "undefined" ou "null" na tela.

**Texto em português**
- [ ] Frases completas, voz ativa, sem jargão de programador.
- [ ] Acentos certos. Números no formato brasileiro (1.000,5).
- [ ] O mesmo nome para a mesma coisa em todas as telas.

**Movimento**
- [ ] Animações curtas (menos de 300 ms), com propósito, e desligadas com "reduzir movimento".
- [ ] Nada pisca nem pula quando o tempo corre.

**Jogo**
- [ ] O primeiro minuto ensina sem travar: criação, tutorial, primeira audiência.
- [ ] Todo número importante abre os Fios.
- [ ] O que o jogador faz tem efeito visível em até um mês de jogo.
