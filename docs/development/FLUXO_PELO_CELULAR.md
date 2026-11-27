# Como o Tales acompanha o projeto pelo iPhone

O responsável trabalha pelo celular. Nada no fluxo pode exigir computador ou terminal.

## Pedir trabalho
- Pelo app do Claude (projeto Imperium) ou em claude.ai/code, numa sessão ligada ao repositório `TSDFuzzbol/imperium`.
- Uma tarefa por pedido. Ex.: "implemente o módulo E1 do roadmap" ou "revise o PR #3".
- A sessão lê `CLAUDE.md` sozinha. Não é preciso colar contexto.

## Revisar
- Cada tarefa vira um **Pull Request** no GitHub. No app do GitHub (ou no Safari), abra o PR:
  - **Conversation:** o resumo em português do que mudou e do que ainda não está bom.
  - **Checks:** o CI precisa estar verde (tipos, testes e build).
  - **Files changed:** opcional; o resumo deve bastar.
- Para pedir mudança, comente no PR ou responda na conversa com o Claude.
- Para aprovar, toque em **Merge pull request**. A `main` publica o jogo sozinha em https://tsdfuzzbol.github.io/imperium/ (depois que o Pages estiver em "GitHub Actions", ver abaixo).

## Configurações que só o Tales pode fazer (uma vez, pelo Safari)
1. **Publicação automática:** github.com/TSDFuzzbol/imperium → Settings → Pages → Source: **GitHub Actions**.
2. **Proteger a main (recomendado):** Settings → Branches → Add rule para `main` → marcar "Require a pull request before merging" e "Require status checks to pass" (escolher o check **CI**).

## Testar o jogo
- Abra o link do jogo no Safari. Para virar app: Compartilhar → Adicionar à Tela de Início.
- Se algo parecer errado, mande uma captura de tela na conversa.
