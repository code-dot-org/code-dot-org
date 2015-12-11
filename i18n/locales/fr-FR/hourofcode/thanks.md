* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Merci de vous être inscrit(e) pour organiser Une Heure de Code !

Grâce à vous, des étudiants du monde entier vont pouvoir apprendre en faisant Une Heure de Code, moment qui pourrait *changer le reste de leur vie*, au cours de <%= campaign_date('full') %>. Nous prendrons contact avec vous concernant les prix, les nouveaux tutoriels et les nouvelles mises à jour qui pourraient vous intéresser. Que pouvez-vous faire maintenant ?

## 1. Parlez-en autour de vous

Vous venez de rejoindre le mouvement Une Heure de Code. Parlez-en à vos amis avec **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](%= resolve_url('https://code.org/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 2. Proposez à votre école de participer à Une Heure de Code

[Envoyez cet email](%= resolve_url('/promote/resources#sample-emails') %) à votre principal ou au directeur de votre école et proposez à chaque professeur de s'inscrire.

## 4. Demandez à votre employeur de s'impliquer

[Envoyez cet email](%= resolve_url('/promote/resources#sample-emails') %) à votre PDG ou au gérant de votre société.

## 4. Faite la promotion de votre Heure de Code au sein de votre communauté

[Recrutez un groupe local](%= resolve_url('/promote/resources#sample-emails') %) — associations, club de scouts, église, Université, groupe d'anciens combattants, syndicat ou tout simplement vos amis. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Utilisez ces [affiches, banderoles, autocollants, vidéos et plus encore](%= resolve_url('/promote/resources') %) pour votre évènement.

## 6. Demandez à un élu local de soutenir Une Heure de Code

[Envoyez cet email](%= resolve_url('/promote/resources#sample-emails') %) à vos représentants locaux, Conseil municipal ou Commission scolaire et invitez-les à visiter votre école durant votre Heure de Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>