---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Premi per l'Ora del Codice 2015

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# Premi per ogni organizzatore

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank-you gift!

<% else %>

## Premi per ogni organizzatore

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 scuole vinceranno un set di computer portatili per classi (o $10.000 per altre tecnologie)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# FAQ

## Tutti gli organizzatori hanno la possibilità di ricevere il regalo di ringraziamento?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift. The $10K hardware prize is limited to US residents only.

## C'è una scadenza per iscriversi per ricevere il regalo di ringraziamento per gli organizzatori?

You must sign up **before** <%= campaign_date('start_long') %> in order to be eligible to receive the all organizer thank-you gift.

## Quando riceverò il mio regalo di ringraziamento?

We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options?

No. Thank-you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Does your whole school have to enter to win the $10,000 in hardware?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](<%= resolve_url('/prizes/hardware-signup') %>). Every teacher participating will need to [sign up](<%= resolve_url('/') %>) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

Prize limited to public K-12 U.S. schools only. To qualify, your entire school must register for the Hour of Code by November 16, 2015. One school in every U.S. state will receive a class-set of computers. Code.org selezionerà i vincitori e li avviserà via email entro il 1° dicembre 2015.

## Why is the $10,000 hardware prize only available to public schools?

We would love to help teachers in public and private schools alike, but at this time, it comes down to logistics. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## When is the deadline to apply for the hardware prize?

To qualify, you must complete the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) by November 16, 2015. One school in every U.S. state will receive a class-set of computers. Code.org selezionerà i vincitori e li avviserà via email entro il 1° dicembre 2015.

<% end %>

## If my whole school can’t do the Hour of Code during Computer Science Education Week (<%= campaign_date('short') %>), can I still qualify for prizes?

Yes, in the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) include the dates that your whole school is participating.

## Io non sono residente negli Stati Uniti. Posso usufruire dei premi?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>