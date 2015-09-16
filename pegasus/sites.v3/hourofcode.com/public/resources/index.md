---
title: <%= hoc_s(:title_resources) %>
layout: wide
---

# Hour of Code Resources

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

<%= view :resources_banner %>

# Join Us  

## 1. Sign up to host
Anyone, anywhere can host an Hour of Code. <a href="<%= resolve_url('/') %>">Sign up</a> to recieve updates and qualify for prizes.
<br/>

<a href="<%= resolve_url('/') %>"><button><%= hoc_s(:signup_your_event) %></button></a>

## 2. Spread the word 
Tell your friends about the #HourOfCode. 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code
<a href="<%= resolve_url('/resources/promote#sample-emails') %>">Send this email</a> to your principal to encourage every classroom at your school to sign up. 

## 4. Ask your employer to get involved
<a href="<%= resolve_url('/resources/promote#sample-emails') %>">Send this email</a> to your manager or the CEO. 

## 5. Promote Hour of Code within your community
<a href="<%= resolve_url('/resources/promote#sample-emails') %>">Recruit a local group</a>— boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Ask a local elected official to support the Hour of Code
<a href="<%= resolve_url('/resources/promote#sample-emails') %>">Send this email</a> to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.


<%= view :signup_button %>