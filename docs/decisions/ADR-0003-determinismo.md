# ADR-0003: determinismo por semente e mundo serializável

- **Estado:** CONFIRMADO (Memória Mestra §6.1, princípio 11)

## Decisão
- RNG sfc32 com estado dentro do `World` (`src/engine/rng.ts`).
- Mesma semente + mesmos comandos nos mesmos dias = mesmo `World`, byte a byte (`JSON.stringify`).
- Salvar é `JSON.stringify(world)`; carregar no meio não muda o futuro.
- Os comandos do jogador ficam em `World.log`, o que permite reproduzir uma partida.

## Consequências
- Testes de determinismo de 2 e 10 anos (`tests/engine.test.ts`, `tests/longrun.test.ts`).
- Cuidado com a ordem de iteração: iterar sempre sobre listas fixas (`PROVS`, `STRATA`, `GOODS`), não sobre chaves criadas em ordem variável.
- Se a simulação for para um Web Worker (E2), o Worker é dono do `World`; a interface recebe instantâneos.
