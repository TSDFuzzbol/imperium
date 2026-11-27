# Imperium — Especificação da Fundação (fase 1)

Base: Memória Mestra v1.5 (decisões D1 a D8). Jogável: https://claude.ai/artifact/UZzvxmFgVvpGhpATeT51m9
Código: `/mnt/project-files/imperium/codigo/` (TypeScript). `npm test` roda 11 testes do motor; `npm run build` gera o HTML do artifact e a pasta PWA.

Tudo marcado **PROPOSTA** é número ou lore inventado para o jogo funcionar. Precisa da aprovação do Tales antes de virar CONFIRMADO.

## 1. Arquitetura (CONFIRMADO pela v1.5: motor separado da interface)
- `src/engine/` não conhece a tela. O mundo inteiro é um objeto JSON (`World`), inclusive o estado do sorteio. Salvar e carregar é exato.
- Mesma semente + mesmas ordens = mesma história (testado).
- Os **Fios**: cada número importante é um "fato" com fatores. Cada fator pode apontar para outro fato. A interface só mostra o que o fato diz; nenhuma explicação é escrita à mão na tela.
- Tempo: dias corridos, com pausa e 3 velocidades. Economia, população e política fecham uma vez por mês (D4). O mês tem 30 dias. O jogo começa em 12 de março de 1427 (**PROPOSTA**).
- Ordens viajam a 38 km por dia pela estrada mais curta (**PROPOSTA**).

## 2. Eldoria (PROPOSTA, dossiê 1.2)
- 8 províncias, cerca de 2,4 milhões de pessoas, 14 estradas com distância e qualidade, porto único em Altamar.
- 5 estratos por província: camponeses, artesãos, mercadores, clero, nobreza local.
- 6 bens: grão, sal, lã, tecido, ferro, madeira. Preço base em coroas: 1 / 3 / 2 / 5 / 4 / 1,5.
- Vizinhos: Mordane, Karsk, Theryn, Edria, Valedorn. Rios Serath, Ilyr e Dorn. O mapa é gerado a partir dos centros das províncias.

## 3. Ciclo mensal (ordem fixa)
clima → produção → comércio → consumo → preços → demografia → humor → inquietação → guarnições → tesouro → Karsk → povo → legitimidade → efeitos dos degraus → relatórios → despachos → limpeza dos Fios.

## 4. Fórmulas (todas PROPOSTA)
- **Colheita**: 40% em agosto, 50% em setembro, 10% em outubro. Rende `grainYield × chuva × ferramentas × ordem`. Veyra começa 1427 com seca (chuva −0,55).
- **Autoconsumo**: o camponês come primeiro do próprio campo. Só o excedente vai ao mercado.
- **Renda rural**: valor anual do grão ÷ 12, para não haver meses sem renda.
- **Ferramentas**: 0,0018 de ferro por camponês por mês. Sem ferro, a produção cai.
- **Comércio**: o grão anda pelas estradas, do preço baixo para o alto, com pedágio (6%) e custo por km. O porto paga tarifa (15%). Uma província em revolta corta o comércio das suas estradas para 30%.
- **Preço**: cobertura do estoque contra os meses até o fim de agosto + 0,8. Conta a colheita pendente. Para bens que não são grão, há elasticidade `(base/preço)^0,8` e um piso de arbitragem.
- **Consumo**: em ordem, soldados, nobreza, clero, mercadores, artesãos e por último camponeses. A fome é a fração da necessidade de grão que ficou sem atender.
- **Humor**: falta de comida pesa −12 nos camponeses e −22 nos demais. O medo do preço do pão vai até −25. Pesam também os impostos, as memórias (gratidões e ressentimentos que se apagam com o tempo) e os decretos.
- **Inquietação**: calma, tensão, motins, revolta. Há histerese, para não oscilar mês a mês.
- **Tesouro**: imposto 8%, 61 mil coroas no cofre, dívida de 780 mil a 0,75% ao mês. Paga primeiro juros, depois administração (1.100), soldos e corte (6.000). Soldo não pago vira atraso e derruba a moral.
- **Ofício do soberano**: o cozinheiro vê o grão sem erro. Faxineiro, lavadeiro e jardineiro leem melhor o humor. O jardineiro prevê a colheita. O copista perde menos na coleta. O cavalariço dá moral às guarnições. O carrasco é respeitado pelo exército e malvisto pela Ordem.

## 5. Legitimidade contínua (aprovada; números PROPOSTA)
- Grupos: as 8 casas, a Ordem da Fé, o exército, a Liga Mercantil e o povo de cada província.
- Fontes: lei, sagrado, força, povo, costume, sangue. Cada tipo de grupo pesa as fontes de um jeito, e cada grupo tem interesses e memória.
- Degraus, sem prazo: Aceita, Murmúrio, Recusa, Alternativa, Conspiração, Ruptura.
- Efeitos: uma casa em Recusa retém 25% do imposto da sua província. Em Alternativa ou acima, fala-se de pretendente. Em Conspiração, a casa alimenta Karsk e agitadores. Em Ruptura, há rebelião nobre. A Ordem unge quando a aceitação passa de 12.
- A Casa Rhovar começa em −38 e ausente da coroação.

## 6. Informação imperfeita
- Cada relatório é feito na província e viaja até Valtheris. Chega atrasado e com ruído. Só o que acontece na capital é "visto".
- Os despachos (petições no Salão) nascem do estado do mundo. Ignorar um ofende quem pediu.

## 7. Decretos compostos (D3)
taxar, isentar, tarifa do porto, pedágio, comprar grão, distribuir grão, importar grão, pagar soldo, enviar tropas, crédito da Liga, doar à Ordem, convocar casa.
Cada um tem custo, tempo de viagem e uma previsão do conselho, que é aproximada e pode errar. O texto "nas suas palavras" fica gravado no decreto. **Ainda não é interpretado por IA** (próxima fase).

## 8. O que ainda não existe
- Personagens com nome e vontade própria (conselho, herdeiros, a corte).
- Texto livre interpretado por IA.
- Traços de caráter que mudem a simulação (hoje só ficam registrados).
- Outros reinos jogáveis, guerra além das incursões de Karsk.
- O modo PWA (instalar e jogar offline) funciona só na pasta `codigo/pwa` hospedada num site. Dentro do artifact não há service worker; lá, o jogo salva no próprio navegador.
