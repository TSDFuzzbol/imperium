# Sistema: personagens e agentes (nível 1)

- **Regras:** PENDENTE · **Código:** não existe
- **Fonte:** Memória Mestra §6.3 (três níveis de agentes, PROPOSTA), §10.2 (Conselho), §14.1 (~40 personagens na fatia vertical)

## 1. Objetivo
Pessoas com nome, traços, memória, objetivos, relações e segredos, que agem sozinhas.
## 2. Escopo (proposto)
Conselho (8 cargos CONFIRMADOS como ponto de partida), chefes das 8 casas, figuras da Ordem, da Liga e do exército, a rede dos de baixo. Personagens que "sobem" do povo quando importam.
## 3. Dependências
Elenco aprovado (P1); persistência versionada (E1), porque o `World` vai ganhar uma estrutura nova.
## 4–9.
A definir quando o Tales aprovar o elenco e as regras de decisão dos agentes.
## 10. Lacunas que precisam do Tales
- Quem são (nomes, cargos, interesses, segredos).
- Como um agente decide (objetivos, informação que tem, risco que aceita).
- Como executam ordens (P2).
- Que parte da vida privada entra na fatia vertical (P5).

### Nota técnica (PROPOSTA de engenharia, não de design)
Estrutura sugerida: `World.people: Record<PersonId, Person>` com crenças (o que acham que sabem), memória (reaproveitando `Grievance`), relações com peso e decisões mensais em ordem fixa por id, para manter o determinismo. Custo estimado: 150 personagens × decisão mensal é desprezível para o orçamento de tempo atual.
