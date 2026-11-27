# Avaliação tecnológica

**27/11/2026 · PROPOSTA técnica (ADR-0005), aguarda o ok do Tales.**

## Pergunta
Qual base técnica sustenta um jogo de simulação profunda, para celular, distribuído primeiro como PWA (D5, CONFIRMADO), desenvolvido por sessões de IA na nuvem e revisado pelo celular?

## Critérios (da Diretriz Mestra §8), com peso

| Critério | Peso | Por quê |
|---|---|---|
| Simular muitas entidades | 3 | Centenas de personagens, dezenas de grupos e instituições, 8 a 50 províncias |
| Desempenho em celular | 3 | iPhone é o alvo |
| Interface rica e adaptável | 3 | O jogo é muito texto, rostos, mapas e listas; "muito visual" |
| Testabilidade e depuração | 3 | Determinismo, cadeias causais, sementes |
| Distribuição mobile | 2 | PWA primeiro, lojas talvez depois |
| Persistência | 2 | Saves longos, exportar e importar |
| Manutenção por sessões de IA na nuvem | 3 | Sem computador do responsável; tudo tem que rodar em CI e na nuvem |
| Expansão | 2 | Fases 3 a 8 |

## Opções avaliadas

| Opção | Pontos fortes | Pontos fracos | Nota (0–5 ponderada) |
|---|---|---|---|
| **A. TypeScript + motor próprio + interface web + PWA (atual)** | Já funciona e está testado; motor roda igual no Node (testes) e no navegador; interface de texto e listas é o ponto forte da web; PWA sem loja (D5); CI simples; sessões na nuvem rodam tudo; tamanho pequeno (~350 KB) | JavaScript é mais lento que código nativo; precisa de disciplina para não travar a tela (Web Worker); mapa animado complexo exige cuidado | **4,5** |
| B. A + biblioteca de interface leve (Preact ou Solid) | Mesmo motor; componentes reativos facilitam telas complexas | Mais uma dependência; reescrever telas que funcionam | 4,4 (é uma variante de A, ver ADR-0006) |
| C. Godot (GDScript ou C#) com exportação web e mobile | Editor de jogo, animação, mapa 2D forte; exporta para lojas | Interface de texto densa é pior que web; build web pesado (dezenas de MB); C# não exporta para web no Godot 4; editor visual não roda pelo celular; testes headless mais trabalhosos; jogaria fora o código que funciona | 2,8 |
| D. Unity (C#) | Ecossistema enorme; desempenho nativo; lojas | Licença e build pesados; WebGL ruim em iPhone; editor obrigatório (sem celular); UI de texto trabalhosa | 2,3 |
| E. Núcleo em Rust compilado para WebAssembly + interface web | Desempenho máximo do motor; determinismo forte | Duas linguagens; ciclo de compilação mais lento; depurar Fios e textos fica mais difícil; ganho de velocidade hoje desnecessário (10 anos em 0,5 s) | 3,2 |
| F. React Native / Flutter | Apps nativos de loja | Não é PWA; motor teria que ser reescrito (Flutter) ou rodar em ponte JS (RN); lojas não são prioridade (D5) | 2,6 |

## Recomendação

**Manter a opção A**, com quatro reforços técnicos:

1. **Web Worker para a simulação** (etapa E2) quando o mundo crescer: a tela nunca trava, mesmo com centenas de personagens.
2. **Persistência versionada** (E1): número de versão, migrações testadas, vários espaços de salvamento, orçamento de tamanho.
3. **Interface em módulos** (M0, ADR-0006): dividir `app.ts`; avaliar Preact apenas se o custo de manter telas na mão ficar alto.
4. **Capacitor** como caminho futuro para lojas, embrulhando a mesma PWA, se o Tales decidir publicar em lojas com conteúdo desligável (Memória Mestra §7.4).

### Por que não trocar
- O motor atual já cumpre os requisitos técnicos centrais (determinismo, serialização, Fios, testes) e roda rápido.
- O gargalo do projeto é **design e conteúdo de simulação**, não velocidade de execução.
- Um motor de jogo com editor visual (Godot, Unity) quebra o fluxo "tudo pela nuvem e pelo celular".

### Limites conhecidos (sem esconder)
- Se um dia houver milhares de personagens individuais simulados todo dia, o JavaScript pode não bastar. Mitigação: níveis de detalhe (Memória Mestra §6.3: personagens, grupos, instituições) e, só se medido, mover o sistema mais pesado para WebAssembly.
- Safari no iOS pode apagar dados de sites pouco usados. Mitigação: exportar save, lembrar o jogador, e instalar como app (o que reduz o risco).
- Mapas com muita animação exigem Canvas ou WebGL em vez de SVG; hoje o mapa é SVG e funciona.

## Como medir para reavaliar
O teste `tests/longrun.test.ts` mede o tempo de um ano de jogo. Reavaliar esta decisão se um ano de jogo passar de 2 segundos num iPhone de 3 anos atrás, ou se o save passar de 20 MB num reinado longo depois da etapa E1.
