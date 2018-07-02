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

# Itraukite savo bendruominę į "Hour Of Code"

## 1. Skleiskite žodį

Praneškite draugams apie **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pasiūlykite visai mokyklai surengti Programavimo valandą

[Išsiūskite šį Email](<%= resolve_url('/promote/resources#sample-emails') %>) savo mokyklos direktoriui ir pakviesk kiekvieną klasę užsiregistruoti.

## 3. Pasiūlykite įsitraukti savo darbdaviui

[Išsiūskite šį Email](<%= resolve_url('/promote/resources#sample-emails') %>) savo vadybininkui ar kompanijos direktoriui.

## Viešink "Hour Of Code" savo bendruominėje

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 5. Prašyk miesto mero, kad paremtų "Hour Of Code"

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>