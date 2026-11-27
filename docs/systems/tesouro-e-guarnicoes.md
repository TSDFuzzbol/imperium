# Sistema: tesouro e guarnições

- **Regras:** PROPOSTA · **Código:** IMPLEMENTADO e TESTADO · `src/engine/systems/treasury.ts`, `garrisons()` em `src/engine/systems/people.ts`
- **Fonte:** Memória Mestra §10.4 (crise de 1427); ESPEC_FUNDACAO §4

## 1. Objetivo
A Coroa tem dinheiro real, dívida real e obrigações que, se não pagas, viram atraso, moral baixa e deserção.
## 2. Escopo
Dentro: receita de impostos (com retenção por casas em Recusa), juros, administração, soldo proporcional por guarnição, corte, oferta de crédito da Liga, moral e deserção. Fora: tesouro privado do rei, crédito complexo, exércitos de campanha.
## 3. Dependências
Economia (base de impostos), legitimidade (retenção), decretos (pagar soldo, crédito da Liga, doações).
## 4. Estados e dados
`World.treasury`, `Province.garrison` (`soldiers`, `morale`, `arrears`, `monthsUnpaid`), `World.liga`.
## 5. Regras
Ordem de pagamento: juros → administração → soldo → corte. Soldo não pago vira atraso; meses de atraso derrubam a moral; moral abaixo de 0,35 gera deserção.
## 6. Entradas e saídas
Saída: caixa, histórico mensal, moral, fatos `tesouro`, `guarnicao:*`.
## 7. Interações
→ Legitimidade (exército pesa força e soldo de Rhovan); → Karsk (defesa = soldados × moral); → Economia (soldados sem soldo requisitam grão).
## 8. Critérios de aceitação
Saldo = anterior + receitas − despesas (testado). Soldados nunca negativos (corrigido em 27/11/2026).
## 9. Testes
`tests/engine.test.ts`, `tests/longrun.test.ts`.
## 10. Lacunas e problemas
- `monthsUnpaid` = atraso ÷ soldo mensal atual. Quando soldados morrem ou desertam, o atraso deles continua e o número explode (passa de 270). Precisa de regra de design: o atraso dos que saíram some, vira dívida, ou vira ressentimento?
- Guarnição com zero soldados nunca se recupera (não há recrutamento).
