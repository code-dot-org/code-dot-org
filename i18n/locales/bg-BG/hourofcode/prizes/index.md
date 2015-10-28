* * *

Заглавие: < % = hoc_s(:title_prizes) %> оформление: широка nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code награди

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# Награди за всеки организатор

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank-you gift!

<% else %>

## Награди за всеки организатор

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 щастливи училища ще спечелят набор от преносими компютри (или $10,000 за други технологии)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# ЧЕСТО ЗАДАВАНИ ВЪПРОСИ

## Кой има право да получи организаторски подаръци?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift. The $10K hardware prize is limited to US residents only.

## Има ли краен срок за регистрация за да получи всички организатор благодарствен подарък?

You must sign up **before** <%= campaign_date('start_long') %> in order to be eligible to receive the all organizer thank-you gift.

## Кога ще получа моя подарък?

We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options?

No. Thank-you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Дали трябва да е регистрирано цялото училище за да спечели $10,000 за хардуер?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Кой има право да спечели $10,000 в хардуер?

Наградата се ограничава само за публични училища К-12 САЩ. За да се класирате, цялото училище трябва да се регистрира за часът на кодирането до 16 ноември 2015 г. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

## Защо $10,000 хардуерната награда е достъпна само за държавни училища?

We would love to help teachers in public and private schools alike, but at this time, it comes down to logistics. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## Кога е крайният срок за кандидатстване за наградата за хардуер?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (<%= campaign_date('short') %>), can I still qualify for prizes?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## Аз съм извън САЩ. Мога ли да спечеля награда?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>