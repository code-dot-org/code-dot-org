* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Prix Une Heure de Code 2015

<% if @country == 'la' %>

# Prix pour chaque organisateur

Chaque éducateur qui organise Une Heure de Code pour des étudiants, reçoit 10 Go d'espace Dropbox comme cadeau de remerciement !

<% else %>

## Des prix pour chaque organisateur

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 écoles gagneront un ensemble d'ordinateurs portables pour la classe (ou 10 000 $ pour des achats technologiques)

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

![image](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![image](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![image](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![image](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![image](/images/fit-175/Hadi-Partovi.jpg)  
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

# Foire aux questions

## Est-ce que tous les organisateurs sont admissibles pour recevoir le cadeau de remerciement ?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Y a-t-il une date limite pour s'inscrire et recevoir le cadeau de remerciement pour les organisateurs ?

Vous devez vous inscrire **avant** <%= campaign_date('start_long') %> afin d'être admissible et recevoir le cadeau de remerciement pour les organisateurs.

## Quand vais-je recevoir mon cadeau de remerciement ?

Nous vous contacterons en décembre après la semaine de l'éducation des sciences informatiques (<%= campaign_date('full') %>) avec les prochaines étapes sur la façon de choisir votre cadeau de remerciement.

## Est-ce que je peux obtenir plusieurs cadeaux de remerciement ?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## L'ensemble de votre école doit-il participer pour remporter la somme de 10 000 $ en matériel ?

Oui. Toute votre école doit participer pour être éligible au tirage au sort, mais une seule inscription et formulaire de demande de prix de matériel suffisent [formulaire disponible ici](%= resolve_url('/prizes/hardware-signup') %). Chaque enseignant participant devra [inscrire](%= resolve_url('/') %) sa classe individuellement afin de recevoir le cadeau de remerciement dédié aux organisateurs.

## Qui est admissible pour gagner la somme de 10 000 $ en matériel informatique ?

Prix limité aux écoles publiques américaines. Afin de participer, votre établissement scolaire doit s'enregistrer à Une Heure de Code, avant le 16 novembre 2015. Une école, par état américain, recevra un ensemble d'ordinateurs portables. Code.org sélectionnera et contactera les gagnants par courriel vers le 1er décembre 2015.

## Pourquoi le prix de 10 000 $ d'achat de matériek est-il réservé aux écoles publiques ?

Nous serions ravis d'aider de la même façon les enseignants dans les écoles publiques et privées, mais pour l'instant, nous sommes dépendants de considérations logistiques. Nous avons un partenariat avec [DonorsChoose.org](http://donorschoose.org) pour offrir les prix et celui n'inclut que les écoles publiques américaines. Selon DonorsChoose.org, l'organisation peut accèder à des données cohérentes et précises uniquement pour les écoles publiques.

## Quelle est la date limite pour postuler au prix pour gagner du matériel ?

Pour être admissible, vous devez remplir le [formulaire de demande de matériel](%= resolve_url('/prizes/hardware-signup') %) avant le 16 novembre 2015. Une école, par état américain, recevra un ensemble d'ordinateurs portables. Code.org sélectionnera et contactera les gagnants par courriel vers le 1er décembre 2015.

## Si mon école ne peut pas faire l'Heure de Code au cours de la semaine de l'éducation des sciences informatiques (<%= campaign_date('short') %>), est-ce que je peux toujours être admissible pour les prix ?

Oui, dans le [formulaire de demande de matériel](%= resolve_url('/prizes/hardware-signup') %) incluez les dates auxquelles toute votre école participera.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Vidéoconférence avec un invité:

L'attribution des prix s'avère limitée aux classes d'élémentaires et secondaires aux États-Unis et au Canada seulement. Code.org déterminera les classes gagnantes, établira une période pour la séance de clavardage et travaillera de concert avec l'enseignant afin de mettre en place les détails technologiques. Votre école, dans son ensemble, n'a pas besoin de postuler pour être admissible à ce prix. Both public and private schools are eligible to win.

<% end %>

## Je ne suis pas aux États-Unis. Suis-je éligible pour les prix ?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>