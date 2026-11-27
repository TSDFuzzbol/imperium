# ADR-0008: branches, Pull Requests e CI

- **Estado:** CONFIRMADO (Diretriz Mestra §6 e §10)

## Decisão
- Todo trabalho em branch própria; nada de push direto na `main`, force push ou reescrita de histórico.
- Toda mudança chega por Pull Request com resumo em português.
- `.github/workflows/ci.yml` roda em todo PR: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`.
- `.github/workflows/pages.yml` publica a `main` no GitHub Pages.
- O Tales revisa e faz o merge pelo celular.

## Consequências
- Recomendado (só o Tales pode): proteger a `main` exigindo PR e o check **CI** verde.
- Os testes visuais (`tools/audit.cjs`, `tools/playtest.cjs`) ainda rodam só nas sessões, não no CI. Levá-los ao CI é trabalho futuro.
