---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Благодаря за регистрирането ви като домакин на Часът на кодрането събитие!

Вие давате възможност на учениците по целия свят да учат един Час код, който може да *промени останалата част от живота им*, по време на < % = campaign_date('full') % >. Ние ще се свържем с Вас за награди, нови уроци и други вълнуващи актуализации. Какво можете да направите?

## Разпространете новината

Вие току-що се присъединихте към движението на Часът на кода. Кажете на приятелите си за**#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попитайте във Вашето училище, дали се предлага участие в Часът на кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>), на директора и предизвикайте всяка класна стая в училището да се регистрира. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [ Регистрирайте се тук](<%= resolve_url('/prizes/hardware-signup') %>) да бъдете класирани и [ **вижте победителите от миналата година**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## Предложете на Вашия работодател да се включи в инициативата

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия ръководител или изпълнителен директор на компанията.

## Рекламирайте "Часът на Кодирането " във вашата Община

[ Ангажирайте локална група](<%= resolve_url('/promote/resources#sample-emails') %>) — момчешки/момичешки скаутски клуб, църква, университет, ветерани, синдикат или дори и някои приятели. Не е задължително да си в училище, за да придобиеш нови умения. Използвайте тези [ плакати, банери, стикери, видео клипове и др.](<%= resolve_url('/promote/resources') %>) за собственото си събитие.

## 5 Ангажирайте местната власт в подкрепа на Часът на Кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия местен представител, градския съвет или училищното настоятелство и ги поканете да посетят Вашето училище за Часът на кода. То може да помогне за изграждане на подкрепа за компютърни науки във вашия район и след Часа на кода.

<%= view 'popup_window.js' %>