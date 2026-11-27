# Pendências, conflitos e decisões do Tales

**Atualizado em 27/11/2026.** Cada item diz o que está em jogo, a recomendação de Claude e o estado. Quando o Tales responder, mude o estado, registre em `docs/decisions/` (se técnico) ou na Memória Mestra (se de design), e não apague a linha.

## A. Conflitos entre documentos

| # | Conflito | Fontes | Estado |
|---|---|---|---|
| C1 | Divisão de trabalho: a Diretriz Mestra (27/11, seção 5) dizia que o design é do Tales com o ChatGPT e Claude só implementa; a Memória Mestra v1.5 (26/11) diz que Tales e Claude fazem design e código juntos. | Diretriz §5; Memória Mestra §1 | **RESOLVIDO em 27/11/2026.** Tales: "vc também tem direito dentro do jogo, pode dar ideias e melhorar oq quiser". Design colaborativo (Tales, Claude e ChatGPT quando ele quiser); ideias de Claude entram como PROPOSTA até o ok do Tales. Ver ADR-0007. |
| C2 | A Diretriz diz "o protagonista é um homem de origem humilde"; a v1.5 confirma que o jogador pode criar **rei ou rainha** (26/11). O jogo já permite as duas coisas. | Diretriz §2; Memória Mestra §4.2 | **Aguarda o Tales.** Recomendação: manter rei ou rainha (decisão mais recente e já implementada) e ler "homem" na Diretriz como texto antigo. |
| C3 | População: a Diretriz diz ~2,4 milhões; a decisão D6 reduziu a **área** para ~110 mil km² e **manteve** os 2,4 milhões. | Diretriz §2; Memória Mestra §8.5 | **Sem conflito.** Registrado só para ninguém tropeçar. |
| C4 | A Diretriz diz "não implemente sistemas cujas regras não foram aprovadas", mas a fundação (aprovada com "manda bala" em 26/11) já roda economia, legitimidade, decretos e Karsk com fórmulas PROPOSTA. | Diretriz §3 e §12; ESPEC_FUNDACAO §4 | **Aguarda o Tales.** Recomendação: manter o que já roda, marcado como PROPOSTA (o jogo precisa de números para ser jogável), e não **expandir** nenhum sistema sem aprovar as regras primeiro. |
| C5 | A Memória Mestra v1.5 §0.3 e §17 dizem que "não existe jogo funcional" e que arquitetura e código não foram desenvolvidos. Hoje existe a fatia da fase 1 no ar. | Memória Mestra §0.3, §17 | **Aguarda o Tales.** Recomendação: Claude propõe uma v1.6 só com correções de estado (sem mexer em lore) para o Tales aprovar. |
| C6 | `PROPOSTA_ATRIBUTOS_DO_SOBERANO.md` usa os nomes antigos das habilidades (Ler Pessoas, Instinto, Erudição, Retórica, Intriga, Carisma, Majestade, Armas, Vigor) nas seções 1, 2 e 6, embora a tabela traga os nomes CONFIRMADOS (Encanto, Língua de Prata, Leitor de Rostos, Tinta e Pó...). | PROPOSTA_ATRIBUTOS §1, §2, §6 | **Aguarda o Tales.** Recomendação: atualizar o texto para os nomes confirmados (correção de consistência, sem mudar regra). |
| C7 | `ESPEC_FUNDACAO.md` ainda aponta para `/mnt/project-files/imperium/codigo/` e para o artifact como lugar do código. A fonte da verdade agora é este repositório. | ESPEC_FUNDACAO §cabeçalho, §8 | **Aguarda o Tales.** Recomendação: corrigir os caminhos. |
| C8 | Os documentos de origem (GDD 1.0, Seção 24, Documento de Desenvolvimento 1.1, Atlas de Asterra 1.0, Dossiê de Eldoria 1.2) não estão no repositório; só os resumos na Memória Mestra. A v1.4 também ficou de fora. | Memória Mestra §18 | **Aguarda o Tales.** Se ele tiver os arquivos, vale anexar em `docs/design/origem/`. |
| C9 | A Memória Mestra (§9) aponta que o Mar Interior de Ordan no centro do continente conflita com Eldoria no centro, e não diz em que mar fica Altamar. O código assumiu Altamar no litoral norte do Mar de Ordan (PROPOSTA). | Memória Mestra §9; ESPEC | **PENDENTE de design.** |

## B. Decisões de design que travam módulos futuros

| # | Decisão | Trava | Estado |
|---|---|---|---|
| P1 | Elenco da fatia vertical (~40 personagens com nome, Conselho, chefes das casas, rede dos de baixo) | Personagens, Conselho, nomear e destituir, execução de ordens | PENDENTE |
| P2 | Regras de execução de ordens: quem executa, como decide cumprir, atrasar, distorcer ou sabotar | Decretos "de verdade" (pilar "ordenar não é ser obedecido") | PROPOSTA na Memória Mestra §5.3; falta especificação |
| P3 | Karsk: o que limita as tropas na fronteira (economia, guerra em outro front, política interna) | Corrigir o crescimento sem limite e a fase 4 | PENDENTE |
| P4 | Calibração da economia e da legitimidade: aprovar ou ajustar as fórmulas de `ESPEC_FUNDACAO.md` §4 e §5 | Passar sistemas de PROPOSTA para CONFIRMADO | PENDENTE |
| P5 | Vida privada, casamento, filhos e sucessão | Dinastia (D1) | PENDENTE |
| P6 | A Corrente e a religião | Ordem da Fé como instituição | PENDENTE |
| P7 | Texto livre por IA: qual serviço, custo, funcionamento offline e privacidade | Camada de texto livre (D3) | PENDENTE (técnico e de produto) |

## C. Decisões técnicas que precisam do ok do Tales

| # | Decisão | Recomendação | Estado |
|---|---|---|---|
| T1 | Manter TypeScript + motor próprio + PWA (ADR-0005) | Manter | PROPOSTA |
| T2 | Dividir `src/ui/app.ts` em telas e componentes; adotar ou não uma biblioteca de interface leve (Preact) quando a interface crescer (ADR-0006) | Dividir agora sem biblioteca; reavaliar ao entrar personagens | PROPOSTA |
| T3 | O que fazer com `pwa/` (cópia antiga do build) e `out/` no repositório | Apagar `pwa/` e `out/` e pôr `out/` no `.gitignore` (só com o ok, porque não fui eu que criei) | Aguarda o Tales |
| T4 | Mudar a publicação do GitHub Pages para "GitHub Actions" nas configurações do repositório | Necessário para o jogo atualizar sozinho | Aguarda o Tales (só ele consegue) |
| T5 | Proteger a `main` (exigir PR e CI verde) nas configurações do GitHub | Recomendado | Aguarda o Tales |

## D. Problemas técnicos encontrados (sem decisão de design)

Ver `docs/testing/RESULTADOS.md` para os detalhes e como reproduzir.

1. **Corrigido neste PR:** soldados de Rhovan podiam ficar negativos depois de incursões de Karsk.
2. Karsk acumula tropas sem limite (150 mil a 340 mil em 10 anos, em 30 de 30 sementes) e a guarnição de Rhovan chega a zero em todas. Depende de P3.
3. "Meses de soldo atrasado" explode (passa de 270) quando a guarnição encolhe, porque o atraso dos soldados que morreram ou desertaram continua contando sobre os que sobraram.
4. Uma guarnição com zero soldados nunca se recupera (o sistema de guarnições pula províncias sem soldados).
5. O salvamento cresce ~500 KB por ano de jogo (4,5 MB em 10 anos), porque os Fios guardados pelas memórias se acumulam.
6. As fontes vêm do Google Fonts e não ficam disponíveis offline na PWA.
7. Textos do motor usam `toLocaleString('pt-BR')`, que depende da instalação de idioma do ambiente.
8. Sem nenhuma ordem por 10 anos, 30 de 30 sementes chegam a humor −100 em alguma província, 6 perdem de 25% a 70% da população, e a Ordem nunca unge o soberano. Depende de P3 e P4.
