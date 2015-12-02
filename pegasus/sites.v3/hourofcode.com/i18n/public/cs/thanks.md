---
title: <%= hoc_s(:title_signup_thanks) %>
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

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Děkujeme, že jste nabízíte hostování akce Hodina kódu!

Dáváte šanci všem studentům po celém světě se zúčastnit Hodiny kódu, která může *změnit zbytek jejich života*, during <%= campaign_date('full') %>. Ozveme se ohledně cen, nových tutoriálů a dalších důležitých novinek. Co můžete udělat dále?

## 1. Povídejte o tom

Právě jste se připojili do akce Hodina kódu. Povězte to přátelům hashtagem **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 2. Požádejte, aby celá vaše škola nabídla akci Hodinu kódu

[Poslat tento email](<%= resolve_url('/promote/resources#sample-emails') %>) vašemu řediteli školy a vyzvat každou třídu ve škole se přihlásit.

## 4. Požádejte svého zaměstnavatele, aby se zapojil

[Pošlete tento email](<%= resolve_url('/promote/resources#sample-emails') %>) vašemu nadřízenému nebo řediteli společnosti.

## 5. Propagujte akci Hodina kódu ve vaší komunitě

[Získejte místní skupinu](<%= resolve_url('/promote/resources#sample-emails') %>)— chlapecké/dívčí kluby, církev, univerzity, veteránské spolky, odboráře, nebo dokonce některé přátelé. Nemusíte být ve škole, abyste se naučili nové dovednosti. Používejte tyto [plakáty, banery, nálepky, videa a další](<%= resolve_url('/promote/resources') %>) pro vaši vlastní událost.

## 6. Požádejte místní politity, aby podpořili akci Hodina kódu

[Pošlete tento email](<%= resolve_url('/promote/resources#sample-emails') %>) vašim místním politikům, městské radě nebo školní radě a pozvěte je k návštěvě vaší školy pro Hodinu kódu. Může to pomoci rozvoji informatiky ve vašem regionu za jednu hodinu.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>