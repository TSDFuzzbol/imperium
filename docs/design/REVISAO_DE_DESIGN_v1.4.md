# IMPERIUM — Revisão de design da Memória Mestra v1.4

**Autor:** Claude, no papel de game designer sênior | **Data:** 26/11/2026 | **Resultado:** v1.5 (arquivo ao lado)

Esta revisão é honesta de propósito. O documento tem uma alma forte, mas hoje ele descreve um **mundo** e uma **ambição de simulação**, e quase não descreve um **jogo**. Falta responder à pergunta mais importante de qualquer projeto: *o que o jogador faz com o dedo, agora, e por que isso é gostoso?*

---

## 1. O que já é forte (preservar)

1. **O protagonista é o melhor gancho do projeto.** Um homem de origem humilde, sem sangue real, escolhido por afeto por um rei sem herdeiros. Isso é original, humano e gera conflito sozinho: legitimidade, inveja, lealdade, mistério. Quase nenhum jogo de reis começa assim.
2. **"O rei pode tentar quase tudo. O mundo não é obrigado a aceitar."** É uma frase de design de verdade. A separação entre autoridade formal, capacidade prática, obediência e legitimidade é o coração mecânico mais original do documento.
3. **"O primeiro desafio não é vencer uma guerra. É descobrir qual problema pode esperar."** Excelente princípio de abertura. É triagem, e triagem funciona muito bem no celular.
4. **A crise inicial de 1427** já tem oito problemas simultâneos com prazos e custos diferentes. Isso é praticamente o primeiro capítulo pronto.
5. **As oito províncias têm função clara** (grão, ferro, porto, fronteira...). Isso permite que o mapa signifique algo, e não seja decoração.
6. **Princípios de simulação maduros:** informação imperfeita, memória, agentes com objetivos, logs de causalidade e sementes reproduzíveis. Esses dois últimos são raros em documentos de amadores e vão salvar o projeto.
7. **Originalidade como regra.** "Complexidade não é profundidade" é a frase mais importante do documento inteiro.

---

## 2. Problemas

### 2.1 Problemas de documento (fáceis, já corrigidos na v1.5)

- **Numeração quebrada:** a seção 11 vem depois da 12, existem **duas seções 12** (Dossiê de Eldoria e Divisão de trabalho), e a seção 1 fala com "a próxima IA" como se fosse outra conversa do ChatGPT.
- **Registro de versões espalhado em três lugares**, com a entrada 1.2 duplicada.
- **Divisão de trabalho desatualizada:** o documento diz que o design é Tales + ChatGPT e que o Claude só programa, e que o Claude "não deve alterar regras de design". Desde 26/11/2026, Tales e Claude fazem design e código juntos.
- **Informação morta:** os identificadores de WritingBlocks (63821, 74192, 85216) não servem para nada fora daquela conversa.
- **Conteúdo repetido:** a lista de sistemas aparece na seção 6, de novo na 13.4 e de novo na 14.2, com palavras diferentes.
- **"O jogador já é um rei estabelecido"** (seção 2) contradiz a 13.1, em que ele é um rei recém-coroado e contestado. O que é estabelecido é o **reino**, não o rei.

### 2.2 Problemas de design (os que importam)

**A. Não existe core loop.** O documento lista onze sistemas, mas nenhum verbo do jogador. Não sabemos o que acontece numa sessão de 10 minutos no ônibus, nem o que o jogador sente ao fechar o app. Sem isso, a fundação técnica vai construir um motor sem saber o que ele precisa mover.

**B. O escopo é de um estúdio de 300 pessoas.** 50 províncias, 150+ assentamentos, 8 Estados com política interna, economia com bancos, crédito e preços, classes sociais com migração, guerra com logística e cercos, religião, cultura, dinastia por gerações. Isso é a soma de quatro jogos grandes de PC, e o alvo é um celular, feito por uma pessoa e uma IA. Ambição não é o problema; **a falta de uma ordem de entrega é**. Sem uma fatia vertical clara, o projeto morre na fase "fundação" para sempre.

**C. A profundidade não tem rosto.** Uma simulação emergente que o jogador não entende parece aleatória. O documento quer causalidade, mas não diz como o jogador **vê** a causa. No celular, sem mouse e sem tooltips em cascata, isso precisa ser desenhado desde já.

**D. "Fazer quase tudo" não tem interface.** Se o rei pode criar cargos, abolir instituições e governar sem conselho, como isso cabe numa tela vertical? Um catálogo de botões contradiz a liberdade; texto livre puro quebra o determinismo e o desempenho. É preciso um sistema de ordens desenhado.

**E. Não há fim, derrota nem objetivo.** Não sabemos se o jogo é a vida deste rei ou uma dinastia por séculos, como se perde o trono, nem o que é "ir bem". Sem isso não há tensão; o jogador não sabe o que está arriscando.

**F. Não há onboarding.** O jogador cai num conselho de oito cargos, cinco facções, oito casas e oito crises. Ironicamente, a história já resolve isso: o rei é um homem humilde que **também não sabe** governar. A ignorância dele pode ser o tutorial.

**G. O passado humilde do rei é só lore.** Ele veio de baixo, mas isso não muda nada no jogo. É o desperdício mais caro do documento: é exatamente aí que mora a identidade original do Imperium.

**H. Não há fantasia nem momentos memoráveis.** O documento fala de sistemas, não de cenas. Falta a lista de momentos que o jogador vai contar para um amigo ("o duque se recusou a se ajoelhar na frente da corte inteira").

**I. O tempo é ambíguo.** "Turnos mensais" e "pausa, normal, rápido, muito rápido" ao mesmo tempo. São modelos diferentes. O protótipo usou dias contínuos.

**J. A escala demográfica não fecha.** Eldoria tem 2,4 milhões de pessoas em 420.000 km², ou seja, 5,7 habitantes por km². Um reino medieval próspero teria de 20 a 40. Ou o reino é muito menor, ou muito mais populoso, ou é vazio por um motivo (guerra, praga) que precisa ser dito.

**K. O conteúdo adulto tem consequência de plataforma.** Nudez e tortura limitam publicação na App Store e na Google Play. Como PWA (site instalável) não há esse limite. Isso não muda a visão, mas precisa ser uma decisão consciente.

**L. O nome "Imperium" não tem império.** O jogador é rei de um reino. O "Calendário Imperial" sugere um império antigo que caiu. Isso é um gancho bonito que o documento não usa.

---

## 3. Propostas principais (todas como PROPOSTA na v1.5)

1. **Quatro pilares** para filtrar qualquer ideia nova: *O rei que veio de baixo*; *Ordenar é fácil, ser obedecido não*; *Todo efeito tem um porquê visível*; *O reino lembra*.
2. **O recurso escasso é o tempo do rei**, não barras. Cada semana tem poucos momentos (audiências, conselho, viagem, vida privada). Escolher quem ouvir é a decisão central. Isso é triagem, cabe no celular e conversa com o princípio da abertura.
3. **Core loop em três camadas:** o momento (uma pessoa diante do rei), a estação (agenda, decretos e consequências), e o reinado (legitimidade, sucessão, legado).
4. **Decretos compostos:** verbo + alvo + modo (público ou secreto, prazo, força). Isso dá liberdade quase total com poucos toques. Uma camada opcional de ordem escrita em texto livre é convertida por IA num decreto estruturado, para manter a simulação determinística.
5. **"Fios":** tocar em qualquer número ou fato mostra a cadeia de causas que o produziu, lida dos logs de causalidade. É a ponte entre a simulação profunda e a tela pequena.
6. **A rede dos de baixo:** criados, cozinheiros, guardas e cavalariços que conheceram o rei antes da coroa trazem rumores que o conselho esconde. É a vantagem única deste rei, e tem um custo: a nobreza vê isso como baixeza.
7. **As cartas do rei antigo:** o motivo da escolha é um mistério revelado aos poucos. É a espinha narrativa do primeiro ato.
8. **Onboarding diegético:** os sistemas aparecem quando o rei aprende sobre eles; o tesoureiro explica o tesouro porque o rei não sabe.
9. **Fatia vertical "O Primeiro Ano":** só Eldoria jogável, cerca de 40 personagens com nome, Karsk como único vizinho realmente ativo, os outros seis como agentes simplificados, guerra abstrata. Tudo o mais vem depois, nesta ordem.
10. **Fim de jogo:** não existe "vitória"; existe crônica. O reinado termina com morte, deposição, abdicação ou exílio, e o jogo escreve o legado. Marcos (ser aceito, ter sucessor, sobreviver a uma guerra) dão direção.

---

## 4. Decisões que só o Tales pode tomar (primeiro lote)

1. **Horizonte:** o jogo é a vida deste rei, ou uma dinastia por gerações? *(recomendo: a vida dele como campanha principal, com a opção de continuar com o sucessor depois)*
2. **Escopo da primeira versão jogável:** só Eldoria com vizinhos simplificados, ou o continente inteiro desde o começo? *(recomendo: só Eldoria)*
3. **Ordens livres por IA:** o rei pode escrever ordens em texto livre interpretadas por IA, ou só decretos compostos? *(recomendo: decretos compostos como base, texto livre como extra)*

Próximo lote (depois desses): modelo de tempo; distribuição (PWA ou lojas, por causa do conteúdo adulto); escala demográfica; o nome e o significado de "Imperium".
