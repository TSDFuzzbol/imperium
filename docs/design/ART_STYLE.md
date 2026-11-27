# Imperium: guia de arte

**Estado: PROPOSTA** (27/11/2026). Tirado da imagem de referência que o Tales enviou (Valtheris vista do alto, audiência no salão do trono, mapa de províncias em pergaminho, ficha do rei, mercado). Nada aqui é cópia de outro jogo: os traços, a heráldica e os rostos são nossos.

## 1. Em uma frase
Fantasia baixa, escura e pintada: pedra fria, céu de chumbo, luz quente de vela e um único acento de ouro e de vinho. Os rostos são realistas e sérios, nunca cartum.

## 2. O que a referência mostra (e o que isso pede)
- **É pintura, não cartum.** Pinceladas visíveis, bordas que somem na sombra, muito detalhe em textura. Não há contorno preto em volta das figuras. Por isso este guia **não** adota cel-shading de 2 tons nem traço grosso de cartum, que estavam no modelo genérico de pedido.
- **Valor manda mais que cor.** Quase tudo vive entre 5% e 45% de luz. O olho vai para onde há contraste: rosto, chama, ouro, texto.
- **Temperatura dividida.** Luz quente (vela, tocha, ouro) contra sombra fria (pedra azulada, névoa). Cada cena tem uma fonte quente principal.
- **Um acento por tela.** O vermelho vinho (estandartes, tapete, capa) e o ouro (coroa, molduras, ícones) aparecem pouco, e por isso pesam.
- **Interface sóbria.** Painéis quase pretos com borda dourada fina, cantos retos, serifada clássica nos títulos, linhas finas separando atributos, ícones de linha dourada dentro de losangos.

## 3. Paleta (hex)
Cada família tem base, luz e sombra. Usar estes valores; cores novas só entram aqui antes de entrar no jogo.

| Família | Sombra | Base | Luz | Brilho | Uso |
|---|---|---|---|---|---|
| Breu (fundos, roupa preta) | `#0b0908` | `#16110d` | `#2a221c` | `#4a3e33` | fundo da interface, gibão, cabelo escuro |
| Pedra fria | `#1c1f24` | `#3a3d42` | `#5f646b` | `#8e939a` | muralhas, salão, céu de chumbo |
| Névoa | `#4b525b` | `#7d848c` | `#a9aeb3` | `#cfd2d4` | neblina, nuvens, distância |
| Ouro envelhecido | `#5c4318` | `#a9843c` | `#d9b765` | `#f3e2a6` | coroa, bordado, molduras, ícones |
| Vinho | `#3a0d10` | `#6e1c20` | `#a3343a` | `#c9545a` | estandartes, capa, tapete, alertas |
| Pergaminho | `#7d6845` | `#b9a275` | `#dcc89d` | `#efe2c2` | mapa, cartas, documentos |
| Pele clara | `#6e4434` | `#b98468` | `#dcae8f` | `#f0d2b8` | rosto (ver 5.3 para os outros tons) |
| Chama | `#8a3d12` | `#d9782a` | `#f2a648` | `#ffe2a0` | velas, tochas, janelas acesas |
| Verde profundo | `#16261f` | `#2c4a3c` | `#4f7a66` | `#86b09b` | matas, províncias, estados bons |

Cores da interface já usadas no jogo (manter): `--bg #16110d`, `--panel #211a14`, `--line #43362a`, `--ink #ecdfc4`, `--gold #d0a84f`, `--wine #b0434b`.

Regras de cor:
- Preto puro (`#000`) e branco puro (`#fff`) não existem. O mais escuro é `#0b0908`, o mais claro é `#f3e2a6` (ouro) ou `#efe2c2` (pergaminho).
- Sombra de pele puxa para o frio (mistura com `#2f3d58` a 30–40%). Luz de pele puxa para o quente (`#ffcf98`).
- Saturação alta só em chama, ouro e vinho, e só em áreas pequenas.

## 4. Forma, borda e traço
- **Sem contorno de cartum.** A forma se separa pelo valor (claro contra escuro), não por linha.
- **Linhas só onde a pintura teria uma pincelada escura:** a pálpebra de cima, a fenda da boca, a narina, a dobra da roupa. Essas linhas são **formas preenchidas** que afinam nas pontas (não `stroke` de largura fixa), em `#0b0908` a `#2a1a14`.
- **Quando usar `stroke`** (fios de cabelo, bordado, ícones): `stroke-linecap="round"`, `stroke-linejoin="round"`, largura entre 0,6 e 2,5 unidades no retrato de 600×800, e opacidade abaixo de 0,8 para não parecer vetor.
- **Bordas perdidas e achadas.** No lado iluminado a borda é nítida. No lado da sombra ela some no fundo (desfoque de 4 a 10 unidades).
- **Silhueta legível em 48 px.** Coroa, cabelo e ombros têm que reconhecer o personagem mesmo em miniatura.

## 5. Sombreamento
O modelo genérico pedia cel-shading de 2 tons. A referência é outra coisa. Proposta: **pintura em planos**.
1. **Base** (cor local em meia-luz).
2. **Plano de sombra** (uma forma grande, fria, com borda dura no terminador e macia no resto).
3. **Oclusão** (cantos onde a luz não chega: órbita dos olhos, sob o nariz, sob o queixo, entre cabelo e testa). Quase preto, desfocado.
4. **Plano de luz** (forma quente no lado da fonte).
5. **Brilhos** (pequenos, quase sem desfoque: ponta do nariz, lábio de baixo, brilho do olho, arestas do ouro).
6. **Luz de recorte** (rim light) fria no lado oposto à vela, fina, para soltar a figura do fundo.
7. **Grão** sobre tudo (`feTurbulence` com opacidade de 6 a 10%) para tirar o aspecto liso de vetor.

Gradientes são permitidos **só** como luz ambiente (fundo, vinheta, brilho de vela). Volumes se fazem com planos, não com degradê.

### 5.1 Luz padrão
Vela ou janela à **esquerda e acima** do personagem. Sombra no lado direito do rosto. Recorte frio à direita. Todas as peças devem seguir isso para que retratos lado a lado combinem.

### 5.2 Proporções dos personagens
- **Retrato de busto, 3:4** (`viewBox="0 0 600 800"`). A cabeça ocupa de 40% a 45% da altura. Os olhos ficam perto de 40% da altura do quadro.
- **Anatomia realista** (não cartum): olhos na metade da cabeça, nariz a 2/3 entre olhos e queixo, boca a 1/3 entre nariz e queixo, largura entre os olhos igual a um olho.
- Rosto levemente virado, olhar firme para o jogador ou para o lado. Expressão contida: o humor aparece em sobrancelha, pálpebra e canto da boca.
- Corpos inteiros (quando houver) com 7,5 cabeças de altura.

### 5.3 Tons de pele (base / sombra / luz)
`#f0d2b8 / #a9806a / #fbe6d3`, `#dcae8f / #8f6350 / #f0d2b8`, `#b98468 / #6e4434 / #dcae8f`, `#8a5b3e / #4a2c1e / #b07d5a`, `#5c3a28 / #2c1a12 / #82573c`.

## 6. Cenários
- Composição com **profundidade em 3 a 5 planos**: primeiro plano escuro e grande, meio com a ação, fundo claro e azulado pela névoa. Isso serve tanto para pintura quanto para parallax.
- Detalhe alto no meio, baixo no fundo. Ar e névoa separam os planos.
- Céu sempre nublado ou de entardecer. Nada de céu azul limpo.
- Cidades: telhados íngremes de ardósia e telha queimada, torres finas, muralhas em camadas, rio com pontes de pedra.

## 7. Interface
- Painéis `#16110d` a 85–92% de opacidade sobre a cena, com borda de 1 px em ouro escuro (`#8a6a2c`) e um filete interno mais fino.
- Títulos em EB Garamond, texto em Alegreya Sans (já no jogo). Nada de serifada fina em texto longo.
- Escolhas numeradas, com a escolhida em faixa de pergaminho rasgado (`#dcc89d` com texto `#16110d`).
- Ícones de linha em ouro, 1,5 px a 24 px, dentro de losango ou escudo. Todos no mesmo grid de 24×24.
- Heráldica de Eldoria é PENDENTE. A referência usa uma árvore branca. Proposta: árvore de galhos abertos com coroa acima, em ouro ou branco osso sobre vinho.

## 8. O que o SVG alcança e o que não alcança
| Peça | SVG | Pintura (PNG/JPG) |
|---|---|---|
| Interface, molduras, ícones, heráldica | Sim, perfeito | Não precisa |
| Retratos | Sim, em camadas animáveis, com qualidade de "pintura vetorial". Fica abaixo de uma pintura de verdade em textura de pele e cabelo | Opcional no futuro, como camada de base sob olhos e boca em SVG |
| Mapa de províncias | Sim (já é SVG) com textura de pergaminho | Textura opcional |
| Cenas grandes (Valtheris do alto, salão, mercado) | Só como silhueta e camadas temporárias. Não chega no nível da referência | **Sim. É aqui que entram as pinturas** em `assets/backgrounds/` |

**Proposta híbrida:** interface, ícones, retratos e mapa em SVG (leves, nítidos em Retina, animáveis por código). Cenas grandes em PNG/JPG pintadas, com o SVG de camadas como substituto até as pinturas chegarem.

## 9. Regras técnicas dos arquivos SVG
- Um arquivo por peça em `assets/svg/`, nome em minúsculas com hífen: `soberano.svg`, `fundo-valtheris-parallax.svg`.
- `viewBox` justo, sem `width`/`height` fixos, para escalar nítido em Retina.
- Grupos nomeados em português: `<g id="cabeca">`, `<g id="olho-esq">`, `<g id="coroa">`. Toda parte que se mexe é um grupo próprio, com o ponto de giro anotado em `data-pivo="x y"`.
- Camadas de parallax: `<g id="camada-…" data-profundidade="0..1">` (0 = fica parado, 1 = acompanha o dedo).
- Ids internos de `defs` com prefixo da peça (`sob-…`) para não colidir quando vários SVGs estiverem na mesma página.
- Filtros pesados (desfoque, grão) ficam em grupos que **não** se animam, porque cada quadro animado refaz o filtro no iPhone.
- Tamanho alvo: retrato até 60 KB, fundo até 80 KB.

## 10. Fundos pintados (`assets/backgrounds/`)
- Formato: JPG (qualidade 80) para cenas, PNG só se houver transparência.
- Tamanho: 1290×2796 (iPhone em pé, 3×) ou 1170×2532. Manter o centro de interesse no terço do meio, porque o topo e a base ficam sob o cabeçalho e a barra de navegação.
- Nome: `cena-salao-trono.jpg`, `cena-valtheris-alto.jpg`, `cena-mercado.jpg`.
- Para parallax com pintura: exportar em camadas PNG (`cena-x-fundo.png`, `cena-x-meio.png`, `cena-x-frente.png`).
