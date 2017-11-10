---
title: <%=hoc_s(titre_inscription_merci) %>
layout: wide
nav: how_to_nav
social:
  "og:title": '<%=hoc_s(:tag_meta_titre_og) %>'
  "og:description": <%= hoc_s(tag_meta_déscription_og) %>
  "og:image": 'http://<%=requête.hôte%>/images/heureducode-2015-vignette-vidéo.png'
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": 'http://<%=requête.hôte%>'
  "twitter:card": joueur
  "twitter:site": '@code. org'
  "twitter:url": 'http://<%=requête.hôte%>'
  "twitter:title": '<%= hoc_s(:étiquette_meta_twitter_titre) %>'
  "twitter:description": '<%=hoc_s(:étiquette_meta_twitter_déscription) %>'
  "twitter:image:src": 'http://<%=requête.hôte%>/images/heureducode-2015-vignette-vidéo.png'
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Merci de vous être inscrit(e) pour organiser une Heure de Code !

En guise de remerciement pour avoir aidé les étudiants à commencer à apprendre l'informatique, nous aimerions vous offrir un ensemble gratuit de posters créés par des professionnels et présentant différents modèles pour votre classe. Utilisez le code promotionnel "FREEPOSTERS" au moment de payer. (Remarque: offre disponible jusqu'à épuisement des stocks et vous devrez couvrir les frais d'expédition. Si ce n'est pas dans votre budget, les fichiers PDF sont disponibles pour l'imprimer vous même.). Vu que ces affiches sont livrées des États-Unis, les frais d'expédition peuvent être pas mal hauts dans le cas de livrage internationel ou au Canada. Nous comprenons que ce n'est peut-être pas dans votre budget, et nous vous encourageons à imprimer les [files PDF](https://code.org/inspire) pour votre classe.)  
<br /> [<button>Obtenez les affiches</button>](https://store.code.org/products/code-org-posters-set-of-12)Utilisez le code spécial FREEPOSTERS

<br /> **L'Heure de Code prend course pendant <%=date_de_campaigne('complet') %>. Nous serons en contact sur le sujet de nouveaux tutoriels et d'autres nouvelles excitantes au fur et à mesure qu'ils surgissent. En attendant, que pouvez-vous faire en ce moment?**

## 1. Passez le message auprès de votre école et de votre communeauté

Vous venez de joindre le mouvement Une Heure de Code. Parlez-en à vos amis avec **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encouragez les autres à y participer [avec nos exemples de courriels.](%= resolve_url('/promote/resources#sample-emails') %) Contactez votre directeur et proposez à chaque classe de votre ècole de s'inscrire. Recruitez un groupe local - club scoutes, église, université, groupe de vétérans, union de travail, ou même quelques amis. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Invite a local politician or policy maker to visit your school for the Hour of Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

Utilisez ces [affiches, banderoles, autocollants, vidéos et plus encore](%= resolve_url('/promote/resources') %) pour votre évènement.

## 2. Trouvez un bénévole à proximité pour vous aider lors de votre événement

[Cherchez notre carte de bénévoles](%= resolve_url('https://code.org/volunteer/local') %) pour des bénévoles qui peuvent visiter votre salle de classe ou parler en vidéo à distance afin d'encourager vos élèves sur le sujet de toutes les possibilités avec l'informatique.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>