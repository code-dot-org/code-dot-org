---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: how_to_nav
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# How to get involved  

## 1. Sign up to host an Hour of Code
Anyone, anywhere can host an Hour of Code. [Sign up](<%= resolve_url('/') %>) to recieve updates and qualify for prizes.
<br/>

<a href="<%= resolve_url('/') %>"><button><%= hoc_s(:signup_your_event) %></button></a>

## 2. Spread the word 
Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code
[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your principal and challenge every classroom at your school to sign up. 

## 4. Ask your employer to get involved
[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your manager or company's CEO. 

## 5. Promote Hour of Code in your community
[Recruit a local group](<%= resolve_url('/resources/promote#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/resources/promote') %>) for your own event.

## 6. Ask a local elected official to support the Hour of Code
[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.


<%= view :signup_button %>