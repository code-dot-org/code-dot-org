* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code prizes

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

# Награди за всеки организатор

Всеки педагог, който е домакин на Час на кода събитие за ученици, получава 10 GB Dropbox пространство като подарък за благодарност!

<% else %>

## Prizes for EVERY organizer

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

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# ЧЕСТО ЗАДАВАНИ ВЪПРОСИ

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## Дали трябва да е регистрирано цялото училище за да спечели $10,000 за хардуер?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

Наградата се ограничава само за публични училища К-12 САЩ. За да се класирате, цялото училище трябва да се регистрира за часът на кодирането до 16 ноември 2015 г. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

## Защо $10,000 хардуерната награда е достъпна само за държавни училища?

Ще се радваме да помогамем на учителите в държавните и частните училища еднакво, но за сега всичко е въпрос на логистика. Ние си партнираме с [ DonorsChoose.org](http://donorschoose.org), които управляват финансирането на класните стаи, спечелили хардуерни награди, те работят само с обществени К-12 училища. Според DonorsChoose.org организацията има по-добър достъп до последователни и точни данни в държавните училища.

## Кога е крайният срок за кандидатстване за наградата за хардуер?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

## Ако моето училище не може да организира Час програмиране по време на Седмицата на образованието по Компютърни науки (8-14 декември), мога ли все пак да спечеля награда?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## Аз съм извън САЩ. Мога ли да спечеля награда?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>