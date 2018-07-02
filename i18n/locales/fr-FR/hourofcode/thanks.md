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

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Merci de vous être inscrit(e) pour organiser une Heure de Code !

En guise de remerciement pour avoir aidé les étudiants à commencer à apprendre l'informatique, nous aimerions vous offrir un ensemble gratuit de posters créés par des professionnels et présentant différents modèles pour votre classe. Utilisez le code promotionnel "FREEPOSTERS" au moment de payer. (Remarque: offre disponible jusqu'à épuisement des stocks et vous devrez couvrir les frais d'expédition. Si ce n'est pas dans votre budget, les fichiers PDF sont disponibles pour l'imprimer vous même.). Vu que ces affiches sont livrées des États-Unis, les frais d'expédition peuvent être pas mal hauts dans le cas de livrage internationel ou au Canada. Nous comprenons que ce n'est peut-être pas dans votre budget, et nous vous encourageons à imprimer les [files PDF](https://code.org/inspire) pour votre classe.)  
<br /> [<button>Obtenez les affiches</button>](https://store.code.org/products/code-org-posters-set-of-12)Utilisez le code spécial FREEPOSTERS

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org will select the winning classrooms. In the meantime, check out some of the robotics and circuits activities. Please note that this is only open for US schools. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Passez le message auprès de votre école et de votre communeauté

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](%= resolve_url('/promote/resources#sample-emails') %) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Invite a local politician or policy maker to visit your school for the Hour of Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

Utilisez ces [affiches, banderoles, autocollants, vidéos et plus encore](%= resolve_url('/promote/resources') %) pour votre évènement.

## 2. Trouvez un bénévole à proximité pour vous aider lors de votre événement

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>