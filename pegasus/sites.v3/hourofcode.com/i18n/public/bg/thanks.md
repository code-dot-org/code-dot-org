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

# Благодаря за регистрирането ви като домакин на Hour of Code събитие!

Вие давате възможност на учениците по целия свят да учат с Hour of Code, който може да *промени останалата част от живота им*, по време на <%= campaign_date('full') %>. Ние ще се свържем с Вас за награди, нови уроци и други вълнуващи актуализации. Какво можете да направите?

## Разпространете новината

Вие току-що се присъединихте към движението на Hour of Code. Кажете на приятелите си за**#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попитайте във Вашето училище, дали се предлага участие в Часът на кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>), на директора и предизвикайте всяка класна стая в училището да се регистрира. <% if @country == 'us' %> Едно училище от *всеки* щат на Сащ (и Вашингтон) ще спечели $10,000 за технологии. [ Регистрирайте се тук](<%= resolve_url('/prizes/hardware-signup') %>) да бъдете класирани и [ **вижте победителите от миналата година**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. Предложете на Вашия работодател да се включи в инициативата

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия ръководител или изпълнителен директор на компанията.

## 4. Рекламирайте Hour of Code във Вашата Община

[ Ангажирайте локална група](<%= resolve_url('/promote/resources#sample-emails') %>) — момчешки/момичешки скаутски клуб, църква, университет, ветерани, синдикат или дори и някои приятели. Не е задължително да си в училище, за да придобиеш нови умения. Използвайте тези [ плакати, банери, стикери, видео клипове и др.](<%= resolve_url('/promote/resources') %>) за собственото си събитие.

## 5 Ангажирайте местната власт в подкрепа на Часът на Кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия местен представител, градския съвет или училищното настоятелство и ги поканете да посетят Вашето училище за Часът на кода. То може да помогне за изграждане на подкрепа за компютърни науки във вашия район и след Часа на кода.

<%= view 'popup_window.js' %>