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

# Предложите Вашим друзьям и коллегам принять участие в Часе Программирования

## 1. Поделиться информацией о Часе Программирования

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попросите провести Час кода в Вашей школе

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>) директору Вашей школы, собрав под ним подписи как можно большего количества учеников.

## Обратитесь к вашему руководству с предложением принять участие в проекте Час Кодирования

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>) вашему менеджеру или руководителю компании.

## 4. Расскажите Вашим коллегам о Часе кода

[Соберите участников](<%= resolve_url('/promote/resources#sample-emails') %>) из Вашей школы, спортивного клуба, церкви, университета, профсоюза, подключите друзей и знакомых. И совсем не обязательно быть школьником или студентом, чтобы получить новые знания. Используйте эти [плакаты, баннеры, наклейки, видео и многое другое](<%= resolve_url('/promote/resources') %>) для вашего мероприятия.

## 5. Обратитесь к вашему местному должностному лицу c просьбой поддержать проект Час кода

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>) представителям местной власти, в городскую думу и школьный совет с приглашением посетить Час Кода в Вашей школе. Это всего за час поможет получить поддержку в понимании важности изучения информационных технологий в том числе в вашем районе.

<%= view :signup_button %>