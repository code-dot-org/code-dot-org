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

# Obrigado por se inscrever para sediar a Hora do Código!

Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode *mudar suas vidas*, no período de <%= campaign_date('full') %>. Entraremos em contato para falar dos prêmios, novos tutoriais e outras atualizações. O que você pode fazer agora?

## 1. Divulgue

Você acabou de se juntar ao movimento da Hora do Código. Conte ao seus amigos usando a hashtag **#HoraDoCodigo**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem.

## 4. Peça para seu empregador participar

[Envie esse e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para seu gerente ou CEO.

## 5. Promova a Hora do Código em sua comunidade

[Reúna um grupo local](<%= resolve_url('/promote/resources#sample-emails') %>)— clube de escoteiros, igreja, universidade, grupo de veteranos, sindicato, ou até mesmo alguns amigos. Você não precisa estar na escola para aprender novas habilidades. Use estes [cartazes, banners, adesivos, vídeos e muito mais](<%= resolve_url('/promote/resources') %>) em seu próprio evento.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código. Isso pode ajudar a criar um suporte para a ciência da computação em sua área além de uma hora de programação.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>