* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code награди

<% if @country == 'la' %>

# Награди за всеки организатор

Всеки учител, който е домакин на Hour of Code събитие за ученици, получава 10 GB Dropbox пространство като подарък за благодарност!

<% else %>

## Награди за всеки организатор

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 щастливи училища ще спечелят набор от преносими компютри (или $10,000 за други технологии)

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

![изображение](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![изображение](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![изображение](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![изображение](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![изображение](/images/fit-175/Hadi-Partovi.jpg)  
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

# ЧЕСТО ЗАДАВАНИ ВЪПРОСИ

## Кой има право да получи организаторски подаръци?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Има ли краен срок за регистрация, за да получи всички организатор благодарствен подарък?

Трябва да се регистрирате **преди** <%= campaign_date('start_long') %> за да получите организаторски благодарствен подарък.

## Кога ще получа моя подарък?

Ние ще се свържем с Вас през декември след SCEdWeek (<%= campaign_date('full') %>) с насочващи стъпки, за това как да осребрите Вашия подарък.

## Мога ли да взема всички опционални предлагани подаръци?

Не. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Дали трябва да е регистрирано цялото училище за да спечели $10,000 за хардуер?

Да. Цялото училище трябва да участва, за да бъдете допуснати за награда, но само един човек трябва да се регистрира и подаде формуляра за кандидатстване за хардуерна награда [ тук](%= resolve_url('/prizes/hardware-signup') %). Всеки учител, който участва ще трябва да [sign up](%= resolve_url('/') %) си регистрира отделно класната стая, за получаване на организаторски подарък.

## Кой има право да спечели $10,000 в хардуер?

Наградата се ограничава само за публични училища К-12 САЩ. За да се класирате, цялото училище трябва да се регистрира за часът на кодирането до 16 ноември 2015 г. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

## Защо $10,000 хардуерната награда е достъпна само за държавни училища?

Ще се радваме да помогамем на учителите в държавните и частните училища еднакво, но за сега всичко е въпрос на логистика. Ние си партнираме с [ DonorsChoose.org](http://donorschoose.org), които управляват финансирането на класните стаи, спечелили хардуерни награди, те работят само с обществени К-12 училища. Според DonorsChoose.org организацията има по-добър достъп до последователни и точни данни в държавните училища.

## Кога е крайният срок за кандидатстване за наградата за хардуер?

За да се класирате, трябва да попълните [ формуляр за кандидатстване за хардуерн награда](%= resolve_url('/prizes/hardware-signup') %) от 16 ноември 2015 г. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

## Ако цялото училище не може да направи Hour of Code по време на CSEdWeek(<%= campaign_date('short') %>), може ли да се класираме за награди?

Да, във [ формуляра за кандидатстване за хардуер се](%= resolve_url('/prizes/hardware-signup') %) включват датите, в които цялото училище участва.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Видео чат с гост-лектор:

Наградата се ограничава до К-12 класни стаи в САЩ и Канада само. Code.org произволно ще избере печелившите училища, за да предостави време за уеб чат и техническа поддръжка на съответния учител за настройките. Не е нужно цялото училище да бъде регистрирано, за да участвате за тази награда. Both public and private schools are eligible to win.

<% end %>

## Аз съм извън САЩ. Мога ли да спечеля награда?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>