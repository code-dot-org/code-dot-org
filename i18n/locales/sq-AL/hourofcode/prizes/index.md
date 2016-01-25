* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Shpërblimet e Orës së Kodimit 2015

<% if @country == 'la' %>

# Shpërblim për secilin organizator

Çdo mësues që organizon një Orë Kodimi për studentët fiton 10 GB hapësirë në Dropbox si dhuratë falenderimi!

<% else %>

## Shpërblime për ÇDO organizues

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 shkolla fituan një set me laptop (ose $10,000 për teknologji të tjera)

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

![Foto](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![Foto](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![Foto](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![Foto](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![Foto](/images/fit-175/Hadi-Partovi.jpg)  
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

# Pyetje të Shpeshta (PESH)

## Kush është i pranueshëm për të marr dhuratat e falenderimit?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## A ka ndonjë afat përfundimtar për tu regjistruar për të marr dhuratën falenderuese?

You duhet të regjistroheni **përpara** <%= campaign_date('start_long') %> që të pranoheni për të marr dhuratën falenderuese.

## Kur mund ta marr dhuratën falenderuese?

Ne do ju kontakotjmë në dhjetor pas Javës Edukative të Shkencave Kompjuterike (<%= campaign_date('full') %>) me mundësin për të kompesuar zgjedhjen tuaj për dhuratën falenderuese.

## A mundem unë të kompesoj të gjithat opsionet e dhuratave falenderuese?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## A duhet e gjithë shkolla juaj të futet për të fituar $10,000 në hardware?

Po. Gjithë shkolla juaj duhet të marri pjesë që të pranoheni për çmimin, por vetëm një person mund të regjistrohet dhe të paraqesë formularin e aplikimit Shpërblime Hardware [këtu](%= resolve_url('/prizes/hardware-signup') %). Çdo mësues që do jetë pjesëmarrës duhet të [regjistrojë](%= resolve_url('/') %) klasën e tyre individualisht për të marr dhuratën falenderuese.

## Kush mund të pranohet për të fituar 10.000$ pajisje hardware?

Shpërblim i dedikuar vetëm për shkollat Amerikane deri në klasë të 12-të. Për t'u kualifikuar, shkolla juaj duhet të regjistrohet për Orën e Kodimit jo më larg se 16 nëntor, 2015. Një shkollë nga çdo shtet në ShBA do të marrë një set kompjuterash për klasa. Code.org do të përzgjedh dhe do të njoftojë fituesit përmes email-it, në 1 dhjetor 2015.

## Pse çmimi $10,000 për hardware është në dispozicion vetëm për shkollat publike?

Ne duam të ndihmojmë mësuesit në shkollat publike dhe private njësoj, por në këtë kohë, nuk është e mundur përshkak të logjistikës. Ne kemi partneritet me [DonorsChoose.org ](http://donorschoose.org) për të administruar shpërblimet e financimit të klasës, e cila punon vetëm me publikun, shkollat K-12 në SHBA. Sipas DonorsChoose.org, organizata është më mirë në gjendje që të hyjë në të dhënat konsistente dhe të sakta që janë në dispozicion për shkollat publike.

## Kur është afati i fundit për të aplikuar për çmimin e hardware-it?

Që të kualifikoheni, ju duhet të kompletoni [formularin Hardware Application](%= resolve_url('/prizes/hardware-signup') %) duke filluar nga 16 nëntor, 2015. Një shkollë nga çdo shtet në ShBA do të marrë një set kompjuterash për klasa. Code.org do të përzgjedh dhe do të njoftojë fituesit përmes email-it, në 1 dhjetor 2015.

## Nëse jo e gjithë shkolla nuk mund të bëjë Orën e Kodimit gjatë Javës Edukative të Shkencës Kompjuterike (<%= campaign_date('short') %>), a mund të kualifikohem për shpërblimin?

Po, në [formularin Hardware Application](%= resolve_url('/prizes/hardware-signup') %) përfshini datën kur e gjithë shkolla do të marr pjesë.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Komunikim përmes videos me mysafirin e ftuar:

Shpërblime të dedikuara vetëm për nxënësit deri në klasë të 12-të në Shba dhe Kanada. Code.org do të përzgjedh klasën fituese, përcaktoje kohën kur të realizohet komunikim përmes web-it, dhe do të koordinojë mësimdhënësit për të përcaktuar detajet tjera teknologjike. Jo e gjithë shkolla juaj duhet të aplikoje për të kandiduar për shpërblim. Both public and private schools are eligible to win.

<% end %>

## Unë jam jashtë Shteteve të Bashkuara. A mund të kualifikohem për shpërblime?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>