# CLAUDE.md — instruções permanentes do IMPERIUM

Leia este arquivo inteiro no começo de toda sessão. Ele é curto de propósito: os detalhes estão nos documentos que ele aponta.

## 1. O que é o projeto

IMPERIUM é um jogo de estratégia, RPG e simulação dinástica para celular (tela vertical, toque), em português. O jogador é o soberano de origem humilde de Eldoria (8 províncias, ~2,4 milhões de habitantes, capital Valtheris), no continente de Asterra, no ano 1427 do Calendário Imperial. A simulação é o coração do jogo.

> O jogador governa. O mundo responde. A história registra.
> O rei pode tentar fazer praticamente qualquer coisa. O mundo não é obrigado a aceitar.

- Jogo no ar: https://tsdfuzzbol.github.io/imperium/ (publica sozinho a cada push na `main`).
- Responsável: Tales (GitHub `TSDFuzzbol`). Ele trabalha **pelo iPhone**: nunca peça para ele rodar comandos.

## 2. Ordem de leitura para retomar o contexto

1. `docs/development/RELATORIO_DA_ULTIMA_SESSAO.md` — onde a última sessão parou.
2. `docs/development/ESTADO_DA_IMPLEMENTACAO.md` — o que existe de verdade no código.
3. `docs/development/PENDENCIAS.md` — conflitos e decisões que esperam o Tales.
4. `docs/design/IMPERIUM_MEMORIA_MESTRA_v1.5.md` — **fonte central de intenção do projeto**. Leia as seções que tocam a sua tarefa; leia inteira antes de qualquer trabalho de design.
5. `docs/architecture/VISAO_GERAL.md` e `docs/decisions/` — como o código é organizado e por quê.
6. `docs/systems/<sistema>.md` do sistema em que vai mexer.

## 3. Quem decide o quê (CONFIRMADO pelo Tales em 26/11 e 27/11/2026)

- **Design é colaborativo:** Tales e Claude (e o ChatGPT, quando o Tales quiser) criam lore, regras, sistemas e interface juntos. Claude tem voz no design e pode propor ideias e melhorias livremente ("vc também tem direito dentro do jogo, pode dar ideias e melhorar oq quiser", Tales, 27/11/2026).
- **A palavra final é do Tales.** Toda ideia nova de Claude entra como **PROPOSTA** e só vira **CONFIRMADO** com o ok explícito dele.
- **Nunca altere em silêncio** uma decisão CONFIRMADA, a lore ou uma regra de jogo. Se a técnica exigir mudar o design, explique o problema e dê alternativas.
- Antes de mudanças grandes no jogo, explique a proposta em português simples e espere o ok.
- A correção mais recente do Tales prevalece sobre documentos antigos. Registre a mudança em `docs/decisions/` e na Memória Mestra.

## 4. Estados (use sempre estes nomes)

| Estado | Significado |
|---|---|
| CONFIRMADO | O Tales decidiu. |
| PROPOSTA | Ideia da equipe, ainda não aprovada. Pode estar no código, mas marcada. |
| PENDENTE | Ainda não existe ou depende de decisão. |
| EM DESENVOLVIMENTO | Alguém está implementando agora (diga em qual branch). |
| IMPLEMENTADO | Existe no código e roda. |
| TESTADO | Implementado e coberto por teste automatizado que passa. |
| BLOQUEADO | Não dá para avançar sem algo externo (diga o quê). |

Nunca declare IMPLEMENTADO o que só existe em documento. A documentação reflete o código real.

## 5. Regras de ouro do código

1. **O motor não conhece a tela.** `src/engine/` nunca importa de `src/ui/` nem usa DOM, `window`, `localStorage` ou relógio real.
2. **Determinismo.** Todo sorteio usa o RNG do mundo (`src/engine/rng.ts`). Proibido `Math.random`, `Date.now` ou `new Date` dentro do motor. Mesma semente + mesmas ordens = mesmo mundo.
3. **O mundo é um JSON.** `World` (`src/engine/types.ts`) é serializável e contém tudo, inclusive o estado do RNG. Nada de estado escondido em módulos.
4. **Toda mudança importante deixa um Fio.** Valores que o jogador vê são registrados com `fact()` (`src/engine/core.ts`) e suas causas. Nenhuma explicação é escrita à mão na tela.
5. **Fórmulas são PROPOSTA.** Toda constante de calibração tem um comentário dizendo se é PROPOSTA ou CONFIRMADO.
6. **Simulação de verdade.** Nada de número decorativo: cada sistema lê e escreve estado que outros sistemas usam, e isso é testado.
7. **Não invente regras para um teste passar. Não apague nem pule teste que falha.** Conserte o código ou registre o problema.

## 6. Comandos

```bash
npm ci              # instalar (Node 22+)
npm run typecheck   # tipos
npm test            # todos os testes (motor, habilidades, longa duração)
npm run build       # gera dist/pwa (app) e dist/imperium.html (arquivo único)
node tools/audit.cjs            # capturas e checagem visual em 390x844 (precisa do build)
node tools/playtest.cjs 7 400   # "teste do macaco" na interface (precisa do build)
```

Playwright e Chromium já existem na nuvem do Claude Code; não rode `playwright install`.

## 7. Fluxo de trabalho (o Tales revisa pelo celular)

- Trabalhe numa branch própria (`claude/...`). **Nunca** faça push na `main`, force push ou reescrita de histórico.
- Commits pequenos e claros, em português. Abra um Pull Request com resumo em português simples: o que mudou, o que testou, o que ainda não está bom.
- O CI (`.github/workflows/ci.yml`) roda tipos, testes e build em todo PR. PR só fica pronto com CI verde.
- Não exclua arquivos que você não criou sem perguntar. Nunca exponha chaves ou tokens.
- Antes de entregar algo visual: build, `tools/audit.cjs`, `tools/playtest.cjs` com 3 sementes, olhar as capturas e passar `docs/design/POLIMENTO.md`. O Tales pediu para ser **muito crítico** com o polimento.

## 8. Ao terminar uma sessão

Atualize, no mesmo PR:
- `docs/development/RELATORIO_DA_ULTIMA_SESSAO.md` (substitua o conteúdo);
- `docs/development/ESTADO_DA_IMPLEMENTACAO.md` e `docs/development/ROADMAP.md`, se algo mudou de estado;
- `docs/development/PENDENCIAS.md`, com decisões novas ou respondidas;
- `docs/decisions/`, se tomou uma decisão técnica;
- a spec em `docs/systems/`, se mudou um sistema;
- este arquivo, se uma regra permanente mudou.

## 9. Skills e agentes

As skills em `.claude/skills/` guiam cada tipo de trabalho. Use a que corresponde à tarefa:
`imperium-architecture`, `imperium-simulation`, `imperium-gameplay`, `imperium-mobile`, `imperium-visual-direction`, `imperium-testing`, `imperium-performance`, `imperium-documentation`, `imperium-code-review`.

Agentes em `.claude/agents/` (use só quando a tarefa é independente e grande):
`imperium-revisor` (revisão de código), `imperium-playtester` (jogar o build e relatar), `imperium-analista-de-simulacao` (rodar sementes e explicar resultados).

## 10. Estilo das respostas ao Tales

Português brasileiro, frases completas, sem jargão. Comece pelo resultado ou pela pergunta. Diga com honestidade o que não está bom. Dê links clicáveis (PR, arquivo, jogo).
