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

Вие давате възможност на учениците по целия свят да учат с Hour of Code, който може да *промени останалата част от живота им*, по време на <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. Какво можете да направите?

## Разпространете новината

Вие току-що се присъединихте към движението на Hour of Code. Кажете на приятелите си за**#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Намерете местни доброволци да Ви помогнат с Вашето събитие.

[Потърсете на нашата доброволческа карта](<%= resolve_url('https://code.org/volunteer/local') %>) за доброволци, които да посетят вашата класна стая или да участват във видео чат, за да вдъхновят учениците за възможностите на компютърните науки.

## 2. Попитайте във Вашето училище, дали се предлага участие в Hour of Code

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на директора и предизвикайте всяка класна стая в училището да се регистрира.

## 3. Посъветвайте се с Вашия работодател за възможно включване

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия ръководител или изпълнителен директор на компанията.

## Рекламирайте "Hour of Code" във вашата Община

[ Ангажирайте локална група](<%= resolve_url('/promote/resources#sample-emails') %>) — момчешки/момичешки скаутски клуб, църква, университет, ветерани, синдикат или дори и някои приятели. Не е задължително да си в училище, за да придобиеш нови умения. Използвайте тези [ плакати, банери, стикери, видео клипове и др.](<%= resolve_url('/promote/resources') %>) за собственото си събитие.

## 5 Ангажирайте местната власт в подкрепа на Часът на Кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия местен представител, градския съвет или училищното настоятелство и ги поканете да посетят Вашето училище за Часът на кода. Те може да помогнат за изграждане на подкрепа за компютърни науки във Вашия район и след Hour of Code.

## 7. Планиpай своя Hour of Code

Изберете Hour of Code дейност и [ Прегледайте това практическо ръководство](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>