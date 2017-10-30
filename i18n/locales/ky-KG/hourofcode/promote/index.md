---
title: '<%= hoc_s(:title_how_to_promote) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Get your community involved in the Hour of Code

## 1. Маалымат тараткыла

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Мектебиңизге Код саатын сунуштагыла

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your principal and challenge every classroom at your school to sign up.

## 3. Кызматкерлериңизди катышууга чакыргыла

[Бул эмейлди](%= resolve_url('/promote/resources#sample-emails') %) компанияңыздын башкаруучусуна же директоруна жөнөткүлө.

## 4. Коомдоштугуңузда Код саатын илгерилеткиле

[Recruit a local group](%= resolve_url('/promote/resources#sample-emails') %)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Жаңы жөндөмдөрдү үйрөнүү үчүн мектепте болуу шарт эмес. Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 5. Жергиликтүү бийлик өкүлүнөн Код саатын колдоосун сурангыла

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>