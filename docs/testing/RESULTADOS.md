# Resultados de testes

## 27/11/2026 — sessão "Preparar estrutura profissional"

Ambiente: nuvem do Claude Code, Node 22, commit base `66911ea`.

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | Passou |
| `npm test` (antes deste PR: 15 testes) | 15 de 15 passaram |
| Novo `tests/longrun.test.ts`, antes da correção | **Falhou**: semente 3, dia 2.610, guarnição de Rhovan com −883 soldados |
| Novo `tests/longrun.test.ts`, depois da correção em `karsk.ts` | 3 de 3 passaram, 1 `todo` (tamanho do save) |
| `npm run build` | Passou (`imperium.html` com 351 KB) |

### Medições
- **Desempenho:** 10 anos de jogo em ~470 ms (≈ 50 ms por ano). Folga enorme para personagens.
- **Tamanho do save** (semente 7, sem intervenção): 435 KB no ano 1, 2 MB no ano 5, 4,5 MB no ano 10. Fatos guardados: 894 → 9.348. Cresce ~500 KB e ~1.000 fatos por ano. **Problema conhecido**, etapa E1.

### Problemas encontrados
1. **Soldados negativos (corrigido).** As perdas das incursões de Karsk eram subtraídas sem limite. Agora a guarnição nunca fica abaixo de zero. Mudança só de integridade, não de regra.
2. **Karsk cresce sem limite (aberto, precisa de design).** 30 de 30 sementes, 10 anos sem intervenção: Karsk termina com 148 mil a 340 mil soldados na fronteira, e a guarnição de Rhovan termina em zero em todas. Causa: +120 tropas por mês fixas, mais instabilidade, sem custo nem teto. Decisão P3.
3. **Meses de atraso explodem (aberto, precisa de design).** Na semente 3, "meses sem soldo" foi de 10,7 para 267 num mês, porque o atraso dos soldados perdidos passou a ser dividido pelos poucos que sobraram.
4. **Guarnição zerada não se recupera (aberto).** `garrisons()` pula províncias sem soldados; não há recrutamento.

5. **Colapso sem intervenção (aberto, precisa de design).** Com o laboratório (`npx tsx tools/sementes.ts 30 10`), deixando o mundo correr 10 anos sem nenhuma ordem: em 30 de 30 sementes alguma província chega a humor −100; em 6 sementes a população cai de 2,4 milhões para entre 0,7 e 1,8 milhão; em 30 de 30 a Ordem nunca unge o soberano. "Sem intervenção" não é como se joga, mas mostra espirais sem freio (Karsk sem limite → saques e guarnição zerada → fome e humor). Precisa de calibração aprovada (P3, P4) e de testes de cenário com intervenção típica.

Como reproduzir: `npx tsx --test tests/longrun.test.ts` e `npx tsx tools/sementes.ts 30 10` (tabela com população, tesouro, dívida, Rhovan, Karsk, pior humor, unção, tamanho do save e tempo por semente).

### Não rodado nesta sessão
`tools/audit.cjs` e `tools/playtest.cjs`: esta sessão não mudou nada visível na interface.
