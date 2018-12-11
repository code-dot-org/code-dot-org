---
title: <%= hoc_s(:title_signup_thanks).inspect %>
layout: wide
nav: how_to_nav
social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"
  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Tak fordi du vil arrangere Hour of Code!

<br /> **The Hour of Code kører i perioden < % = campaign_date('full') %> og vi vil være i kontakt om nye tutorials og andre spændende opdateringer, når de kommer ud. Hvad kan du gøre i mellemtiden?**

## 1. Spred budskabet i din skole og dit lokalområde

Du har lige sluttet dig til Hour of Code. Fortæl dine venner om dette med **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Opfordr andre til at deltage [med vores e-mail eksempler.](%= resolve_url('/promote/resources#sample-emails') %) Kontakt din skoleleder og få alle klasser på din skole til at tilmelde sig. Rekruttér en lokal gruppe — spejderklub, kirke, universitet, fagforening eller måske nogle venner. You don't have to be in school to learn new skills. Invitér en lokalpolitiker eller beslutningstager til at besøge din skole til Hour of Code. It can help build support for computer science in your area beyond one hour.

Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 2. Find en lokal frivillig til at hjælpe dig med din begivenhed.

[Søg på vores kort](%= codeorg_url('/volunteer/local') %) efter frivillige, som kan besøge dit klasseværelse eller brug videochat for at inspirere dine elever om alle de muligheder, der er med datalogi.

## 3. Planlæg jeres Hour of Code

Vælg en [Hour of Code aktivitet](https://hourofcode.com/learn) for dit klasseværelse og [gennemgå denne how-to guide](%= resolve_url('/how-to') %).

# Gå videre når Hour of Code er slut

<% if @country == 'us' %> En Hour of Code er bare begyndelsen. Uanset om du er en administrator, lærer eller fortaler, har vi [faglig udvikling, pensum og ressourcer til at hjælpe dig med at bringe computervidenskabsklasser til din skole eller at udvide det tilbud, som du allerede giver.](https://code.org/yourschool) Hvis du allerede underviser i computervidenskab, brug så ressourcerne fra CS Education Week til at få yderligere støtte fra din skole, forældre og samfund.

Du har mange valgmuligheder, som kan passe til din skole. De fleste af de organisationer, der tilbyder Hour of Code tutorials har også tilgængeligt pensum og faglige udviklingsmuligheder. Hvis du finder en lektion du kan lide, spørg så hvordan du kan gå videre. For at hjælpe dig i gang, vi har fremhævet en række [udbydere af pensum, der vil hjælpe dig eller dine elever med at gå ud over den ene time.](https://hourofcode.com/beyond)

<% else %> En Hour of Code er bare begyndelsen. De fleste af de organisationer, der tilbyder Hour of Code lektioner, har også pensum tilgængelig til at gå videre. For at hjælpe dig i gang, vi har fremhævet en række [udbydere af pensum, der vil hjælpe dig eller dine elever med at gå ud over den ene time.](https://hourofcode.com/beyond)

Code.org tilbyder også komplette [indledende computer science kurser](https://code.org/educate/curriculum/cs-fundamentals-international) oversat til over 25 sprog uden omkostninger for dig eller din skole. <% end %>

<%= view 'popup_window.js' %>