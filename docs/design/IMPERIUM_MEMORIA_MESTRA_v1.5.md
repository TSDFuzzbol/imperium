# IMPERIUM — Memória Mestra do Projeto

**Documento de continuidade | Versão 1.5 | Atualizado em 26/11/2026**

> Fonte única de verdade do projeto IMPERIUM. Deve ser lida antes de qualquer sessão de design ou de código. Atualize-a sempre que uma decisão for confirmada, um sistema for desenvolvido ou uma pendência mudar de estado.

---

## 0. Como usar este documento

### 0.1 Legenda de status

Todo conteúdo tem um destes três status. Quando uma seção não marca o status de um item, vale o status do título da seção.

- **CONFIRMADO:** o Tales decidiu. Só muda se ele mudar.
- **PROPOSTA:** desenvolvido pela equipe (Tales + Claude, ou trabalho herdado do ChatGPT) e ainda não aprovado. Pode ser usado como base de trabalho, mas não como canon.
- **PENDENTE:** ainda não existe ou depende de uma decisão. A seção 16 lista as decisões abertas.

### 0.2 Regras de manutenção

- Uma única fonte de verdade, com versão e data.
- Não transformar PROPOSTA em CONFIRMADO sem o ok explícito do Tales.
- Não apagar decisões antigas sem registrar a mudança e o motivo no registro de versões (seção 19).
- A correção mais recente do Tales prevalece.
- Ao fim de cada sessão relevante, registrar as decisões novas, o conteúdo desenvolvido, as questões abertas e o próximo passo.
- Não afirmar que o arquivo foi atualizado se a gravação não foi concluída.
- Para retomar o trabalho numa conversa nova: "Continue o IMPERIUM. Leia a Memória Mestra mais recente e atualize-a no final."

### 0.3 Estado real do projeto

Até esta versão, o IMPERIUM é **design e documentação**. Não existe jogo funcional do Imperium. Existiu um protótipo anterior, "Coroa de Vésper", com outra lore; ele **não é canon** do Imperium, mas deixou lições registradas na seção 13.3.

---

## 1. Divisão de trabalho

**CONFIRMADO pelo Tales em 26/11/2026:** "a partir de agora eu e você vamos fazer o jogo". Tales e Claude fazem juntos o **design e a implementação**.

- **Tales:** visão, gosto, decisões finais de design e lore, aprovação de propostas, testes de jogo.
- **Claude:** propostas de design (sistemas, lore, personagens, interface), crítica de design, especificações por módulo, programação, testes e relatório honesto de limites técnicos.
- **Regra de convivência:** o Claude propõe com liberdade e marca tudo como PROPOSTA. Antes de mudanças grandes no jogo, o Claude explica a proposta em português e espera o ok (o Tales pediu para entender antes de ver código).

**Histórico (substituído):** de 21/11 a 26/11/2026, o design era feito por Tales + ChatGPT ("Luna") e o Claude só implementaria. O protocolo de transferência daquela época continua útil e foi mantido como regra de engenharia na seção 14.3.

---

## 2. Visão

### 2.1 Ficha

- **Nome:** IMPERIUM. *(CONFIRMADO; o significado do nome no mundo está PENDENTE, ver 8.6)*
- **Gênero:** simulação dinástica e política com RPG de personagem, com grand strategy no longo prazo.
- **Plataforma:** celular, tela vertical, toque. *(CONFIRMADO)*
- **Idioma:** português. *(CONFIRMADO)*
- **Ambientação:** low fantasy medieval, no continente de Asterra.
- **Atmosfera:** equilíbrio entre realismo histórico, decadência sombria e épico.
- **Sobrenatural:** conhecido publicamente e às vezes testemunhável, mas raro, ambíguo e pouco compreendido. Nunca vira magia convencional de RPG.
- **Início:** o **reino** é estabelecido e funcional; o **rei** é novo, recém-coroado e contestado. *(correção da v1.4, que dizia "rei estabelecido")*
- **Referências de espírito:** a vida pessoal de The Sims, a política de personagens de Crusader Kings, a dureza sistêmica de Project Zomboid. Sempre original (seção 6.2).
- **Rejeitado pelo Tales (CONFIRMADO):** o estilo Reigns, com cartas e barras de 0 a 100 que encerram o jogo ao chegar a um extremo. Recursos são quantidades reais e sem teto (moedas, comida, soldados, população). O rei morre como pessoa (idade, doença, assassinato, batalha, praga), não porque uma barra zerou.

### 2.2 Fantasia central

**CONFIRMADO:** governar um reino vivo, em que economia, política, população, personagens, diplomacia, guerra, religião e dinastia reagem às decisões do jogador.

**PROPOSTA de formulação para o jogador:** *"Ontem você limpava os corredores deste castelo. Hoje todos se curvam para você, e metade deles quer você morto. Você pode ordenar quase tudo. Descubra quem vai obedecer."*

### 2.3 Frases-guia (CONFIRMADO)

- "O jogador governa. O mundo responde. A história registra."
- "O rei pode tentar fazer praticamente qualquer coisa. O mundo não é obrigado a aceitar."
- "O primeiro desafio não é vencer uma guerra. É descobrir qual problema pode esperar e qual não pode."
- "Inspiração pode orientar. Nunca pode substituir a identidade."
- "IMPERIUM deve ser reconhecido pela qualidade da simulação, não pela quantidade de menus."

### 2.4 Pilares de design (PROPOSTA)

Quatro pilares para filtrar qualquer ideia nova. Uma ideia que não serve a pelo menos um pilar fica de fora.

1. **O rei que veio de baixo.** O passado humilde do protagonista muda o jogo de verdade: o que ele sabe, quem confia nele, quem o despreza e o que ele vê que os nobres não veem.
2. **Ordenar é fácil; ser obedecido, não.** Toda ordem passa por autoridade, capacidade, obediência e legitimidade (seção 5.2).
3. **Todo efeito tem um porquê visível.** O jogador sempre pode perguntar "por que isso aconteceu?" e receber a cadeia de causas (os "Fios", seção 12.3). Sem isso, a emergência parece aleatoriedade.
4. **O reino lembra.** Promessas, humilhações, favores e mortes deixam marcas que voltam meses ou anos depois.

---

## 3. Experiência do jogador (PROPOSTA, seção nova)

Esta seção não existia. Ela descreve o que o jogador **faz**, e serve de guia para a fundação técnica.

### 3.1 O recurso escasso: o tempo do rei

O rei não tem barras. O que ele não tem é **tempo e atenção**. Cada semana tem poucos momentos livres, por exemplo:

- **Audiências:** receber pessoas (nobres, mercadores, camponeses, emissários). Quem não é recebido espera, se ofende ou age por conta própria.
- **Conselho:** ouvir relatórios, debater, decretar.
- **Viagem e presença:** ir a uma província, aparecer em público, visitar tropas, comparecer a um funeral.
- **Vida privada:** família, amantes, amigos antigos, descanso, estudo. O rei é uma pessoa com necessidades; negligenciá-las tem custo (estresse, saúde, relações).

Escolher **quem ouvir e o que ignorar** é a decisão central. Isso traduz o princípio da abertura em mecânica, e é rápido de jogar no celular.

### 3.2 Os verbos do rei

Ouvir · Perguntar e investigar · Decretar · Nomear e destituir · Prometer e negociar · Recompensar · Punir e perdoar · Viajar · Aparecer em público · Confiar um segredo · Cortejar · Esperar.

"Esperar" é um verbo de verdade: deixar um problema amadurecer é uma escolha, às vezes a melhor.

### 3.3 Core loop em três camadas

1. **O momento (segundos a minutos):** uma pessoa está diante do rei com um pedido, uma notícia ou uma ameaça. O rei responde, pergunta ou ordena. A reação aparece no rosto e nas palavras dela, e às vezes nos rostos de quem assiste.
2. **A estação (10 a 20 minutos de jogo):** o jogador monta a agenda, emite decretos e delega. O tempo corre. Relatórios chegam, com fontes e graus de certeza. As consequências aparecem, e os Fios mostram por quê. O jogo pausa sozinho quando algo exige o rei.
3. **O reinado (horas):** legitimidade com cada grupo, o problema do sucessor, a transformação do reino, o mistério do rei antigo, a guerra que se aproxima. A Crônica registra tudo.

### 3.4 Uma sessão típica de 10 minutos

1. Abrir o app e ver o resumo da semana: três coisas mudaram enquanto o jogador estava fora, cada uma com um rosto.
2. Escolher duas audiências entre cinco pedidos. Um conde ofendido vai lembrar de quem ficou de fora.
3. Na audiência, o tesoureiro pede para adiar o pagamento de Rhovan. Um criado antigo cochichou antes que o tesoureiro tem dívidas com a Liga Mercantil.
4. Decretar: pagar Rhovan em segredo com o tesouro privado e mandar investigar o tesoureiro.
5. Deixar o tempo correr até o próximo momento que exige o rei.

### 3.5 Momentos de assinatura

Cenas que o jogador deve contar para um amigo. Elas surgem da simulação, não de roteiro fixo, mas o design garante que sejam possíveis:

- Um duque se recusa a se ajoelhar diante da corte inteira, e todos olham para o rei.
- Um velho amigo da cozinha avisa que o vinho do banquete não deve ser bebido.
- Uma carta do rei antigo, guardada para "quando ele estiver pronto", muda o que o jogador acha que sabe.
- O primeiro decreto de execução, e o silêncio da praça.
- O nascimento de um filho de sangue plebeu, que metade do reino não aceita como herdeiro.
- Um governador cumpre a ordem ao pé da letra para humilhar o rei.
- Um soldado de Rhovan conta que os salários atrasados foram desviados, e não esquecidos.

### 3.6 Fim, derrota e objetivo

- **Não existe "vitória".** Existe a Crônica. *(PROPOSTA)*
- **O reinado termina** com a morte do rei (idade, doença, assassinato, batalha, praga), com deposição, abdicação ou exílio.
- **Ao terminar,** o jogo escreve o legado: como ele será lembrado por cada grupo, o que mudou no reino, quem veio depois.
- **CONFIRMADO em 26/11/2026 (D1):** a campanha principal é **a vida deste rei**. Quando o reinado dele termina, a Crônica fecha o capítulo, e o jogador pode **continuar com o sucessor** que ele deixou (ou que o mundo impôs). A pergunta "quem vem depois de um rei sem sangue real?" é o clímax natural da campanha.
- **Marcos que dão direção sem trilho:** ser aceito pela corte; sobreviver ao primeiro ano; ter um sucessor aceito; descobrir por que foi escolhido; vencer ou evitar a guerra com Karsk; deixar o reino mais rico, mais justo, mais temido ou mais livre (o jogador escolhe que tipo de rei quer ser).

### 3.7 Onboarding diegético

O rei é um homem humilde que **também não sabe governar**. A ignorância dele é o tutorial:

- Os sistemas aparecem quando o rei aprende sobre eles. O tesoureiro explica o tesouro porque o rei pergunta; o marechal explica o exército na primeira inspeção.
- Os primeiros dias da campanha "O Peso da Coroa" apresentam uma crise por vez, mesmo com as oito já em andamento no mundo.
- As abas da interface "acendem" aos poucos, como conhecimento conquistado.
- O jogador pode estudar à noite (vida privada) para destravar mais detalhe, o que também é uma escolha de tempo.

---

## 4. O rei protagonista

### 4.1 Origem e sucessão extraordinária (CONFIRMADO em 26/11/2026)

- Pessoa de origem humilde (homem ou mulher, ver 4.2), sem linhagem real, escolhido pessoalmente pelo rei antigo por uma relação genuína de confiança e afeto.
- O rei antigo não deixou filhos nem herdeiros diretos. A morte dele transformou essa escolha numa sucessão extraordinária e politicamente explosiva.
- O protagonista **não é** príncipe secreto, herdeiro perdido nem escolhido por profecia.
- A escolha deve ter um motivo humano, íntimo e convincente, que revele algo sobre os dois homens e sobre o reinado anterior.
- A origem pode ser muito humilde. "Criado, servente, faxineiro" é uma referência de escala social, não uma profissão já fixada.
- A nomeação cria uma crise de legitimidade, sucessão, precedência e poder, e cada grupo (aristocracia, Conselho, Igreja, exército, povo) reage de um jeito.
- O rei antigo morreu 11 dias antes do início da campanha; a coroação já foi feita.

### 4.2 O rei é o jogador (CONFIRMADO pelo Tales em 26/11/2026, D8)

- **O jogador cria o próprio rei.** Não existe biografia fixa: nome, aparência, passado, caráter e capacidades saem da criação de personagem.
- **O jogador pode criar um rei ou uma rainha** de origem humilde (CONFIRMADO pelo Tales em 26/11/2026). Isso substitui o "um homem de origem humilde" da v1.3/v1.4. O gênero muda a política (casamento, gravidez, sucessão, reação da Igreja e das casas), não os sistemas. Onde este documento diz "o rei", leia "o soberano".
- **O que é fixo é a premissa:** o rei antigo gostava dele pessoalmente e sentia que ele seria o melhor sucessor ao trono. Ele veio do nada (como um faxineiro) e simplesmente subiu ao trono.
- O Tales rejeitou, em 26/11, as três versões de rei pronto (Ivo, Bram e Mateus). Elas viraram matéria-prima para os ofícios da criação de personagem (ver `PROPOSTAS_DO_REI_v2.md`).

### 4.3 Criação do soberano em quatro passos (estrutura CONFIRMADA pelo Tales em 26/11/2026; listas e efeitos exatos são PROPOSTA)

A criação de personagem conta a história de como ele chegou ao trono. O jogador não escolhe números; escolhe a vida que viveu, e os números saem dela. Detalhes completos em `PROPOSTAS_DO_REI_v2.md`.

1. **Quem você era (o ofício humilde):** faxineiro dos corredores, cozinheiro, cavalariço (não sabe ler), copista da biblioteca, lavadeiro, ajudante do carrasco, jardineiro... Cada ofício dá forças e fraquezas reais e define a rede dos de baixo dele.
2. **De onde você veio:** província e família de origem; gente lá fora que é apoio e ponto fraco.
3. **Por que o rei gostava de você (o laço):** "eu o fazia rir", "eu nunca menti para ele", "eu cuidei dele quando ninguém cuidava", "eu salvei a vida dele". Cada laço muda o que o rei antigo deixou e o primeiro segredo ou inimigo que ele carrega.
4. **Quem você é:** rei ou rainha, aparência, idade (de 20 a 60, e a idade pesa), até três traços que mudam com a vida, e nome.

A criação acontece como memória: a primeira cena é o jogador, ainda com a vassoura, chamado ao quarto do rei moribundo. Depois, um corte para 11 dias mais tarde, com a coroa na cabeça.

Nome de trabalho do rei antigo: **Teodoro III**, que reinou 31 anos e morreu aos 68 sem filhos *(PROPOSTA)*.

### 4.4 Legitimidade contínua (direção CONFIRMADA pelo Tales em 26/11/2026, D9)

**Rejeitado pelo Tales em 26/11:** o "Ano da Prova" (um ano de prazo e um julgamento das casas que podia depor o rei), por ficar arcade. **Regra que fica:** nada de timers, fases ou chefe final na legitimidade.

- **Base legal frágil:** Teodoro III nomeou o plebeu sucessor por um ato de vontade (adoção pelas leis antigas do Imperium, testamento, ou os dois; o detalhe é PROPOSTA). A lei é só um argumento, que cada grupo aceita ou rejeita conforme lhe convém.
- **Várias fontes de legitimidade**, pesadas de forma diferente por cada grupo: lei, sagrado (unção pela Ordem da Fé), força (as tropas obedecem?), povo, costume (o tempo no trono, que cresce devagar e cai com crises) e sangue (que ele não tem, e só se compensa com descendência e casamentos).
- **A contestação sobe e desce por degraus, de forma emergente:** murmúrio → recusa (homenagem negada, unção adiada, ordens "esquecidas") → alternativa (surge um pretendente) → conspiração → ruptura (rebelião, golpe, excomunhão, deposição). Cada grupo decide sozinho até onde ir, e grupos diferentes podem estar em degraus diferentes.
- **O começo do reinado é naturalmente o mais perigoso** (pouco costume, sem unção, pretendente fresco) sem que nenhuma regra ou relógio diga isso.
- Legitimidade nunca é "vencida": é cuidada, perdida e reconquistada durante o reinado inteiro, e os Fios mostram por que cada grupo está contra ou a favor.

### 4.5 Outras propostas para transformar a origem em mecânica (PROPOSTA)

- **A rede dos de baixo:** criados, cozinheiros, lavadeiras, guardas e cavalariços que conheceram o rei antes da coroa. Eles ouvem o que os nobres dizem na frente de "ninguém" e trazem rumores que o Conselho esconde. É a vantagem única deste rei. Custo: usar essa rede às claras confirma, para a nobreza, que ele continua "um criado"; e os amigos antigos querem coisas, se ofendem, envelhecem e podem ser comprados.
- **Habilidades de quem veio de baixo:** o rei entende preços de pão, fome e trabalho de um jeito que nenhum nobre entende. Isso aparece como percepção melhor de alguns relatórios (sabe quando o intendente mente sobre comida) e pior de outros (etiqueta, heráldica, diplomacia formal).
- **As cartas do rei antigo:** o rei antigo deixou cartas e um diário, entregues aos poucos por alguém de confiança, ou encontrados em lugares do castelo. O motivo da escolha é o mistério do primeiro ato. A revelação deve mudar a leitura que o jogador faz da corte.

---

## 5. Soberania do jogador

### 5.1 Poder do rei (CONFIRMADO em 26/11/2026)

O rei tem autoridade soberana ampla, inclusive para mudar a estrutura da corte e do governo. Conforme as condições do mundo e a capacidade de execução, ele pode:

- nomear, demitir e substituir conselheiros, ministros, comandantes, governadores e funcionários;
- elevar pessoas de origem humilde a posições de poder;
- criar, extinguir, dividir, fundir ou renomear cargos;
- reorganizar o Conselho, criar ministérios, ordens, tribunais e instituições, dissolver estruturas ou governar sem Conselho formal;
- conceder ou retirar títulos, terras, privilégios e honrarias;
- alterar leis, impostos, costumes oficiais, jurisdições e regras administrativas;
- centralizar o poder ou conceder autonomia;
- ordenar punições, prisões, exílios, perdões e execuções.

A lista é ilustrativa, não um catálogo fechado.

### 5.2 Ordenar não é ser obedecido (CONFIRMADO)

Poder absoluto não é controle absoluto das consequências. A simulação distingue:

1. **Autoridade formal:** o que a lei e a posição permitem ordenar.
2. **Capacidade prática:** recursos, tempo, informação e aparato para executar.
3. **Obediência institucional:** quanto funcionários, tropas, nobres e instituições cumprem.
4. **Legitimidade:** quanto cada grupo considera a ordem e o governo aceitáveis.

Exemplos: demitir o marechal não garante a lealdade dos generais; confiscar terras pode levar uma casa a financiar rebelião; dissolver uma instituição religiosa não apaga a fé; elevar um plebeu humilha a aristocracia e cria novos aliados e inimigos.

### 5.3 Como uma ordem existe na tela: Decretos compostos (PROPOSTA)

Para que "quase tudo" caiba numa tela vertical sem virar um catálogo de botões:

- **Um decreto = verbo + alvo + modo.**
  - Verbos: nomear, destituir, criar, abolir, taxar, isentar, conceder, confiscar, prender, perdoar, executar, exilar, proibir, permitir, construir, enviar, investigar, convocar, casar, prometer...
  - Alvos: uma pessoa, um cargo, uma instituição, uma lei, um grupo, uma província, um assentamento, um Estado.
  - Modo: público ou secreto; prazo; a quem encarregar a execução; com que força (pedido, ordem, ordem sob ameaça).
- Antes de assinar, o rei vê uma **previsão incerta** dada pelos conselheiros, que pode estar errada ou ser mentirosa ("o tesoureiro acha que os mercadores vão aceitar").
- Depois de assinar, o decreto vira uma **ordem em andamento**: alguém precisa executá-la, e essa pessoa pode cumprir, atrasar, distorcer ou sabotar.
- **Camada de texto livre (CONFIRMADO em 26/11/2026, D3: decretos compostos como base, texto livre como extra):** o rei escreve a ordem com as próprias palavras; uma IA a converte num decreto estruturado, que o rei confirma. A simulação só processa o decreto estruturado, o que a mantém determinística, rápida e testável.

---

## 6. Princípios de simulação e originalidade

### 6.1 Requisitos centrais (CONFIRMADO em 26/11/2026)

A simulação deve ser profunda e interdependente. Decisões num sistema podem desencadear cadeias de consequências em muitos outros, inclusive indiretas e não roteirizadas. O IMPERIUM não deve ser um jogo de menus, eventos roteirizados e números que só mudam com um clique. O jogador governa dentro do mundo; não é o centro de tudo que acontece.

1. **Mundo persistente:** províncias, assentamentos, populações, famílias, personagens, instituições, exércitos, rotas e Estados mantêm estado. O tempo muda o mundo mesmo sem o jogador.
2. **Causalidade sistêmica:** decisões têm efeitos diretos e indiretos.
3. **Interdependência real:** nenhum sistema é um minijogo isolado; todos trocam dados por regras explícitas.
4. **Agência independente:** personagens, casas, facções, cidades, instituições e governos perseguem objetivos próprios.
5. **Informação imperfeita:** ninguém é onisciente, nem o jogador. Agentes agem pelo que sabem, acreditam e ouvem.
6. **Memória e continuidade:** promessas, favores, humilhações, guerras, tratados, dívidas e crimes deixam registros.
7. **Emergência, não só roteiro:** eventos escritos à mão podem existir, mas coexistem com a simulação e respeitam o estado do mundo.
8. **Consequências proporcionais:** escala, tempo, distância, capacidade administrativa e condições locais importam.
9. **Mundo estrangeiro ativo:** os outros Estados têm política, economia e sucessões próprias.
10. **História registrável:** crônicas, relatórios e histórico de personagens permitem entender como o mundo chegou ao estado atual.
11. **Determinismo e depuração:** sementes reproduzíveis, logs de causalidade, ferramentas de inspeção e testes.
12. **Desempenho sem simulação falsa:** agregação e níveis de detalhe são permitidos, desde que preservem coerência causal.
13. **Testabilidade:** cada sistema tem estados, regras, entradas, saídas, invariantes e critérios de aceitação. Testar cadeias, não só funções.
14. **Transparência:** o Claude sinaliza limites técnicos e compromissos antes de simplificar algo importante.

**Exemplo aprovado como direção:** aumentar impostos para financiar uma guerra pode elevar preços e reduzir o poder de compra, afetar consumo, produção, crédito e arrecadação futura; comerciantes pressionam, trabalhadores protestam, nobres financiam oposição, a Igreja condena, tropas exigem pagamento e um vizinho explora a instabilidade. Essa cadeia emerge de regras e agentes, não de roteiro.

**PENDENTE de desenho técnico:** mecânicas específicas, fórmulas, granularidade, frequência de atualização e algoritmos. O Tales quer conversar sobre os sistemas antes de fechá-los.

### 6.2 Originalidade (CONFIRMADO)

- Referências servem para estudar problemas e princípios abstratos, nunca como moldes.
- Não copiar universos, personagens, lore, interfaces, sistemas distintivos ou combinações reconhecíveis de outros jogos.
- Complexidade não é profundidade. Mais menus, números ou subsistemas não tornam o jogo melhor.
- A qualidade se mede pela coerência causal, pela interdependência, pela agência dos habitantes e pelas histórias emergentes.
- Se for preciso simplificar, preservar a singularidade e a causalidade central.

### 6.3 Três níveis de agentes (PROPOSTA)

Para que a profundidade caiba num celular sem simulação falsa:

1. **Personagens com nome** (de 40 a 150 na fatia vertical): simulados individualmente, com traços, memória, objetivos, relações e segredos.
2. **Grupos de população:** cada província tem estratos (por exemplo camponeses, artesãos, mercadores, clero, nobreza local, soldados), cada um com tamanho, renda, necessidades, humor, crença e memória coletiva. São agregados, não indivíduos.
3. **Instituições:** casas nobres, facções, a Igreja, a Liga Mercantil, guarnições, cidades. Têm recursos, interesses e liderança (que são personagens do nível 1).

Personagens podem "subir" para o nível 1 quando importam (o camponês que liderou a revolta ganha nome e memória).

---

## 7. Tom e conteúdo adulto (CONFIRMADO)

A identidade do jogo inclui violência brutal e sensualidade adulta, integradas à narrativa e aos sistemas.

### 7.1 Violência

Batalhas sangrentas, massacres, execuções públicas, punições físicas, ferimentos permanentes, mutilações, tortura como tema e instrumento de repressão ou investigação, assassinatos políticos, saques, ocupações e destruição. A violência sempre tem consequências: moral militar, estabilidade, reputação, resistência, diplomacia, trauma e memória coletiva. Nunca é só decoração nem recompensa sem custo.

### 7.2 Sensualidade e relações adultas

Nudez, erotismo não gráfico, sedução, amantes, adultério, escândalos, casamentos políticos ou afetivos, concubinato, ciúme, prostituição como instituição social e econômica, fertilidade, gravidez, descendência, reputação sexual, intimidade e conflitos conjugais. Personagens em situações sexuais são sempre adultos. O erotismo pode ser intenso, mas não vira descrição pornográfica gráfica.

### 7.3 Consequências

Relacionamentos geram disputas sucessórias, escândalos rompem alianças, execuções consolidam a Coroa ou provocam revoltas, massacres mudam a relação entre povo e governo. A moralidade varia por cultura, religião, classe e instituição.

### 7.4 Distribuição (CONFIRMADO em 26/11/2026, D5: PWA primeiro)

Nudez e tortura limitam a publicação na App Store e na Google Play. Como PWA (site instalável no celular), não há esse limite. Possíveis caminhos: PWA primeiro; ou uma opção de "conteúdo explícito" desligável para lojas. A visão não muda. **Decisão do Tales:** o jogo sai primeiro como PWA, com o conteúdo adulto como planejado; publicação em lojas pode vir depois, com conteúdo desligável.

---

## 8. O mundo: Asterra e Eldoria

### 8.1 Asterra

- **Continente:** Asterra, cerca de 4,8 milhões de km².
- **Ano inicial:** 1427 do Calendário Imperial.
- **História recente:** a Guerra Continental terminou há 23 anos com a Paz dos Tronos.
- **Estados:** Eldoria e sete potências estrangeiras (Valedorn, Aurel, Karsk, Edria, Theryn, Mordane e Serevan), além de territórios independentes menores.

A lista de Estados e o conceito geral vêm do GDD fundador. Divisões territoriais detalhadas são PROPOSTA.

### 8.2 Eldoria, o reino do jogador

- Monarquia estabelecida, capital Valtheris.
- População estimada: 2,4 milhões. Área: cerca de 110.000 km² (CONFIRMADO em 26/11/2026, D6; a v1.4 propunha 420.000 km²). Densidade de cerca de 22 habitantes por km².
- Reino funcional com dívida administrável, aristocracia poderosa, exército parcialmente financiado, Igreja influente e tropas de Karsk se movendo na fronteira oriental.
- Campanha inicial: **"O Peso da Coroa"**, no Castelo de Valtheris.

### 8.3 As oito províncias (função CONFIRMADA; detalhes PROPOSTA)

| # | Província | Função | População proposta | Perfil desenvolvido (PROPOSTA) |
|---|---|---|---:|---|
| 1 | Valtheris | Administração, comércio, serviços | 390.000 | A mais urbana: capital, palácio, tesouro, tribunais, catedral, aristocracia |
| 2 | Altamar | Portos e navegação | 310.000 | Principal saída marítima: pesca, sal, construção naval, importações, tarifas |
| 3 | Veyra | Agricultura e grãos | 470.000 | Celeiro do reino; vulnerável a clima e pragas |
| 4 | Dornhelm | Mineração e metalurgia | 250.000 | Ferro, cobre, carvão, armas; dependência estratégica da Coroa |
| 5 | Caldris | Pecuária e têxteis | 330.000 | Lã, couro, tecidos, curtumes, tinturarias |
| 6 | Merovan | Comércio e estradas | 290.000 | Rotas, mercados, crédito, pedágios, feiras |
| 7 | Rhovan | Fronteira militar | 190.000 | Fronteira com Karsk; guarnições, fortalezas, baixa densidade, custo militar alto |
| 8 | Esteren | Florestas, madeira, caça | 170.000 | Resinas, carvão vegetal, peles, comunidades dispersas; lugar possível de fenômenos raros |
| | **Total** | | **2.400.000** | |

Ainda PENDENTE: fronteiras exatas, relevo, recursos quantificados, governadores.

### 8.4 Assentamentos secundários (PROPOSTA)

| Província | Assentamentos |
|---|---|
| Valtheris | Bellacourt, Avenne, Ponte Velha |
| Altamar | Marévia, Porto Cinzento, Salina, Farol de Arven |
| Veyra | Veyrath, Campo Alto, Três Moinhos, Santa Eda |
| Dornhelm | Kaldheim, Mina de Varg, Ferro Velho, Pedra Branca |
| Caldris | Caldria, Lã Branca, Torvale, São Orlan |
| Merovan | Merova, Quatro Pontes, Estalagem Real, Vado do Rei |
| Rhovan | Rhovar, Forte de Vhal, Pedra do Corvo, Passo de Ardan |
| Esteren | Estervale, Lenhária, Lago Negro, Mosteiro de Vey |

Nomes de trabalho. Não substituem o planejamento continental de 150+ assentamentos.

### 8.5 Coerência demográfica (CONFIRMADO em 26/11/2026, D6: reino menor e mais denso)

2,4 milhões em 420.000 km² dá cerca de 5,7 habitantes por km². Um reino medieval próspero com agricultura forte teria de 20 a 40. Três caminhos:

- **a)** Reduzir a área de Eldoria para cerca de 100.000 a 120.000 km² e manter 2,4 milhões (reino compacto e denso). *Recomendado:* é a mudança que menos mexe no resto, e um reino menor é mais fácil de ler no celular.
- **b)** Manter a área e subir a população para 8 a 12 milhões.
- **c)** Manter os números e explicar o vazio no mundo: a Guerra Continental e uma praga despovoaram o reino, e há terras abandonadas a reocupar (o que vira mecânica).

**Decisão do Tales:** caminho (a). Eldoria passa a ter cerca de 110.000 km² e mantém 2,4 milhões de habitantes. Uma checagem parecida vale para o continente inteiro quando o Atlas for revisado (PENDENTE): os 310.000 km² que saem de Eldoria podem ir para os vizinhos, para os territórios independentes, ou o continente pode encolher.

### 8.6 O nome "Imperium" no mundo (direção CONFIRMADA em 26/11/2026, D7: um império antigo que caiu; detalhes PROPOSTA)

O jogador governa um reino, não um império, mas o calendário é "Imperial". Proposta: Asterra foi um único império, que caiu há séculos. Os oito Estados são os seus pedaços, todos dizem ser herdeiros legítimos dele, e o calendário sobrevive como memória. "Imperium" é ao mesmo tempo a lembrança do que se perdeu e a tentação no fim do jogo: reunir o continente. Isso também dá às religiões e à Corrente (seção 10) um passado comum.

---

## 9. Atlas continental (PROPOSTA)

| Estado | Capital proposta | Área proposta | Províncias propostas |
|---|---|---:|---:|
| Eldoria | Valtheris | ~110.000 km² (CONFIRMADO, D6; era 420.000) | 8 |
| Valedorn | Rethmar | 720.000 km² | 8 |
| Aurel | Aurelis | 180.000 km² | 4 |
| Karsk | Kharad | 1.050.000 km² | 8 |
| Edria | Vespera | 260.000 km² | 5 |
| Theryn | Orthea | 390.000 km² | 5 |
| Mordane | Kardum | 680.000 km² | 7 |
| Serevan | Namaris | 310.000 km² | 5 |
| Territórios independentes | — | 790.000 km² | variável |
| **Total** | — | **4.800.000 km² (a rebalancear após D6)** | **50 províncias estatais** |

**Posição:** Eldoria no centro; Valedorn no oeste interior; Aurel na costa oeste; Karsk no leste; Edria no sudoeste; Theryn no centro-sul; Mordane no norte; Serevan no sul e sudeste.

**Fronteiras:** Eldoria faz fronteira com Valedorn, Edria, Theryn, Karsk e Mordane. Valedorn com Aurel, Edria, Eldoria e Mordane. Aurel com Valedorn e Edria. Karsk com Eldoria, Mordane e Theryn. Edria com Aurel, Valedorn, Eldoria e Theryn. Theryn com Edria, Eldoria, Karsk e Serevan. Mordane com Valedorn, Eldoria e Karsk. Serevan com Theryn e com o mar.

**Mares:** Mar das Névoas (norte), Mar de Aurel (oeste), Mar Interior de Ordan (centro), Mar de Serevan (sul).

**Rios:** Ilyr (nasce na Cordilheira de Vhal, atravessa Valedorn e Eldoria, forma delta em Edria); Serath (nasce nas montanhas de Mordane, atravessa Eldoria rumo a Theryn e ao litoral sul); Dorn (nasce em Karsk e acompanha parte da fronteira oriental de Eldoria).

**Regiões naturais:** Cordilheira de Vhal, Montanhas de Mord, Planícies de Ordan, Floresta de Esteren, Vale de Merovan, Planalto de Karsk, Costa de Serevan, Pântanos de Velis.

**Pendências de coerência:** um "Mar Interior de Ordan" no centro do continente conflita com Eldoria estar no centro sem que o mar apareça nas províncias dela; e Eldoria tem Altamar como porto, mas o documento não diz em que mar. Revisar junto com a decisão D6.

---

## 10. Forças de Eldoria (PROPOSTA, do Dossiê 1.2)

### 10.1 Casas nobres

| Casa | Base | Interesse inicial |
|---|---|---|
| Vaelmont | Valtheris | Preservar influência na corte |
| Avarenne | Altamar | Expandir comércio marítimo |
| de Veyr | Veyra | Controlar terras e produção agrícola |
| Dorn | Dornhelm | Monopolizar concessões minerais |
| Caldran | Caldris | Proteger manufaturas e propriedades |
| Merrow | Merovan | Controlar rotas, crédito e pedágios |
| Rhovar | Rhovan | Ampliar autonomia militar |
| Esteren | Esteren | Preservar domínio florestal |

PENDENTE: genealogias, títulos, brasões, chefes e relações entre as casas. Observação de design: a casa "Dorn" tem o mesmo nome do rio Dorn (que fica em Karsk, longe de Dornhelm), e a casa "Esteren" tem o mesmo nome da província. Pode ser intencional; se não for, renomear.

### 10.2 Conselho Real

Os oito cargos vêm do GDD fundador (CONFIRMADO como ponto de partida, e o rei pode mudar tudo, seção 5.1):

- **Primeiro-ministro:** coordena o governo e articula Coroa e Conselho.
- **Chanceler:** diplomacia, tratados, correspondência e representação externa.
- **Tesoureiro:** receitas, despesas, dívida, crédito e tesouro.
- **Marechal:** comando militar, mobilização, guarnições e estratégia.
- **Mestre das Leis:** legislação, tribunais, pareceres e jurisdição.
- **Intendente:** administração territorial, abastecimento, obras e execução provincial.
- **Confessor Real:** aconselhamento espiritual e ponte com a Igreja.
- **Mestre dos Segredos:** inteligência, espionagem e contraespionagem.

PENDENTE: os ocupantes. Cada um terá competência, interesses, personalidade e lealdades próprias, e todos herdaram o cargo do rei antigo, o que é parte da crise. *(PROPOSTA: o Mestre dos Segredos e a rede dos de baixo competem pela mesma informação, o que cria rivalidade natural.)*

### 10.3 Facções

- **Casa Alta:** aristocracia tradicional; privilégios, precedência e autonomia provincial.
- **Partido da Coroa:** burocratas, oficiais e famílias ligadas à administração; centralização.
- **Liga Mercantil:** comerciantes, banqueiros, armadores e corporações; previsibilidade, crédito e liberdade comercial.
- **Ordem da Fé:** autoridades religiosas, mosteiros e pregadores; autoridade institucional e moral.
- **Reformistas:** juristas, administradores e setores urbanos; reformas fiscais, legais e administrativas.

Os nomes das cinco facções vêm do GDD fundador; as interpretações são PROPOSTA. Não são partidos modernos nem blocos homogêneos; um personagem pode pertencer a uma casa e negociar com várias facções.

*(PROPOSTA)* Falta um grupo que represente "os de baixo" (camponeses, artesãos, criados). Ele não precisa ser uma facção formal no início, mas o rei humilde pode criar ou fortalecer um, o que seria uma das jogadas mais transformadoras e perigosas do jogo.

### 10.4 Crise inicial de 1427

- O tesouro mantém o governo, mas não atende a todas as demandas.
- Rhovan pede reforços e o pagamento atrasado das guarnições.
- Veyra alerta que a próxima colheita pode vir abaixo do esperado.
- Altamar pede revisão das tarifas portuárias.
- A Liga Mercantil oferece crédito à Coroa em troca de privilégios.
- A Ordem da Fé quer participar da formação do novo governo.
- Uma grande casa ainda não enviou representante à capital.
- Karsk movimenta tropas perto da fronteira oriental.

São condições iniciais do mundo, não eventos fixos. A intenção: problemas simultâneos, com custos e prazos diferentes, forçando prioridades.

*(PROPOSTA)* Cada gancho é ligado a uma pessoa com rosto (quem pede, quem ganha, quem perde), e pelo menos dois deles estão secretamente conectados (por exemplo, a casa ausente negocia com Karsk; o crédito da Liga é o que paga o tesoureiro).

---

## 11. Cosmologia e religião

**DIREÇÃO CONFIRMADA em 26/11/2026:** pode existir uma religião dominante, mas o universo também tem uma dimensão mística e cósmica profunda, uma força ou princípio que permeia a realidade, com escala metafísica comparável à das grandes cosmologias de ficção e identidade inteiramente original. Não copiar Star Wars, Duna ou qualquer outra propriedade.

Possíveis expressões: religião institucional, ordens contemplativas, cultos locais, seitas dissidentes, filosofias, cosmologias concorrentes e pessoas que afirmam ter visto o inexplicável.

**PROPOSTA preliminar:** chamar a força provisoriamente de "A Corrente". Nome, natureza, regras, manifestações e relação com a religião estão PENDENTES. Manter o tom low fantasy: fenômenos raros, ambíguos e pouco compreendidos.

**PROPOSTA de uso no jogo:** a Corrente nunca é um recurso que o jogador gasta. Ela aparece como fato ambíguo que cada grupo interpreta à sua maneira (milagre, heresia, presságio, fraude), e essas interpretações movem a política. Se a seção 8.6 for aprovada, o império antigo pode ter tido uma relação com a Corrente que todas as religiões atuais disputam.

---

## 12. Interface mobile

### 12.1 Direção (CONFIRMADO como delegação em 26/11/2026)

O Claude propõe a interface para avaliação do Tales. Ela deve comunicar profundidade sem virar uma sequência impraticável de menus. O Tales quer o jogo **muito visual** (CONFIRMADO).

Base visual herdada do GDD: pedra escura, pergaminho, bronze, ouro envelhecido, verde profundo e vinho; tipografia editorial; mapa interativo.

### 12.2 Estrutura de telas (PROPOSTA)

Em vez de onze abas no mesmo nível, três lugares e uma camada:

1. **O Salão (pessoas):** o rei, quem está diante dele, a agenda da semana, a corte com rostos e humores. É onde se passa a maior parte do tempo.
2. **O Reino (mapa):** as oito províncias com camadas (economia, humor do povo, militar, fé, rumores), cada uma tocável.
3. **A Crônica (história):** o que aconteceu, quem lembra do quê, cartas, o legado em formação.
4. **A Mesa (camada sobre qualquer tela):** decretos, ordens em andamento, relatórios.

As abas previstas no GDD (visão geral, território, tesouro, conselho, corte, dinastia, diplomacia, militar, sociedade, leis, crônicas) viram **vistas** dentro desses lugares, e acendem aos poucos pelo onboarding (3.7).

**Regra dos três toques (PROPOSTA):** qualquer informação importante está a no máximo três toques do Salão.

### 12.3 Os Fios: tornar a causa visível (PROPOSTA)

Tocar e segurar qualquer número, rosto, humor ou fato abre os **Fios**: a cadeia de causas que produziu aquilo, lida dos logs de causalidade (6.1, princípio 11). Exemplo: "Humor de Veyra caiu" → "o preço do pão subiu 30%" → "o imposto sobre moinhos" (seu decreto de 3 meses atrás) + "a colheita ruim". Os Fios respeitam a informação imperfeita: o rei só vê o que alguém contou para ele, e algumas linhas aparecem como "rumor" ou "desconhecido".

É o que impede a simulação profunda de parecer aleatória, e é uma assinatura visual própria do Imperium.

### 12.4 Informação imperfeita na tela (PROPOSTA)

- Todo relatório tem **fonte** (quem contou) e **grau de certeza** (um selo, de "visto com os próprios olhos" a "boato de taverna").
- Conselheiros diferentes podem dar números diferentes para a mesma coisa.
- O rei pode mandar verificar, o que custa tempo e confiança.

### 12.5 Visual dos personagens

O protótipo Coroa de Vésper mostrou que retratos gerados por código (SVG), com expressão por humor e envelhecimento, funcionam bem. *(PROPOSTA: manter essa abordagem e elevar a qualidade artística, porque rostos que reagem são a forma mais barata e mais forte de mostrar consequência.)*

---

## 13. Tecnologia

### 13.1 Planejamento herdado do GDD (PROPOSTA técnica)

- Stack considerada: TypeScript, React, Phaser ou camada própria para o mapa, IndexedDB e PWA.
- Motor de simulação separado da interface.
- Módulos: World, Economy, Population, Politics, Character, Dynasty, Diplomacy, Military, Event, Simulation e UI.
- Salvamentos persistentes, exportação e importação, determinismo com sementes.

### 13.2 Modelo de tempo (CONFIRMADO em 26/11/2026, D4: dias corridos com ciclos mensais)

A v1.4 tinha dois modelos ao mesmo tempo ("turnos mensais" e "pausa, normal, rápido, muito rápido"). Proposta que concilia os dois:

- **O tempo corre em dias**, com pausa e três velocidades, e pausa sozinho quando algo exige o rei.
- **Pessoas e agenda** atualizam por dia.
- **Economia, população e política** fecham um ciclo por mês (e as estações mudam o clima e a colheita).
- **Estados estrangeiros** decidem em ciclos mensais ou mais longos.

Isso combina a sensação viva do dia a dia com o custo baixo de processamento de ciclos mensais.

### 13.3 Lições do protótipo Coroa de Vésper (registro)

O protótipo (https://claude.ai/artifact/BEYv1E9oLGtxL37yZBi2TG) foi feito antes deste documento, com outra lore (não canon). O que ele ensinou:

- O Tales achou a primeira versão rasa (4 barras e crises em cartas): **profundidade de sistema vale mais que mais cenas de escolha**.
- Funcionaram como direção: criação do soberano, retrato SVG com expressão, necessidades pessoais no estilo The Sims, recursos reais sem teto, corte com memória e segredos, esquemas, família e sucessão, tempo em dias com pausa.
- A ordem livre via IA foi testada ali (ligada à decisão D3).

---

## 14. Escopo e fases

### 14.1 Fatia vertical: "O Primeiro Ano" (escopo CONFIRMADO em 26/11/2026, D2; o conteúdo detalhado abaixo é PROPOSTA)

A primeira versão jogável cobre o primeiro ano do reinado, só em Eldoria, com profundidade real:

- **Inclui:** as 8 províncias com grupos de população; cerca de 40 personagens com nome (o rei, a rede dos de baixo, o Conselho, os chefes das 8 casas, figuras da Igreja, do comércio e do exército); as 5 facções; a crise de 1427 completa; economia com poucos bens (grão, ferro, lã e tecidos, madeira, sal, moeda); decretos; agenda e tempo do rei; os Fios; a Crônica; as primeiras cartas do rei antigo; vida privada (casamento, amantes, filhos possíveis).
- **Karsk** é o único vizinho realmente ativo. Os outros seis são agentes simples (humor, interesses, embaixadores).
- **Guerra abstrata:** campanhas resolvidas em poucas decisões, com custos humanos e políticos reais. Batalhas táticas ficam para depois.
- **Fica para depois:** o continente inteiro, bancos e crédito complexos, comércio entre Estados, guerra detalhada, várias gerações.
- **Critério de aceitação:** uma partida de 2 a 4 horas em que pelo menos uma cadeia longa (imposto → preço → humor → revolta → reação de uma casa) aconteça sem roteiro, e o jogador consiga explicá-la pelos Fios.

### 14.2 Fases revisadas (PROPOSTA)

0. **Documento** (esta versão e as decisões abertas).
1. **Fundação técnica:** motor de simulação com tempo, sementes, logs de causalidade, salvamento e um esqueleto de interface mobile.
2. **O Primeiro Ano** (a fatia vertical acima).
3. **O Reino inteiro:** economia e sociedade completas em Eldoria, mais anos de reinado.
4. **Os vizinhos:** os sete Estados com política interna e diplomacia.
5. **A guerra:** exércitos, generais, logística, cercos, ocupação.
6. **Gerações:** continuação com o sucessor depois do reinado do rei humilde (D1 confirmada).
7. **O continente:** as 50 províncias, territórios independentes e o tema do império antigo.
8. **Polimento.**

Cada fase entrega algo jogável. Critério herdado do GDD (CONFIRMADO): nenhum sistema é menu decorativo; cada um afeta outros e produz consequências observáveis e testáveis (impostos, guerra, corrupção, sucessão, IA estrangeira, crises agrícolas).

### 14.3 Regras de engenharia (herdadas do protocolo de transferência, CONFIRMADO)

1. Cada sistema importante tem objetivo, regras, estados e dados, entradas, saídas, fórmulas quando houver, interações e critérios de aceitação.
2. Especificações por módulo e por etapa, nunca uma entrega monolítica.
3. Registro de decisões e mudanças; ambiguidades são sinalizadas antes de assumir comportamento.
4. Código e documentação evoluem juntos. Quando a implementação revela um limite que exige mudar o design, isso volta para discussão e para este documento.
5. A Memória Mestra é a fonte central; documentos de módulo detalham, mas não a contradizem em silêncio.

---

## 15. Continente vivo

**DIREÇÃO CONFIRMADA em 26/11/2026:** expandir os outros Estados e o mundo para além de Eldoria: governos, dinastias, personagens, economias, exércitos, relações, cidades independentes, territórios disputados e regiões sem governo central. Os dados concretos serão PROPOSTA até aprovação. *(Pela proposta 14.2, isso entra na fase 4 em diante; Karsk é desenvolvido antes, para a fatia vertical.)*

---

## 16. Decisões abertas

| # | Decisão | Opções | Recomendação | Status |
|---|---|---|---|---|
| D1 | Horizonte do jogo | A vida deste rei com continuação pelo sucessor / dinastia por gerações / só a vida dele | A vida dele, com continuação | **CONFIRMADO em 26/11: a vida dele, com continuação** |
| D2 | Escopo da 1ª versão jogável | Só Eldoria, "O Primeiro Ano" / continente inteiro | Só Eldoria | **CONFIRMADO em 26/11: só Eldoria, o primeiro ano** |
| D3 | Ordens em texto livre por IA | Decretos + texto livre extra / só decretos / texto livre como principal | Decretos + texto livre extra | **CONFIRMADO em 26/11: decretos, com texto livre extra** |
| D4 | Modelo de tempo | Dias contínuos com ciclos mensais (13.2) / turnos mensais puros | Dias com ciclos mensais | **CONFIRMADO em 26/11: dias corridos, ciclos mensais** |
| D5 | Distribuição | PWA primeiro / lojas com conteúdo desligável | PWA primeiro | **CONFIRMADO em 26/11: PWA primeiro** |
| D6 | Escala demográfica | Reduzir área / subir população / explicar o vazio | Reduzir a área | **CONFIRMADO em 26/11: reino menor e mais denso (~110 mil km²)** |
| D7 | Significado de "Imperium" | Império antigo caído (8.6) / outro | Império antigo caído | **CONFIRMADO em 26/11: um império antigo que caiu** |
| D8 | Identidade do rei | Biografia fixa / o jogador cria o rei | — | **CONFIRMADO em 26/11: o jogador cria o rei; fixa só a premissa (o rei antigo gostava dele e o achava o melhor sucessor; veio do nada, como um faxineiro)** |
| D9 | Legitimidade e sucessão | Legitimidade contínua por fontes e degraus emergentes / ~~Ano da Prova (rejeitado: arcade)~~ | Legitimidade contínua | **CONFIRMADO em 26/11: legitimidade contínua e emergente, sem prazo (4.4)** |

---

## 17. Estado de produção e próximos passos

### 17.1 Já desenvolvido

GDD fundador 1.0, Seção 24 (tom adulto), Documento de Desenvolvimento 1.1, Atlas de Asterra 1.0, Dossiê de Eldoria 1.2, as direções confirmadas de 26/11/2026 (rei humilde, liberdade criativa, cosmologia original, simulação emergente, interface mobile delegada, continente vivo, soberania ampla, originalidade) e a revisão de design desta versão 1.5.

### 17.2 Ainda não desenvolvido

Biografia do rei; mecanismo da sucessão; elenco central; ocupantes do Conselho; ontologia da Corrente; perfis completos dos Estados; especificações formais dos sistemas; arquitetura e código.

### 17.3 Próximos passos (PROPOSTA)

1. ~~Decisões D1 a D7~~ (todas respondidas pelo Tales em 26/11).
2. Liberar a frente "Construir fundação do Imperium". A fase 1 (motor com tempo em dias e ciclos mensais, sementes, logs de causalidade, salvamento e esqueleto de interface PWA) não depende da identidade do rei e pode começar já.
3. ~~Criação do soberano e legitimidade (D8, D9)~~ (aprovadas pelo Tales em 26/11).
4. Elenco da fatia vertical: cerca de 40 personagens, com a rede dos de baixo.
5. Especificação do core loop e dos decretos, o primeiro documento de módulo.

---

## 18. Documentos de origem

- **GDD 1.0 (documento fundador):** visão, mundo, sistemas, interface, arquitetura e plano inicial.
- **Seção 24 (violência e sensualidade):** adendo de tom, resumido na seção 7.
- **Documento de Desenvolvimento 1.1:** consolidação da visão, sistemas, primeiras mecânicas e plano.
- **Atlas de Asterra 1.0:** proposta geográfica, resumida na seção 9.
- **Dossiê de Eldoria 1.2:** população, economia, assentamentos, casas, Conselho, facções e crise, nas seções 8 e 10.
- **Revisão de design da v1.4** (26/11/2026, Claude): arquivo `REVISAO_DE_DESIGN_v1.4.md`, na mesma pasta deste documento.

Os documentos de 1.0 a 1.2 foram produzidos em conversas com o ChatGPT e não estão no projeto como arquivos. Se o Tales os tiver, vale anexá-los, porque o GDD fundador pode conter detalhes que esta memória resumiu.

---

## 19. Registro de versões

- **1.0 (21/11/2026):** primeira consolidação, com base no GDD 1.0, na Seção 24, no Documento de Desenvolvimento 1.1 e no Atlas de Asterra 1.0.
- **1.1 (21/11/2026):** incorporação do Dossiê de Eldoria 1.2.
- **1.2 (21/11/2026):** divisão de trabalho: design com Tales + ChatGPT; implementação com o Claude; protocolo de transferência.
- **1.3 (26/11/2026):** sucessão extraordinária do rei humilde, liberdade criativa para personagens, direção cosmológica, requisitos da simulação emergente, delegação da interface mobile, continente vivo.
- **1.4 (26/11/2026):** soberania ampla e liberdade para reestruturar corte e governo; as quatro camadas de autoridade, capacidade, obediência e legitimidade; originalidade; liberdade criativa sem converter propostas em canon.
- **1.5 (26/11/2026), revisão de design por Claude com o Tales:**
  - *Estrutura:* documento reorganizado numa única numeração (havia duas seções 12 e a 11 vinha depois da 12); registro de versões unificado (a entrada 1.2 estava duplicada); textos repetidos fundidos; identificadores internos de conversa removidos.
  - *Correções:* divisão de trabalho atualizada (Tales + Claude fazem design e código, CONFIRMADO); "rei estabelecido" corrigido para "reino estabelecido, rei novo"; preferências já confirmadas pelo Tales registradas (rejeição do estilo Reigns, recursos reais sem teto, morte só como pessoa, celular vertical, português, muito visual).
  - *Novo, como PROPOSTA:* pilares (2.4); experiência do jogador inteira (seção 3: tempo do rei, verbos, core loop, sessão típica, momentos de assinatura, fim de jogo, onboarding); outras mecânicas da origem humilde (4.5); decretos compostos (5.3); três níveis de agentes (6.3); estrutura de telas, regra dos três toques, Fios e informação imperfeita na tela (12); modelo de tempo (13.2); fatia vertical "O Primeiro Ano" e fases revisadas (14); império antigo (8.6); grupo "dos de baixo" (10.3); ganchos com rosto (10.4).
  - *Decisões do Tales nesta versão (CONFIRMADO):* D1, a vida deste rei com continuação pelo sucessor; D2, primeira versão só com Eldoria ("O Primeiro Ano"); D3, decretos compostos com texto livre por IA como extra; D4, tempo em dias corridos com ciclos mensais; D5, distribuição como PWA primeiro (lojas talvez depois); D6, Eldoria com cerca de 110.000 km² e 2,4 milhões de habitantes; D8, o jogador cria o próprio rei ou rainha numa criação em quatro passos (ofício humilde, origem, laço com o rei antigo, quem você é), e só a premissa da origem humilde e do afeto do rei antigo é fixa; D7, "Imperium" é o império antigo que unia Asterra e caiu, e do qual os oito Estados se dizem herdeiros.
  - *Também nesta versão:* o "Ano da Prova" foi proposto e rejeitado pelo Tales (arcade); D9, legitimidade contínua e emergente, por fontes e degraus, sem prazo (4.4).
  - *Pendências apontadas:* densidade demográfica (8.5); geografia do Mar de Ordan e de Altamar (9); nomes repetidos de casas (10.1); distribuição e conteúdo adulto (7.4); tabela de decisões (16).
