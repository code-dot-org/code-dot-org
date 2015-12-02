* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Een uur code 2015 prijzen

<% if @country == 'la' %>

# Prijzen voor elke organisator

Elke leraar die een uur code organiseert voor leerlingen ontvangt 10 GB Dropbox ruimte als bedankje!

<% else %>

## Prijzen voor ELKE organisator

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 scholen winnen een set laptops voor een hele klas (of $10.000 voor andere technologie)

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

![afbeelding](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![afbeelding](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![afbeelding](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![afbeelding](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![afbeelding](/images/fit-175/Hadi-Partovi.jpg)  
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

# Veelgestelde Vragen

## Wie komt in aanmerking voor de organisator bedankjes?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Is er een deadline om voor de bedankjes in aanmerking te komen?

Je moet je inschrijven **voor** <%= campaign_date('start_long') %> om in aanmerking te komen voor een organisator bedankje.

## Wanneer ontvang ik mijn bedankje?

We nemen contact op in december, na " Computer Science Education Week" (<%= campaign_date('full') %>) met de stappen waarmee u uw bedankje kan kiezen.

## Kan ik alle bedankjes kiezen?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Moet uw hele school meedoen om $10.000 aan hardware te verdienen?

Ja. Uw hele school moet meedoen om in aanmerking te komen voor de prijs, maar slechts één persoon hoeft zich te registreren en het hardware prijs formulier te versturen. Het formulier staat [hier](%= resolve_url('/prizes/hardware-signup') %). Elke leraar die meedoet zal individueel zijn of haar klas moeten [inschrijven](%= resolve_url('/') %) om in aanmerking te komen voor een organisator bedankje.

## Wie komt in aanmerking voor de $10.000 hardware prijs?

Alleen voor scholen in het basis- en middelbaar onderwijs. Om in aanmerking te komen moet uw hele school registreren voor het CodeUur in 16 November 2015. Een school in iedere Amerikaanse staat krijgt computers voor een heel klaslokaal. Code.org selecteert winnaars en bericht ze via de mail voor 1 december 2015.

## Waarom is de prijs van $10.000 hardware alleen beschikbaar voor openbare scholen?

We zouden graag leraren willen ondersteunen in openbare en privé scholen, maar op dit moment is dat niet haalbaar. We werken samen met [DonorsChoose.org](http://donorschoose.org) om de klassenprijzen te beheren. Zij werken uitsluitend met K-12 scholen in de VS. Volgens DonorsChose.org is de organisatie beter in staat om nauwkeurige gegevens te verzamelen van openbare scholen.

## Wat is de deadline om voor de hardwareprijs in aanmerking te komen?

Om in aanmerking te komen moet je het [hardware aanvraag formulier](%= resolve_url('/prizes/hardware-signup') %) invullen voor 16 november 2015. Een school in iedere Amerikaanse staat krijgt computers voor een heel klaslokaal. Code.org selecteert winnaars en bericht ze via de mail voor 1 december 2015.

## Als mijn hele school niet mee kan doen met een uur code tijdens "Computer Science Education Week" (<%= campaign_date('short') %>), kan ik dan nog steeds in aanmerking komen voor prijzen?

Ja, in het [hardware aanvraag formulier](%= resolve_url('/prizes/hardware-signup') %) kunt u aangeven op welke data uw hele school mee doet.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video-chat met een gastspreker:

Prijs beperkt tot K-12 klaslokalen in de VS en Canada alleen. Code.org zal winnende scholen willekeurig selecteren, een timeslot kiezen voor de webchat, en samenwerken met de betreffende leraar om de technische details op te zetten. Niet uw hele school hoeft zich aan te melden om in aanmerking te komen voor deze prijs. Both public and private schools are eligible to win.

<% end %>

## Ik ben buiten de Verenigde Staten. Kom ik in aanmerking voor prijzen?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>