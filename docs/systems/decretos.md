# Sistema: decretos e ordens

- **Regras:** base CONFIRMADA (D3: decreto composto verbo + alvo + modo; texto livre por IA como extra); verbos e efeitos PROPOSTA
- **Código:** IMPLEMENTADO e TESTADO · `src/engine/decrees.ts`
- **Fonte:** Memória Mestra §5.3; ESPEC_FUNDACAO §7

## 1. Objetivo
O rei ordena; a ordem viaja, chega e muda o mundo, com previsão incerta do conselho antes de assinar.
## 2. Escopo
Verbos implementados: taxar, isentar, tarifa do porto, pedágio, comprar grão, distribuir grão, importar grão, pagar soldo, enviar tropas, crédito da Liga, doar à Ordem, convocar casa, esperar, persuadir (teste de habilidade). Modo: público ou secreto; texto "nas suas palavras" guardado.
Fora: executor que cumpre, atrasa, distorce ou sabota; nomear, destituir, criar cargos, prender, executar, casar etc. (dependem de personagens).
## 3. Dependências
Estradas e distâncias (`src/data/eldoria.ts`), tesouro (custo).
## 4. Estados e dados
`World.orders`, `World.log` (comandos do jogador, base para reproduzir partidas).
## 5. Regras
Ordens viajam a 38 km/dia pela estrada mais curta (PROPOSTA). `validate` recusa o impossível (ex.: mandar mais soldados do que existem). O custo sai do tesouro na emissão.
## 6. Entradas e saídas
Entrada: comando da interface. Saída: ordem em andamento; ao chegar, efeito no mundo, memória nos grupos e fatos.
## 7. Interações
Todos os sistemas que os verbos tocam.
## 8. Critérios de aceitação
A ordem só vale quando chega (testado). O efeito aparece nos Fios com o decreto como causa (testado para imposto).
## 9. Testes
`tests/engine.test.ts`, `tests/skills.test.ts`.
## 10. Lacunas
O pilar "ordenar não é ser obedecido" (§5.2) só existe pela legitimidade dos grupos; falta a execução por agentes (M3, decisão P2).
