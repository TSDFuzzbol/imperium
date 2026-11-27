# Sistema: legitimidade contínua

- **Regras:** direção CONFIRMADA (D9: fontes e degraus emergentes, sem prazo); pesos e limiares PROPOSTA
- **Código:** IMPLEMENTADO · `src/engine/systems/politics.ts`
- **Fonte:** Memória Mestra §4.4; PROPOSTAS_DO_REI_v2 §2; ESPEC_FUNDACAO §5

## 1. Objetivo
Cada grupo decide sozinho quanto aceita o soberano, e até onde vai na contestação.
## 2. Escopo
Grupos: 8 casas, Ordem da Fé, exército, Liga Mercantil e o povo de cada província. Fontes: lei, sagrado, força, povo, costume, sangue. Degraus: Aceita, Murmúrio, Recusa, Alternativa, Conspiração, Ruptura. Unção pela Ordem. Pretendente.
Fora: chefes das casas como personagens, conspirações com rosto, negociação com grupos.
## 3. Dependências
População (humor, inquietação), guarnições (força), tesouro e decretos (interesses e memórias), habilidades (rede dos de baixo como fonte do relatório).
## 4. Estados e dados
`World.groups[*]` (`acceptance`, `rung`, `rungMonths`, `interest`, `memory`, `wealth`, `present`), `World.anointed`, `World.pretender`.
## 5. Regras
Aceitação mira deslocamento do tipo de grupo + fontes ponderadas + interesses + memórias, e anda 30% por mês até o alvo. O grupo sobe no máximo um degrau por mês, com hesitação aleatória; o povo segue a inquietação da província. Efeitos: casa em Recusa retém 25% do imposto; Conspiração alimenta agitadores e (Rhovar) Karsk; Ordem em Conspiração faz sermões; Ordem unge com aceitação acima de 12.
## 6. Entradas e saídas
Saída: fatos `grupo:*`, `uncao`, `pretendente`; Crônica de mudanças de degrau.
## 7. Interações
→ Tesouro (retenção), → População (agitadores, sermões), → Karsk (agressão).
## 8. Critérios de aceitação
Aceitação em [-100, 100] (testado). De design (PENDENTE): o começo do reinado deve ser o período mais perigoso sem relógio nenhum (§4.4) — falta um teste que meça isso em várias sementes.
## 9. Testes
Pagar soldo melhora o exército; invariantes de 10 anos.
## 10. Lacunas
A fonte "força" só olha a guarnição de Rhovan. Ruptura ainda não gera rebelião nobre com efeito militar.
