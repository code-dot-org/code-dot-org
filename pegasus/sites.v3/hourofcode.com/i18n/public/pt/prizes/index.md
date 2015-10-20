---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Prêmios da Hora do Código de 2015

[col-33]

![](/images/fill-275x200/prize1.jpg)

[/col-33]

[col-33]

![](/images/fill-275x200/prize3.png)

[/col-33]

[col-33]

![](/images/fill-275x200/prize4.png)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'la' %>

# Prêmios para os organizadores

Todos os educadores que sediarem uma Hora do Código para estudantes recebem 10 GB de espaço no Dropbox como forma de agradecimento!

<% else %>

## Prêmios para TODOS os organizadores

Every educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com or Microsoft’s Windows Store** as a thank you gift!

[col-33]

![](/images/fit-100/amazon_giftcards_crop.png)

[/col-33]

[col-33]

![](/images/fit-100/microsoft_giftcards.png)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 escolas ganharão kits de laptops para as salas de aula (ou o equivalente a US$10.000 em tecnologia)

Uma escola sorteada de *cada* Estado dos EUA (e de Washington D.C.) ganhará o equivalente a US$10.000 em tecnologia. [Cadastre-se aqui](<%= resolve_url('/prizes/hardware-signup') %>) para participar e [**veja os vencedores do ano passado**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# Tire suas dúvidas

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## Toda a sua escola precisa se envolver para ganhar US$10.000 em hardware?

Sim. Toda a sua escola precisa participar para poder concorrer ao prêmio, mas uma só pessoa precisa se registrar e enviar o formulário de inscrição do Prêmio de Hardware [aqui](<%= resolve_url('/prizes/hardware-signup') %>). Every teacher participating will need to [sign up](<%= resolve_url('/') %>) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

Prêmio limitado apenas às escolas públicas de ensino fundamental e médio dos EUA. Para concorrer, sua escola inteira deve se inscrever na Hora do Código até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

## Por que o prêmio de hardware de US$10.000 só pode ser dado às escolas públicas?

Nós adoraríamos ajudar tanto os professores das escolas públicas, quanto os das escolas particulares. Entretanto, no momento, o problema é a logística. Fizemos uma parceria com a [DonorsChoose.org](http://donorschoose.org) para administrar os prêmios de financiamento para salas de aula, válidos apenas para as escolas públicas de ensinos fundamental e médio dos EUA. De acordo com a DonorsChoose.org, a organização está melhor capacitada para acessar dados precisos e consistentes, disponíveis para escolas públicas.

## Qual é o prazo para se inscrever para o prêmio de hardware?

To qualify, you must complete the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) by November 16, 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

## Se apenas parte da minha escola conseguir fazer a Hora do Código durante a Semana da Educação em Ciência da Computação (de 7 a 13 de dezembro), ainda poderei concorrer aos prêmios?

Yes, in the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) include the dates that your whole school is participating.

<% end %>

## Eu não estou nos Estados Unidos. Posso concorrer aos prêmios?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>