---
title: Thanks for signing up to host an Hour of Code!
layout: wide

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://<%=request.host%>"
  "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg"
  "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
  "twitter:player:width": 1920
  "twitter:player:height": 1080
---
<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Thanks for signing up to host an Hour of Code!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. <a href="<%= hoc_uri('/prizes') %>">Details</a>

<% if @country == 'us' %>

Get your <a href="<%= hoc_uri('/prizes') %>">whole school to participate</a> for a chance for big prizes for your entire school.

<% end %>

## 1. Spread the word 
Tell your friends about the #HourOfCode. 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Ask your whole school to offer an Hour of Code
<a href="<%= hoc_uri('/resources#email') %>">Send this email</a> or <a href="/resources/hoc-one-pager.pdf">this handout</a>. Once your school is on board, [enter to win $10,000 worth of technology for your school](/prizes) and challenge other schools in your area to get on board.  

<% else %>

## 2. Ask your whole school to offer an Hour of Code
<a href="<%= hoc_uri('/resources#email') %>">Send this email</a> or give <a href="/resources/hoc-one-pager.pdf">this handout</a> this handout</a> to your principal. 

<% end %>

## 3. Make a generous donation
<a href="http://<%= codeorg_url() %>/donate">Donate to our crowdfunding campaign.</a> To teach 100 million children, we need your support. We just launched what could be the <a href="http://<%= codeorg_url() %>/donate">largest education crowdfunding campaign</a> in history. Every dollar will be matched by major Code.org <a href="http://<%= codeorg_url() %>/about/donors">donors</a>, doubling your impact. 

## 4. Ask your employer to get involved
<a href="<%= hoc_uri('/resources#email') %>">Send this email</a> to your manager, or the CEO. Or <a href="http://hourofcode.com/resources/hoc-one-pager.pdf">give them this handout</a>.

## 5. Promote Hour of Code within your community
Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Ask a local elected official to support the Hour of Code
<a href="<%= hoc_uri('/resources#politicians') %>">Send this email</a> to your mayor, city council, or school board. Or <a href="http://hourofcode.com/resources/hoc-one-pager.pdf">give them this handout</a> and invite them to visit your school.

<%= view 'popup_window.js' %>
