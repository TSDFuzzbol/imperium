# Registro de decisões (ADR)

Cada decisão técnica ou de arquitetura importante ganha um arquivo `ADR-NNNN-titulo.md`. Decisões de **design e lore** ficam na Memória Mestra (`docs/design/`); aqui só se registra o reflexo técnico delas.

## Como escrever
Copie `ADR-0000-modelo.md`. Nunca apague um ADR: se a decisão mudar, crie outro que o substitua e marque o antigo como "Substituído por ADR-XXXX".

## Índice
| ADR | Título | Estado |
|---|---|---|
| 0001 | Motor de simulação separado da interface | CONFIRMADO (Memória Mestra §13, ESPEC) |
| 0002 | PWA primeiro | CONFIRMADO (D5) |
| 0003 | Determinismo por semente e mundo serializável | CONFIRMADO (princípio 11) |
| 0004 | Os Fios como log de causalidade | IMPLEMENTADO; o conceito na interface é PROPOSTA de design (12.3) |
| 0005 | Manter TypeScript + motor próprio + web | PROPOSTA |
| 0006 | Interface em módulos; biblioteca só se precisar | PROPOSTA |
| 0007 | Divisão de trabalho: design colaborativo | CONFIRMADO (27/11/2026) |
| 0008 | Branches, Pull Requests e CI | CONFIRMADO pela Diretriz Mestra §10 |
