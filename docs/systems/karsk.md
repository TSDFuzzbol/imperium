# Sistema: Karsk

- **Regras:** PROPOSTA · **Código:** IMPLEMENTADO, com problemas · `src/engine/systems/karsk.ts`
- **Fonte:** Memória Mestra §10.4 e §14.1 (Karsk é o único vizinho realmente ativo na fatia vertical)

## 1. Objetivo
Um vizinho que age pelo que acredita ver (informação imperfeita) e explora a instabilidade de Eldoria.
## 2. Escopo
Dentro: tropas na fronteira, agressividade, estimativa de Eldoria, incursões em Rhovan (repelidas ou saques). Fora: economia, política interna, diplomacia, guerra declarada.
## 3. Dependências
Guarnição de Rhovan (defesa percebida), inquietação das províncias, pretendente, degrau da Casa Rhovar.
## 4. Estados e dados
`World.karsk` (`troops`, `aggression`, `lastRaidMonth`, `estimate`).
## 5. Regras
Tropas: +120 por mês, + até 1.800 com a instabilidade percebida, mínimo de 3.000. Incursão no máximo a cada 2 meses, com chance que cresce com a vantagem percebida e a agressividade.
## 6. Entradas e saídas
Saída: fatos `karsk`, `incursao`; perdas em Rhovan; pausa automática.
## 7. Interações
→ População e economia de Rhovan (mortos, saque), → Legitimidade (memórias do exército e da Casa Rhovar).
## 8. Critérios de aceitação
Técnicos: soldados de Rhovan nunca negativos (corrigido em 27/11/2026).
**Falha conhecida:** nada limita as tropas. Em 10 anos sem intervenção, 30 de 30 sementes terminam com 150 mil a 340 mil soldados de Karsk na fronteira e a guarnição de Rhovan em zero.
## 9. Testes
Só integridade (`tests/longrun.test.ts`).
## 10. Lacunas
Decisão P3 em PENDENCIAS: o que limita Karsk (custo, outros fronts, política interna, estações).
