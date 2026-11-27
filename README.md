# Imperium

Jogo de estratégia e simulação dinástica em fantasia de baixa magia, feito para o celular (tela vertical, toque) e em português.

Você é um soberano de origem humilde, escolhido pelo antigo rei sem herdeiros para governar Eldoria, um reino de oito províncias com capital em Valtheris, no continente de Asterra. Não há barras que acabam o jogo: o reino é uma simulação contínua de economia, política e pessoas, e cada decisão deixa rastros que você pode seguir nos Fios.

**Jogar agora:** https://tsdfuzzbol.github.io/imperium/

No iPhone, abra no Safari, toque em Compartilhar e escolha "Adicionar à Tela de Início" para jogar como um app, inclusive sem internet. No Android, use o menu do Chrome e escolha "Instalar app".

> Em desenvolvimento. Tudo marcado como PROPOSTA nos documentos de design ainda não foi aprovado.

## Estrutura

| Pasta | O que tem |
|---|---|
| `src/engine/` | O motor da simulação em TypeScript, separado da interface: economia, política, povo, tesouro, habilidades do soberano e decretos. |
| `src/ui/` | A interface: telas, mapa, retratos e tutorial. |
| `src/data/` | Dados de Eldoria e o mapa gerado. |
| `tests/` | Testes do motor. |
| `tools/` | Build, gerador de mapa e ferramentas de teste visual (auditoria e playtest). |
| `pwa/` | A última versão compilada do jogo como app instalável. |
| `docs/design/` | Documentos de design: Memória Mestra, propostas, especificação, guia de arte e lista de polimento. |

## Rodar localmente

Precisa do Node.js 22 ou mais novo.

```bash
npm ci
npm test            # testes do motor
npm run typecheck   # checagem de tipos
npm run build       # gera dist/pwa (app) e dist/imperium.html (arquivo único)
```

Depois abra `dist/pwa/index.html` num servidor local, por exemplo `npx serve dist/pwa`.

## Publicação

Cada envio para a branch `main` roda os testes, compila o jogo e publica `dist/pwa` no GitHub Pages pelo workflow em `.github/workflows/pages.yml`.
