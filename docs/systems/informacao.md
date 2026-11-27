# Sistema: informação — relatórios e audiências

- **Regras:** PROPOSTA (Memória Mestra §12.4, §3.1) · **Código:** IMPLEMENTADO · `src/engine/reports.ts`

## 1. Objetivo
O rei não é onisciente: sabe o que lhe contam, com atraso, ruído e fonte; e pessoas pedem audiência com base no estado do mundo.
## 2. Escopo
Relatórios por província (feitos no fim do mês, viajam até Valtheris, com erro que depende do ofício do soberano); certeza "visto" só na capital. Despachos (audiências) gerados pelo estado do mundo; ignorar ofende quem pediu.
Fora: rumores, conselheiros que mentem, verificar um relatório, rede dos de baixo como fonte própria.
## 3. Dependências
Todos os sistemas que geram estado relatável; habilidades (vozes e testes nas audiências).
## 4. Estados e dados
`World.reports`, `World.pendingReports`, `World.dispatches`.
## 5. Regras
Ruído gaussiano por campo; cozinheiro vê o grão sem erro; faxineiro, lavadeiro e jardineiro leem melhor o humor.
## 6. Entradas e saídas
Saída: o que a interface mostra como "o que o rei sabe".
## 7. Interações
← Todos; → Legitimidade e população (audiências ignoradas viram memória).
## 8. Critérios de aceitação
A interface nunca mostra o valor verdadeiro de uma província distante, só o relatório (PENDENTE de teste automático).
## 9. Testes
Indiretos (`tests/skills.test.ts`).
## 10. Lacunas
Fontes com interesses próprios, informações contraditórias de conselheiros, Fios filtrados pelo conhecimento do rei.
