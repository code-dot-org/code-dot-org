* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Merci de vous être inscrit(e) pour organiser Une Heure de Code !

Grâce à vous, des étudiants du monde entier vont pouvoir apprendre en faisant Une Heure de Code, moment qui pourrait *changer le reste de leur vie*, au cours de < % = campaign_date('full') % &gt. Nous prendrons contact avec vous concernant les prix, les nouveaux tutoriels et les nouvelles mises à jour qui pourraient vous intéresser. Que pouvez-vous faire maintenant ?

## 1. Parlez-en autour de vous

Vous venez de rejoindre le mouvement Une Heure de Code. Parlez-en à vos amis avec **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Proposez à votre école de participer à Une Heure de Code

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your principal and challenge every classroom at your school to sign up. Pour cela, c'est simple ! [Inscrivez-vous ici](%= resolve_url('/prizes/hardware-signup') %) pour être admissibles. <% end %>

## 3. Invitez votre employeur à s'impliquer

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your manager or company's CEO.

## 4. Promouvez votre Heure de Code dans votre communauté

[Recruit a local group](%= resolve_url('/promote/resources#sample-emails') %)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 5. Demandez à un élu local de soutenir l'initiative Une Heure de Code

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

<%= view 'popup_window.js' %>