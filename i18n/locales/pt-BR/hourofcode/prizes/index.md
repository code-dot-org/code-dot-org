* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Prêmios da Hora do Código de 2015

<% if @country == 'la' %>

# Prêmios para os organizadores

Todos os educadores que sediarem uma Hora do Código para estudantes recebem 10 GB de espaço no Dropbox como forma de agradecimento!

<% else %>

## Prêmios para TODOS os organizadores

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 escolas ganharão kits de laptops para as salas de aula (ou o equivalente a US$10.000 em tecnologia)

Sign up for this prize is now closed. Check back to see this year's winners.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="video-chats"></a>

## 30 classrooms will win a video chat with a guest speaker

Lucky classrooms will have the opportunity to talk with guest speakers who will share how computer science has impacted their lives and careers.

[col-33]

![image](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![image](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![image](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![image](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![image](/images/fit-175/Hadi-Partovi.jpg)  
Hadi Partovi   
(Code.org co-founder)   
[Watch live Dec. 11 10 am PST](https://plus.google.com/events/c2e67fd7el3es36sits1fd67prc)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## One lucky classroom will win an exclusive, behind-the-scenes “Making of Star Wars” experience in San Francisco with Disney and Lucasfilm

One lucky classroom will win the grand prize – a trip to San Francisco, CA for an exclusive, behind-the-scenes “Making of Star Wars” experience with the visual effects team who worked on Star Wars: The Force Awakens. The grand prize is courtesy of [ILMxLAB](http://www.ilmxlab.com/), a new laboratory for immersive entertainment, combining the talents of Lucasfilm, Industrial Light & Magic and Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg" />

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## 100 classrooms will win programmable robots including a BB-8 droid robot by Sphero

In honor of Hour of Code tutorial "Star Wars: Building a Galaxy with Code," 100 participating classrooms in the United States or Canada will a set of four Sphero 2.0 robots plus a BB-8™ App-enabled Droid that students can program. Sign up your Hour of Code event to qualify. [Learn more about BB-8 from Sphero](http://sphero.com/starwars) and [about Sphero education](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# Tire suas dúvidas

## Quem pode receber os presentes de agradecimento?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Existe um prazo-limite de inscrição para receber todos os presentes de agradecimento?

Você deve se inscrever **antes** de <%= campaign_date('start_long') %> para poder receber os presentes de agradecimento.

## Quando vou receber meu presente de agradecimento?

Entraremos em contato em dezembro, após a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>), para informar os próximos passos para você resgatar seu presente.

## Posso resgatar todas as opções de presentes?

Não. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Toda a sua escola precisa participar para ganhar US$10.000 em hardware?

Sim. Toda a sua escola precisa participar para poder concorrer ao prêmio, mas uma só pessoa precisa se registrar e enviar o formulário de inscrição do Prêmio de Hardware [aqui](%= resolve_url('/prizes/hardware-signup') %). Todos os professores participantes precisam [cadastrar](%= resolve_url('/') %) sua sala de aula individualmente para receber os presentes de agradecimento aos organizadores.

## Quem está concorrendo aos US$10.000 em hardware?

Prêmio limitado apenas às escolas públicas de ensino fundamental e médio dos EUA. Para concorrer, sua escola inteira deve se inscrever na Hora do Código até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

## Por que o prêmio de hardware de US$10.000 só pode ser dado às escolas públicas?

Nós adoraríamos ajudar tanto os professores das escolas públicas quanto os das escolas particulares. Entretanto, no momento, o problema é a logística. Fizemos uma parceria com a [DonorsChoose.org](http://donorschoose.org) para administrar os prêmios de financiamento para salas de aula, válidos apenas para as escolas públicas de ensinos fundamental e médio dos EUA. De acordo com a DonorsChoose.org, a organização está melhor capacitada para acessar dados precisos e consistentes, disponíveis para escolas públicas.

## Qual é o prazo para se inscrever para o prêmio de hardware?

Para concorrer, você precisa preencher o [formulário de solicitação de hardware](%= resolve_url('/prizes/hardware-signup') %) até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

## Se apenas parte da minha escola conseguir fazer a Hora do Código durante a Semana da Educação em Ciência da Computação (<%= campaign_date('short') %>), ainda poderei concorrer aos prêmios?

Sim, no [formulário de solicitação de hardware](%= resolve_url('/prizes/hardware-signup') %) estão as datas de participação de toda sua escola.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Chat com vídeo com um orador convidado:

Prêmio limitado para turmas do ensino fundamental e médio dos EUA e Canadá. A Code.org selecionará as turmas vencedoras, fornecerá um horário para o bate-papo on-line e trabalhará com o professor apropriado para definir os detalhes da tecnologia. Não é preciso que a escola toda se inscreva para se qualificar para este prêmio. Both public and private schools are eligible to win.

<% end %>

## Eu não estou nos Estados Unidos. Posso concorrer aos prêmios?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>