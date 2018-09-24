---
title: <%=hoc_s(titre_inscription_merci) %>
layout: wide
nav: how_to_nav
social:
  "og:title": "<%=hoc_s(:tag_meta_titre_og) %>"
  "og:description": "<%= hoc_s(tag_meta_déscription_og) %>"
  "og:image": "http://<%=requête.hôte%>/images/heureducode-2015-vignette-vidéo.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=requête.hôte%>"
  "twitter:card": joueur
  "twitter:site": "@code. org"
  "twitter:url": "http://<%=requête.hôte%>"
  "twitter:title": "<%= hoc_s(:étiquette_meta_twitter_titre) %>"
  "twitter:description": "<%=hoc_s(:étiquette_meta_twitter_déscription) %>"
  "twitter:image:src": "http://<%=requête.hôte%>/images/heureducode-2015-vignette-vidéo.png"
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Merci de vous être inscrit(e) pour organiser une Heure de Code !

En guise de remerciement pour avoir aidé les étudiants à commencer à apprendre l'informatique, nous aimerions vous offrir un ensemble gratuit de posters créés par des professionnels et présentant différents modèles pour votre classe. Utilisez le code promotionnel "FREEPOSTERS" au moment de payer. (Remarque: offre disponible jusqu'à épuisement des stocks et vous devrez couvrir les frais d'expédition. Si ce n'est pas dans votre budget, les fichiers PDF sont disponibles pour l'imprimer vous même.). Ces affiches sont expédiés depuis les États-Unis, les frais de ports peuvent être importants pour les envois au Canada et les envois internationaux. Nous comprenons que ce n'est peut-être pas dans votre budget, et nous vous encourageons à imprimer les [fichiers PDF](https://code.org/inspire) pour votre classe.)  
<br /> [<button>Obtenez les affiches</button>](https://store.code.org/products/code-org-posters-set-of-12)Utilisez le code spécial FREEPOSTERS

<% if @country == 'us' %> Grâce à la générosité de Ozobot, Dexter Industries, littleBits et Wonder Workshop, plus de 100 classes seront choisies pour recevoir des robots ou des circuits! Pour être éligible à la réception d'un kit, assurez-vous de remplir le sondage envoyé par Code.org à la suite de l'Heure de Code. Code.org choisira les classes gagnantes. En attendant, allez voir les activités sur les robots et les circuits. Notez toutefois que ces dotations ne sont accessibles qu'aux écoles des États-Unis. <% end %>

<br /> **L'Heure de Code se déroule du <%= campaign_date('full') %> et nous resterons actifs pour de nouveaux tutoriels et des mises à jour passionnantes au fur et à mesure de leurs publications. En attendant, que pouvez-vous faire?**

## 1. Passez le message auprès de votre école et de votre communeauté

Vous avez rejoint le mouvement de l'Heure de Code. Dites-le à vos amis en utilisant **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Motivez d'autres personnes à participer [avec nos exemples de mails.](%= resolve_url('/promote/resources#sample-emails') %) Contactez votre ditecteur et proposez à chaque classe de votre école de s'inscrire. Recrutez vos groupes locaux - club, église, université, groupe de travail, et même vos amis. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Invitez un politicien local pour visiter votre école à l'occasion de l'Heure de Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

Utilisez ces [affiches, banderoles, autocollants, vidéos et plus encore](%= resolve_url('/promote/resources') %) pour votre évènement.

## 2. Trouvez un bénévole à proximité pour vous aider lors de votre événement

[Recherchez sur notre carte](%= codeorg_url('/volunteer/local') %) des bénévoles pouvant intervenir dans votre classe ou en échange vidéo à distance pour inspirer vos élèves sur l'étendue des possibilités de l'informatique.

## 3. Planifiez votre Heure de Code

Choisissez une [activité de l'Heure de Code](https://hourofcode.com/learn) pour votre classe et [lisez de guide pratique](%= resolve_url('/how-to') %).

# Après avoir fait Une Heure de Code

<% if @country == 'us' %> Une Heure de Code est juste le commencement. Que vous soyez directeur, professeur ou un partisan, nous avons [de la formation professionnelle, un curriculum complet et des ressources pour vous aider à créer des classe d'informatique dans votre école et augmenter votre offre.](https://code.org/yourschool) Si vous enseignez déjà l'informatique, utilisez ces ressources durant la semaine de l'enseignement de l'informatique, de façon à avoir plus de soutien de la part de votre direction, des parents et de votre communauté.

Vous avez plusieurs choix adaptables à votre école. La plupart des organismes proposant les tutoriels de l'Heure de Code proposent aussi la formation professionnelle et le curriculum. Si vous trouvez une leçon qui vous plaît, vous pouvez demander comment commencer. Pour vous aider à démarrer, nous avons sélectionné un certain nombre d'[organismes qui peuvent vous aider vous ou vos élèves à aller plus loin qu'une heure.](https://hourofcode.com/beyond)

<% else %> Une Heure de Code est juste le commencement. La plupart des organismes proposant l'Heure de Code proposent aussi le curriculum pour aller plus loin. Pour vous aider à démarrer, nous avons sélectionné un certain nombre d'[organismes qui peuvent vous aider vous ou vos élèves à aller plus loin qu'une heure.](https://hourofcode.com/beyond)

Code.org propose aussi une [un cours complet d'introduction à l'information](https://code.org/educate/curriculum/cs-fundamentals-international) traduit dans plus de 25 langues, et gratuit pour vous ou votre école. <% end %>

<%= view 'popup_window.js' %>