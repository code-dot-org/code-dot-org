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

# Спасибо за регистрацию на проведение Часа Кода!

Вы делаете это возможно для учеников всего мира, чтобы заниматься Часом кода, которая может*изменить жизнь*, во время <%= campaign_date('full') %>. Мы будем сообщать о новых учебных материалов, а также другие интересные обновления. Что вы можете сделать сейчас?

## 1. Распространите новость

Ты можешь присоединится к Часу кода. Расскажите своим друзьям **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 1. Найти местных волонтеров (добровольцев), которые помогут вам с организацией вашего мероприятия.

[Поиск добровольцев на карте](<%= resolve_url('https://code.org/volunteer/local') %>)для добровольцев, которые могут посетить ваш класс или удаленно, чтобы вдохновить ваших студентов о широте возможностей в компьютерной индустрии.

## 2. Попросите провести Час Программирования в Вашей школе

[Отправьте это письмо](<%= resolve_url('/promote/resources#sample-emails') %>)вашей основной задачей в каждом классе в вашей школе, чтобы зарегистрировать учеников.

## 4. Попросите своего работодателя принять участие

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 5. Promote Hour of Code in your community

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

## 8. Go beyond an Hour of Code

Ready to go beyond an hour? Check out [our full courses and teacher resources](<%= resolve_url('https://code.org/teach')%>) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>