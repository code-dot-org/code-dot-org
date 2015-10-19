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

# Shpërblim për secilin organizator

Çdo mësues që organizon një Orë Kodimi për studentët fiton 10 GB hapësirë në Dropbox si dhuratë falenderimi!

<% else %>

## Shpërblime për ÇDO organizues

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

## 51 shkolla fituan një set me laptop (ose $10,000 për teknologji të tjera)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# Pyetje të Shpeshta (PESH)

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## A duhet e gjithë shkolla juaj të futet për të fituar $10,000 në hardware?

Po. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

Shpërblim i dedikuar vetëm për shkollat Amerikane deri në klasë të 12-të. Për t'u kualifikuar, shkolla juaj duhet të regjistrohet për Orën e Kodimit jo më larg se 16 nëntor, 2015. Një shkollë nga çdo shtet në ShBA do të marrë një set kompjuterash për klasa. Code.org do të përzgjedh dhe do të njoftojë fituesit përmes email-it, në 1 dhjetor 2015.

## Pse çmimi $10,000 për hardware është në dispozicion vetëm për shkollat publike?

Ne duam të ndihmojmë mësuesit në shkollat publike dhe private njësoj, por në këtë kohë, nuk është e mundur përshkak të logjistikës. Ne kemi partneritet me [DonorsChoose.org ](http://donorschoose.org) për të administruar shpërblimet e financimit të klasës, e cila punon vetëm me publikun, shkollat K-12 në SHBA. Sipas DonorsChoose.org, organizata është më mirë në gjendje që të hyjë në të dhënat konsistente dhe të sakta që janë në dispozicion për shkollat publike.

## Kur është afati i fundit për të aplikuar për çmimin e hardware-it?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. Një shkollë nga çdo shtet në ShBA do të marrë një set kompjuterash për klasa. Code.org do të përzgjedh dhe do të njoftojë fituesit përmes email-it, në 1 dhjetor 2015.

## Nëse shkolla ime nuk mund të bëjë Orën e Kodimit gjatë Javës Edukative të Shkencave Kompjuterike (Dhj. 8-14), a mundemi të kualifikohemi për shpërblimet?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## Unë jam jashtë Shteteve të Bashkuara. A mund të kualifikohem për shpërblime?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>