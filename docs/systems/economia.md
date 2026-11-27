# Sistema: economia

- **Regras:** PROPOSTA (todas as fórmulas). Bens da fatia vertical (grão, ferro, lã e tecido, madeira, sal, moeda) vêm da Memória Mestra §14.1 (escopo CONFIRMADO).
- **Código:** IMPLEMENTADO · `src/engine/systems/economy.ts`
- **Fonte:** ESPEC_FUNDACAO §4 (fórmulas e constantes)

## 1. Objetivo
Um mercado por província em que produção, comércio, preços e consumo reagem ao clima, aos decretos e à ordem pública, e afetam fome, renda e tesouro.
## 2. Escopo
Dentro: clima mensal e colheita (agosto a outubro), produção por setor, tecelagem (lã → tecido), ferramentas (ferro), renda por estrato, comércio por estradas com pedágio e custo por km, porto de Altamar com tarifa, comércio pequeno com vizinhos, consumo por prioridade de estrato, preços por cobertura de estoque, perdas de armazenamento. Fora: crédito e bancos, salários explícitos, comércio entre Estados detalhado (fase 4).
## 3. Dependências
Clima (dentro do próprio sistema), decretos (imposto, tarifa, pedágio, grão), inquietação (corta produção e comércio), guarnições (requisição de grão quando sem soldo).
## 4. Estados e dados
`Province.stock`, `price`, `demandAvg`, `tradeIn/Out`, `rain`, `growRain`, `blight`, `toolsMet`, `relief`, `requisition`, `strata.*.income/wealth/hunger/lack`; `World.port`, `World.tolls`, `World.granary`, `World.flows`.
## 5. Regras
Ver ESPEC_FUNDACAO §4. Resumo: colheita = rendimento × chuva × ferramentas × ordem; o camponês come primeiro do próprio campo; grão anda do preço baixo para o alto; preço sobe quando o estoque não cobre os meses até a próxima colheita; fome = parte da necessidade de grão não atendida.
## 6. Entradas e saídas
Entrada: estado das províncias e decretos. Saída: estoques, preços, renda, fome, fatos `preco:*`, `estoque:*`, `producao:*`, `imposto:*`.
## 7. Interações
→ População (fome, carência e preço do pão mexem no humor); → Tesouro (imposto sobre produção); ← Inquietação (revolta corta comércio a 30% e produção a 60%); ← Karsk (saque de grão).
## 8. Critérios de aceitação (técnicos, já valem)
Estoques nunca negativos; preços sempre positivos e finitos; cadeia seca → colheita → preço visível pelos Fios.
**De design (PENDENTE):** faixas aceitáveis de preço, fome e renda num ano normal e num ano de crise, a aprovar pelo Tales.
## 9. Testes
Seca em Veyra encarece o grão na capital; pão do rei alivia a fome; invariantes de 2 e 10 anos.
## 10. Lacunas
Crédito, salários, oficinas, preços entre Estados. Mercadores como agentes. O exemplo de cadeia da Diretriz (imposto → preço → consumo → crédito) ainda não tem a parte do crédito.
