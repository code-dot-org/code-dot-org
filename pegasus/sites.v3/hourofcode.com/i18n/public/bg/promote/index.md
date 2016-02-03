---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Как да се включите

## 1. Регистрирайте се, за да бъдете домакин на Hour of Code

Всеки, навсякъде може да бъде домакин на Hour of Code. [ Регистрирайте се,](<%= resolve_url('/') %>) за да получите актуализации и да се класирате за награди.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## Разпространете новината

Кажете на приятелите си за **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попитайте във Вашето училище, дали се предлага участие в Hour of Code

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на директора и предизвикайте всяка класна стая в училището да се регистрира. <% if @country == 'us' %> Едно училище от *всеки* щат на Сащ (и Вашингтон) ще спечели $10,000 за технологии. [ Регистрирайте се тук](<%= resolve_url('/prizes/hardware-signup') %>) да бъдете класирани и [ **вижте победителите от миналата година**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. Посъветвайте се с Вашия работодател за възможно включване

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия ръководител или изпълнителен директор на компанията.

## Рекламирайте "Hour of Code" във вашата Община

[ Ангажирайте локална група](<%= resolve_url('/promote/resources#sample-emails') %>) — момчешки/момичешки скаутски клуб, църква, университет, ветерани, синдикат или дори и някои приятели. Не е задължително да си в училище, за да придобиеш нови умения. Използвайте тези [ плакати, банери, стикери, видео клипове и др.](<%= resolve_url('/promote/resources') %>) за собственото си събитие.

## 5 Ангажирайте местната власт в подкрепа на Часът на Кодирането

[ Изпратете този имейл](<%= resolve_url('/promote/resources#sample-emails') %>) на вашия местен представител, градския съвет или училищното настоятелство и ги поканете да посетят Вашето училище за Часът на кода. Те може да помогнат за изграждане на подкрепа за компютърни науки във Вашия район и след Hour of Code.

