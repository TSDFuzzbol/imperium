// Tutorial "Como jogar": categorias que abrem e fecham. Texto puro, sem estado do mundo.
const CATS: { id: string; title: string; body: string }[] = [
  { id: 'inicio', title: 'Primeiros passos', body: `
    <p>Você é o novo soberano de Eldoria. Não há missão nem fim marcado: o reino vive sozinho, e você decide onde mexer.</p>
    <ol><li>Abra o <b>Salão</b> e responda quem pede audiência.</li>
    <li>Toque <b>▶</b> no alto para o tempo correr. O jogo pausa sozinho quando algo exige você.</li>
    <li>No <b>Reino</b>, olhe o mapa e toque numa província para ver como ela está.</li>
    <li>Na <b>Mesa</b>, monte decretos seus, além das respostas do Salão.</li>
    <li>Quando não entender um número, toque nele. Os <b>Fios</b> mostram por que ele é assim.</li></ol>
    <p>Dica: o primeiro ano é apertado. Veyra começa em seca e a colheita chega em agosto e setembro.</p>` },
  { id: 'tempo', title: 'O tempo', body: `
    <p>O tempo corre em dias. <b>❚❚</b> pausa. <b>▶</b>, <b>▶▶</b> e <b>▶▶▶</b> são as três velocidades.</p>
    <p>Economia, população e política fecham uma vez por mês, no último dia. É quando chegam colheitas, impostos e soldos.</p>
    <p>Na Mesa, a opção "Pausar quando algo exigir o soberano" decide se o jogo para sozinho em cada novidade importante.</p>` },
  { id: 'salao', title: 'Salão e audiências', body: `
    <p>Cada pessoa no Salão pede algo porque algo aconteceu no reino: soldo atrasado, fome, uma tarifa, uma casa ausente.</p>
    <p>As respostas já são decretos prontos, com custo. Escolher <b>Pedir paciência</b> não custa nada agora, mas quem pediu lembra.</p>
    <p>Quem fica sem resposta até a data no pé do cartão se sente ignorado.</p>` },
  { id: 'habilidades', title: 'Habilidades e vozes interiores', body: `
    <p>Você tem 12 habilidades em quatro atributos: <b>Voz</b>, <b>Olho</b>, <b>Alma</b> e <b>Sangue</b>. Os pontos vêm do seu ofício, do laço com Teodoro e do que você escolheu na criação.</p>
    <p>Nas audiências, as habilidades <b>falam com você</b>. Uma voz só aparece se você for bom o bastante naquilo. Ela pode trazer o que ninguém disse em voz alta.</p>
    <p>Algumas respostas são <b>testes</b>, como "Língua de Prata · 58%". A porcentagem é a chance real. Ela sobe com a habilidade e com a boa vontade de quem ouve. Cada teste só pode ser tentado uma vez por audiência, e o resultado mexe no reino: moral, humor, lealdade.</p>
    <p>A <b>Memória de Criado</b> é quem você era antes da coroa. Ela fala menos com o tempo.</p>
    <p>A Tinta e Pó também reduz o desvio na coleta de impostos.</p>` },
  { id: 'legitimidade', title: 'Quem aceita seu reinado', body: `
    <p>Não existe barra de "aprovação" que termina o jogo. Cada grupo decide sozinho se aceita seu direito de reinar: as oito casas, a Ordem da Fé, o exército, a Liga Mercantil e o povo de cada província.</p>
    <p>Cada grupo está num degrau: <b>Aceita</b>, <b>Murmúrio</b>, <b>Recusa</b>, <b>Alternativa</b>, <b>Conspiração</b>, <b>Ruptura</b>.</p>
    <ul><li>Uma casa em Recusa retém parte do imposto da sua província.</li>
    <li>Em Alternativa, começa-se a falar de um pretendente.</li>
    <li>Em Conspiração, a casa ajuda inimigos e agitadores.</li>
    <li>Em Ruptura, há rebelião.</li></ul>
    <p>Toque num grupo para ver o que pesa a favor e contra você: lei, fé, força, povo, costume e sangue.</p>` },
  { id: 'reino', title: 'O mapa e as províncias', body: `
    <p>As abas acima do mapa trocam o que as cores mostram: humor, fome, grão guardado, preço, imposto, ordem e tropas.</p>
    <p>As linhas douradas que andam pelas estradas são grão que mudou de província no último mês.</p>
    <p>Toque numa província para abrir a ficha, com população, humor, grão, guarnição e a casa nobre local. Embaixo estão os decretos para aquela província.</p>` },
  { id: 'info', title: 'Você não sabe tudo', body: `
    <p>Só o que acontece em Valtheris você vê com os próprios olhos. O resto chega por mensageiro: atrasado e às vezes errado.</p>
    <p>A ficha diz quando o relatório foi feito. Uma província longe pode estar pior do que parece.</p>
    <p>Seu ofício antigo ajuda. O cozinheiro vê o grão sem erro, e o faxineiro lê melhor o humor das pessoas.</p>` },
  { id: 'decretos', title: 'Decretos na Mesa', body: `
    <p>Escolha o verbo (taxar, isentar, comprar grão...), depois onde e quanto. O pergaminho mostra o custo, quantos dias a ordem leva para chegar e o palpite do conselho.</p>
    <p>O palpite é aproximado e pode errar. O resultado real só aparece quando o mês fecha.</p>
    <p>"Nas suas palavras" fica gravado junto do decreto. Nesta versão, o texto ainda não muda o efeito.</p>
    <p>As ordens viajam pelas estradas. Acompanhe na lista "Ordens a caminho".</p>` },
  { id: 'fios', title: 'Os Fios: por que isso aconteceu?', body: `
    <p>Quase todo número do jogo é clicável. Ele abre um nó com as causas e quanto cada uma pesou.</p>
    <p>Uma causa com <b>›</b> tem as próprias causas. Siga o fio: o preço do pão subiu por causa do estoque, que caiu por causa da colheita, que foi ruim por causa da seca.</p>
    <p>A trilha no alto deixa você voltar a qualquer passo.</p>` },
  { id: 'economia', title: 'Grão, preços e fome', body: `
    <p>O grão é o centro de tudo. Camponeses comem primeiro do próprio campo e vendem o resto. Cidades e soldados compram no mercado.</p>
    <p>Quando o estoque cai antes da colheita, o preço sobe. Se o pão ficar caro demais, quem é mais pobre passa fome, e o humor despenca.</p>
    <p>Ferramentas: você pode comprar grão para o celeiro real, distribuir grão onde falta, importar pelo porto de Altamar ou baixar pedágios para o grão andar mais barato.</p>` },
  { id: 'tesouro', title: 'Tesouro e dívida', body: `
    <p>O tesouro recebe impostos, tarifas do porto e pedágios. Paga, nesta ordem: juros da dívida, administração, soldos e a corte.</p>
    <p>Se faltar dinheiro, o soldo atrasa. Soldado sem soldo perde a moral, e guarnição desmoralizada não segura motim nem Karsk.</p>
    <p>Você herdou 780 mil coroas de dívida. A Liga Mercantil oferece crédito por pouco tempo.</p>` },
  { id: 'ordem', title: 'Ordem, motins e revolta', body: `
    <p>Cada província vai de <b>Calma</b> a <b>Tensão</b>, <b>Motins</b> e <b>Revolta</b>. Fome, impostos altos e ressentimentos empurram para cima.</p>
    <p>Em revolta, a província não paga imposto e o comércio pelas suas estradas cai muito.</p>
    <p>Mandar tropas acalma, mas o povo lembra dos mortos por muito tempo.</p>` },
  { id: 'salvar', title: 'Salvar e recomeçar', body: `
    <p>O jogo salva sozinho no seu aparelho a cada mês e quando você sai.</p>
    <p>Na Mesa, "Copiar salvamento" gera um texto que você pode guardar e depois colar em "Colar salvamento".</p>
    <p>"Nova partida" volta para a criação do soberano.</p>` },
];

export function tutorialHtml(open: string[] = []) {
  return `<div class="sheet help" role="dialog" aria-label="Como jogar">
    <div class="sheet-h"><div><p class="eyebrow">Tutorial</p><h2>Como jogar</h2></div><button class="x" data-a="closehelp" aria-label="Fechar">✕</button></div>
    <p class="lede">Toque numa categoria para abrir. O jogo fica pausado enquanto você lê.</p>
    <div class="acc">${CATS.map((c) => `<details data-cat="${c.id}" ${open.includes(c.id) ? 'open' : ''}><summary>${c.title}</summary><div class="acc-b">${c.body}</div></details>`).join('')}</div>
  </div>`;
}
