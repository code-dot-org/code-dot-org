---
title: <%= hoc_s(:title_signup_thanks).inspect %>
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

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Passez le message auprès de votre école et de votre communeauté

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](%= resolve_url('/promote/resources#sample-emails') %) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Invite a local politician or policy maker to visit your school for the Hour of Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

Utilisez ces [affiches, banderoles, autocollants, vidéos et plus encore](%= resolve_url('/promote/resources') %) pour votre évènement.

## 2. Trouvez un bénévole à proximité pour vous aider lors de votre événement

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Planifiez votre Heure de Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# Après avoir fait Une Heure de Code

<% if @country == 'us' %> Une Heure de Code est juste le commencement. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> Une Heure de Code est juste le commencement. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>