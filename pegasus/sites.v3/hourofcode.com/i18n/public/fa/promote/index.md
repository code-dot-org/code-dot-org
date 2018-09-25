---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# اطرافیان خود را با ساعت کدنویسی آشنا کنید

## ۱. این مفهوم را گسترش دهید

به دوستان خود درباره **#ساعت‌کدنویسی** بگویید!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. از مدرسه خود بخواهید که ساعت کدنویسی را پیشنهاد دهد

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up.

## 3. از کارفرمای خود بخواهید که مشارکت کند

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## ساعت کدنویسی را در جامعه خود تبلیغ کنید

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## از یک مقام منتخب محلی بخواهید از ساعت کدنویسی حمایت کند

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>