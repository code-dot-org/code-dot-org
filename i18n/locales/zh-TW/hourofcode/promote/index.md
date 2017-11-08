---
title: '<%= hoc_s(:title_how_to_promote) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Get your community involved in the Hour of Code

## 1.廣為宣傳

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 請你的學校提供全校性的一小時玩程式活動

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your principal and challenge every classroom at your school to sign up.

## 3. 請你的上司一同參與

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your manager or company's CEO.

## 4. 在你的社群推廣一小時玩程式活動

[Recruit a local group](%= resolve_url('/promote/resources#sample-emails') %)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 5. 詢問當地的政府機構以支持一小時玩程式活動

[發送信件](%= resolve_url('/promote/resources#sample-emails') %)給您當地的代表、市議會或學校董事會，並邀請他們來為參觀你們學校的一小時玩程式活動。 It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>