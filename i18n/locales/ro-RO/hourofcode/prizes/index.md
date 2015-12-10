* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premiile evenimentului Hour of Code 2015

<% if @country == 'la' %>

# Premii pentru fiecare organizator

Fiecare educator sau profesor ce va organiza un eveniment Hour of Code pentru elevii sai va primi 10 GB spațiu Dropbox ca un cadoul de multumire!

<% else %>

## Premii pentru FIECARE organizator

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 de şcoli vor primi un set de laptop-uri pentru fiecare clasa ( sau alte device-uri tehnologice in valoare de 10.000 de dolari)

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

![imagine](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![imagine](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![imagine](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![imagine](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![imagine](/images/fit-175/Hadi-Partovi.jpg)  
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

# Întrebări frecvente

## Cine este eligibil pentru a primi cadourile de mulțumire destinate organizatorilor?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Este vreun termen limita în a te inscrie pentru a primi premiul universal pentru organizatori?

Trebuie să te inregistrezi **înainte de** <%= campaign_date('start_long') %> pentru a fi eligibil sa primesti toate cadourile de multumire ale organizatorilor.

## Cand îmi voi primi cadoul de mulțumire?

Va vom contacta in decembrie după Saptamana Educatiei in tehnologia computerelor(<%= campaign_date('full') %>) cu următorii paşi pentru a intra in posesia premiilor de multumire.

## Pot intra in posesia tuturor variantelor de premii de multumire?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Intreaga şcoală trebuie sa participe pentru a câştiga 10.000 dolari în echipamente hardware?

Da. Intreaga scoala ar trebui sa participe pentru a fi eligibila premiului insa doar o singura persoana trebuie sa o inregistreze si sa completeze formularul de aplicare pentru premiul hardware[aici](%= resolve_url('/prizes/hardware-signup') %). Fiecare profesor participant va trebui sa[isi inscrie](%= resolve_url('/') %)clasa individual cu scopul de a primi tot cadoul de multumire pentru organizator.

## Cine este eligibil pentru a primi premiul de produse hardware in valoare de 10.000 de dolari?

Premiul limitat numai pentru şcoli publice din Sua. Pentru a te califica, intreaga scoala trebuie sa fie inregistrata pentru evenimentul Hour of Code pana pe 16 noiembrie 2015. O şcoală din fiecare stat al Sua va primi un set de calculatoare pentru clasă. Code.org va selecta si anunta castigatorii prin e-mail pana pe 1 decembrie 2015.

## De ce premiul de 10.000 dolari in echipamente tehnologice este disponibil numai pentru şcolile publice?

Ne-ar plăcea sa putem ajuta profesorii din scolile publice şi şcolile private deopotrivă, dar în acest moment, este vorba doar de logistica. Avem un parteneriat cu [DonorsChoose.org](http://donorschoose.org) ca să administreze premii cu finanţarea în clase, care funcţionează numai cu şcoli publice. Potrivit DonorsChoose.org, organizarea este mai în măsură să acceseze date consecvente şi exacte, care sunt disponibile pentru scolile publice.

## Când este termenul limită pentru aplicarea la Premiul hardware?

Pentru a te califica, trebuie sa completezi [formularul de aplicație pentru premiul hardware](%= resolve_url('/prizes/hardware-signup') %)pana pe 16 noiembrie, 2015. O şcoală din fiecare stat al Sua va primi un set de calculatoare pentru clasă. Code.org va selecta si anunta castigatorii prin e-mail pana pe 1 decembrie 2015.

## Dacă scoala mea nu va face in intregime evenimentul Hour of Code in cursul Saptamanii Educatiei in Tehnologia computerelor (<%= campaign_date('short') %>), ma pot califica pentru premii?

Da, in [formularul de aplicare pentru premiul Hardware](%= resolve_url('/prizes/hardware-signup') %)sunt incluse datele in care toata scoala ta a participat.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Conferinta video cu un vorbitor invitat:

Premiul se limitează la K-12 săli de clasă în SUA şi Canada numai. Code.org va selecta şcolile câştigătoare, oferind un slot de timp pentru conferinta online şi va lucra cu profesorul pentru a pune la punct detaliile legate de tehnologie. Întreaga şcoală nu trebuie să aplice pentru a se califica pentru acest premiu. Both public and private schools are eligible to win.

<% end %>

## Eu sunt în afara Statelor Unite. Ma pot califica pentru premii?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>