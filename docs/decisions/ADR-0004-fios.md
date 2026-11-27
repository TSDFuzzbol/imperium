# ADR-0004: os Fios como log de causalidade

- **Estado:** IMPLEMENTADO. A forma como aparece para o jogador é PROPOSTA de design (Memória Mestra §12.3).

## Decisão
Cada valor importante é um `Fact` (`src/engine/core.ts`) com fatores; cada fator pode apontar (`ref`) para outro fato. `factIndex` guarda o fato mais recente de cada chave. A interface só mostra o que os fatos dizem.

## Consequências
- Explicar "por que isso aconteceu?" vira percorrer um grafo, testável (`reaches()` nos testes).
- `pruneFacts` remove fatos inalcançáveis todo mês. Mesmo assim o número de fatos cresce cerca de 1.000 por ano de jogo, porque memórias antigas seguram cadeias inteiras. A etapa E1 define um orçamento (resumir fatos antigos em vez de guardar a cadeia inteira).
- Informação imperfeita: hoje os Fios mostram a verdade do motor. Mostrar só "o que alguém contou ao rei" é trabalho futuro (Memória Mestra §12.3).
