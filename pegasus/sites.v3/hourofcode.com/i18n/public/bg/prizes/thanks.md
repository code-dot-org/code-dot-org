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

<%= view :signup_button %>

# Благодаря за регистрирането Ви за шанс да спечелите награда $10,000 в хардуер

Цялото Ви училище сега е регистрирано за шанс да спечели набор от лаптопи (или $10,000 за други технологии). Ние ще прегледаме Вашата кандидатура и ще обявявим победителите през декември.

## Разпространете новината

Кажете на приятелите си за #HourOfCode.

## 2. Попитайте във вашето училище, дали се предлага участие в Часът на кодирането

[ Изпрати този имейл](<%= resolve_url('/promote/resources#email') %>) на своя директор.

## Предложете на вашия работодател да се включи в инициативата

[ Изпрати този имейл](<%= resolve_url('/promote/resources#email') %>) на ръководителя или изпълнителния директор.

## 4. Промотиране на часът на кода във вашата общност

Наемете локална група — скаути клуб, църква, университет, ветерани от група или синдикат. Или станете домакин часът на кода "block party" за вашия квартал. [ Изпрати този имейл](<%= resolve_url('/promote/resources#email') %>).

## 5 Предложете на Общинската Администрация да подкрепи програмата "Един Час Програмиране"

[ Изпрати този имейл](<%= resolve_url('/promote/resources#politicians') %>) на своя кмет, общински съветник или училищното настоятелство и ги покани да посетят твоето училище.

<%= view :signup_button %>