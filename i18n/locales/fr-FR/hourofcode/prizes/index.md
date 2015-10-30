* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Prix Une Heure de Code 2015

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# Prix pour chaque organisateur

Chaque éducateur qui organise Une Heure de Code pour des étudiants, reçoit 10 Go d'espace Dropbox comme cadeau de remerciement !

<% else %>

## Des prix pour chaque organisateur

**Chaque** éducateur qui organise Une Heure de Code peut recevoir **10 $ pour des achats sur Amazon.com ou Microsoft Windows Store** comme cadeau de remerciement !

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 écoles gagneront un ensemble d'ordinateurs portables pour la classe (ou 10 000 $ pour des achats technologiques)

Une école chanceuse dans *chaque* état américain (dont Washington D.C.) gagnera $ 10 000 o valoir sur l'achat de matériels technologiques. [Inscrivez-vous ici](%= resolve_url('/prizes/hardware-signup') %) pour être admissibles et [**découvrir les gagnants de l'an dernier**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# Foire aux questions

## Est-ce que tous les organisateurs sont admissibles pour recevoir le cadeau de remerciement ?

Les organisateurs américains et internationaux qui ne le sont pas sont admissibles pour recevoir le cadeau de remerciement. Cependant, les 10K $ de matériels informatiques sont limités aux résidents américains.

## Y a-t-il une date limite pour s'inscrire et recevoir le cadeau de remerciement pour les organisateurs ?

Vous devez vous inscrire **avant** <%= campaign_date('start_long') %> afin d'être admissible et recevoir le cadeau de remerciement pour les organisateurs.

## Quand vais-je recevoir mon cadeau de remerciement ?

Nous vous contacterons en décembre après la semaine de l'éducation des sciences informatiques (<%= campaign_date('full') %>) avec les prochaines étapes sur la façon de choisir votre cadeau de remerciement.

## Est-ce que je peux obtenir plusieurs cadeaux de remerciement ?

Non. Les cadeaux de remerciement sont limités à un par l'organisateur. Nous vous contacterons en décembre après La semaine d'éducation des sciences informatiques avec avec les prochaines étapes sur la façon d'acquérir votre cadeau de remerciement.

<% if @country == 'us' %>

## L'ensemble de votre école doit-il participer pour remporter la somme de 10 000 $ en matériel ?

Oui. Toute votre école doit participer pour être éligible au tirage au sort, mais une seule inscription et formulaire de demande de prix de matériel suffisent [formulaire disponible ici](%= resolve_url('/prizes/hardware-signup') %). Chaque enseignant participant devra [inscrire](%= resolve_url('/') %) sa classe individuellement afin de recevoir le cadeau de remerciement dédié aux organisateurs.

## Qui est admissible pour gagner la somme de 10 000 $ en matériel informatique ?

Prix limité aux écoles publiques américaines. Afin de participer, votre établissement scolaire doit s'enregistrer à Une Heure de Code, avant le 16 novembre 2015. Une école, par état américain, recevra un ensemble d'ordinateurs portables. Code.org sélectionnera et contactera les gagnants par courriel vers le 1er décembre 2015.

## Pourquoi le prix de 10 000 $ d'achat de matériek est-il réservé aux écoles publiques ?

Nous serions ravis d'aider de la même façon les enseignants dans les écoles publiques et privées, mais pour l'instant, nous sommes dépendants de considérations logistiques. Nous avons un partenariat avec [DonorsChoose.org](http://donorschoose.org) pour offrir les prix et celui n'inclut que les écoles publiques américaines. Selon DonorsChoose.org, l'organisation peut accèder à des données cohérentes et précises uniquement pour les écoles publiques.

## Quelle est la date limite pour postuler au prix pour gagner du matériel ?

Pour être admissible, vous devez remplir le [formulaire de demande de matériel](%= resolve_url('/prizes/hardware-signup') %) avant le 16 novembre 2015. Une école, par état américain, recevra un ensemble d'ordinateurs portables. Code.org sélectionnera et contactera les gagnants par courriel vers le 1er décembre 2015.

<% end %>

## Si mon école ne peut pas faire l'Heure de Code au cours de la semaine de l'éducation des sciences informatiques (<%= campaign_date('short') %>), est-ce que je peux toujours être admissible pour les prix ?

Oui, dans le [formulaire de demande de matériel](%= resolve_url('/prizes/hardware-signup') %) incluez les dates auxquelles toute votre école participera.

## Je ne suis pas aux États-Unis. Suis-je éligible pour les prix ?

Oui, tous les organisateurs, américains ou non, sont admissibles pour recevoir le cadeau de remerciement pour les organisateurs. Cependant, ce n'est pas le cas pour les 10K $ de prix pour l'achat de matériel.

<% end %> <%= view :signup_button %>