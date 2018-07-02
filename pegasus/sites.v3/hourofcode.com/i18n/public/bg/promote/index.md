---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Get your community involved in the Hour of Code

## Разпространете новината

Кажете на приятелите си за **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попитайте във Вашето училище, дали се предлага участие в Часът на кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на директора и предизвикайте всяка класна стая в училището да се регистрира.

## 3. Предложете на Вашия работодател да се включи в инициативата

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия ръководител или изпълнителен директор на компанията.

## 4. Рекламирайте Hour of Code във Вашата Община

[ Ангажирайте локална група](<%= resolve_url('/promote/resources#sample-emails') %>) — момчешки/момичешки скаутски клуб, църква, университет, ветерани, синдикат или дори и някои приятели. Не е задължително да си в училище, за да придобиеш нови умения. Използвайте тези [ плакати, банери, стикери, видео клипове и др.](<%= resolve_url('/promote/resources') %>) за собственото си събитие.

## 5 Предложете на Общинската Администрация да подкрепи програмата " Hour of Code "

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия местен представител, градския съвет или училищното настоятелство и ги поканете да посетят Вашето училище за Часът на кода. Те може да помогнат за изграждане на подкрепа за компютърни науки във Вашия район и след Hour of Code.

<%= view :signup_button %>