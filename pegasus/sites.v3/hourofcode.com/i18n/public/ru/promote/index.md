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

# Вовлеките ваше окружение в Час Кода

## 1. Расскажите всем

Расскажите своим друзьям о **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попросите вашу школу провести Час Кода

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>) вашему директору и попросите каждый класс в вашей школе записаться.

## 3. Попросите вашего работодателя принять участие

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>) вашему руководителю или директору компании.

## 4. Расскажите о Часе Кода своему окружению

[Соберите местную группу](<%= resolve_url('/promote/resources#sample-emails') %>) из участников кружка для мальчиков или девочек, церкви, университета, совета ветеранов, профсоюза или просто из нескольких друзей. И совсем не обязательно быть школьником или студентом, чтобы получить новые знания. Используйте эти [плакаты, баннеры, наклейки, видео и многое другое](<%= resolve_url('/promote/resources') %>) для вашего мероприятия.

## 5. Попросите местную администрацию поддержать Час Кода

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>) представителям местной власти, в городскую думу и школьный совет с приглашением посетить Час Кода в Вашей школе. Это может помочь создать поддержку компьютерных наук в вашем районе, меньше чем за час.

<%= view :signup_button %>