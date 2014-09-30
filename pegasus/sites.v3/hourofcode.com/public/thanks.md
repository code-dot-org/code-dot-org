---
title: Thanks for signing up to host an Hour of Code!
layout: wide

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": 'http://#{request.site}/images/hour-of-code-2014-video-thumbnail.jpg'
  "og:image:width": "1705"
  "og:image:height": "949"
  "og:url": "http://#{request.site}"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://#{request.site}"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://#{request.site}/images/hour-of-code-2014-video-thumbnail.jpg"
  "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
  "twitter:player:width": 1920
  "twitter:player:height": 1080
---
<%
  facebook = {:u=>"http://#{request.site}/"}

  twitter = {:url=>"http://#{request.site}/", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Thanks for signing up to host an Hour of Code!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](/prizes)

<% if @country == 'us' %>

Get your [whole school to participate](/us/prizes) for a chance for big prizes for your entire school.

<% end %>

## 1. Spread the word 
Tell your friends about the #HourOfCode. 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Ask your whole school to offer an Hour of Code
[Send this email](/resources#email) or [give this handout to your principal](/resources/hoc-one-pager.pdf). Once your school is on board, [enter to win $10,000 worth of technology for your school](/prizes) and challenge other schools in your area to get on board.  

<% else %>

## 2. Ask your whole school to offer an Hour of Code
[Send this email](/resources#email) or give [this handout](/resources/hoc-one-pager.pdf) to your principal. 

<% end %>

## 3. Ask your employer to get involved
[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 4. Promote Hour of Code within your community
Recruit a local group — boy scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Ask a local elected official to support the Hour of Code
[Send this email](/resources#email) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>
