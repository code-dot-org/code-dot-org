---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Prêmios da Hora do Código de 2015

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# Prêmios para os organizadores

Todos os educadores que sediarem uma Hora do Código para estudantes recebem 10 GB de espaço no Dropbox como forma de agradecimento!

<% else %>

## Prêmios para TODOS os organizadores

**Cada** educador que sedia uma Hora do Código pode concorrer para receber **US$10,00 na Amazon.com, no iTunes ou na Windows Store** como agradecimento!

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 escolas ganharão kits de laptops para as salas de aula (ou o equivalente a US$10.000 em tecnologia)

Uma escola sorteada de *cada* Estado dos EUA (e de Washington D.C.) ganhará o equivalente a US$10.000 em tecnologia. [Cadastre-se aqui](<%= resolve_url('/prizes/hardware-signup') %>) para participar e [**veja os vencedores do ano passado**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# Tire suas dúvidas

## Quem pode receber os presentes de agradecimento?

Todos os organizadores da Hora do Código de 2015, dentro e fora dos Estados Unidos, podem receber os presentes de agradecimento. Contudo, o prêmio de US$10.000 em hardware é limitado aos que residem nos Estados Unidos.

## Existe um prazo-limite de inscrição para receber todos os presentes de agradecimento?

Você deve se inscrever **antes** de <%= campaign_date('start_long') %> para poder receber os presentes de agradecimento.

## Quando vou receber meu presente de agradecimento?

Entraremos em contato em dezembro, após a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>), para informar os próximos passos para você resgatar seu presente.

## Posso resgatar todas as opções de presentes?

Não. Os presentes se limitam a um por organizador. Vamos entrar em contato em dezembro, após a Semana da Educação em Ciência da Computação, para informar os próximos passos para você resgatar seu presente.

<% if @country == 'us' %>

## Toda a sua escola precisa participar para ganhar US$10.000 em hardware?

Sim. Toda a sua escola precisa participar para poder concorrer ao prêmio, mas uma só pessoa precisa se registrar e enviar o formulário de inscrição do Prêmio de Hardware [aqui](<%= resolve_url('/prizes/hardware-signup') %>). Todos os professores participantes precisam [cadastrar](<%= resolve_url('/') %>) sua sala de aula individualmente para receber os presentes de agradecimento aos organizadores.

## Quem está concorrendo aos US$10.000 em hardware?

Prêmio limitado apenas às escolas públicas de ensino fundamental e médio dos EUA. Para concorrer, sua escola inteira deve se inscrever na Hora do Código até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

## Por que o prêmio de hardware de US$10.000 só pode ser dado às escolas públicas?

Nós adoraríamos ajudar tanto os professores das escolas públicas quanto os das escolas particulares. Entretanto, no momento, o problema é a logística. Fizemos uma parceria com a [DonorsChoose.org](http://donorschoose.org) para administrar os prêmios de financiamento para salas de aula, válidos apenas para as escolas públicas de ensinos fundamental e médio dos EUA. De acordo com a DonorsChoose.org, a organização está melhor capacitada para acessar dados precisos e consistentes, disponíveis para escolas públicas.

## Qual é o prazo para se inscrever para o prêmio de hardware?

Para concorrer, você precisa preencher o [formulário de solicitação de hardware](<%= resolve_url('/prizes/hardware-signup') %>) até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

<% end %>

## Se apenas parte da minha escola conseguir fazer a Hora do Código durante a Semana da Educação em Ciência da Computação (<%= campaign_date('short') %>), ainda poderei concorrer aos prêmios?

Sim, no [formulário de solicitação de hardware](<%= resolve_url('/prizes/hardware-signup') %>) estão as datas de participação de toda sua escola.

## Eu não estou nos Estados Unidos. Posso concorrer aos prêmios?

Sim, todos os organizadores, dentro e fora dos Estados Unidos, podem receber os presentes de agradecimento. Contudo, o prêmio de US$10.000 em hardware é limitado aos Estados Unidos.

<% end %> <%= view :signup_button %>