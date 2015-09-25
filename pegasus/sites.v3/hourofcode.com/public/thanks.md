---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://<%=request.host%>"
  "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg"
  "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
  "twitter:player:width": 1920
  "twitter:player:height": 1080
---
<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

<%= view :signup_button %>

# Thanks for signing up to host an Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>. We'll be in touch about prizes, new tutorials and other exciting updates. What can you do now?


## 1. Spread the word
You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code
[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your principal and challenge every classroom at your school to sign up. 

## 3. Ask your employer to get involved
[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your manager or company's CEO. 

## 4. Promote Hour of Code in your community
[Recruit a local group](<%= resolve_url('/resources/promote#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/resources/promote') %>) for your own event.

## 5. Ask a local elected official to support the Hour of Code
[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.


<%= view 'popup_window.js' %>

<%= view :signup_button %>
