---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Get your community involved in the Hour of Code

## 1. Sprid ordet

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Be din skola att arrangera Hour of Code

[Skicka detta mail](%= resolve_url('/promote/resources#sample-emails') %) till din huvudman och utmana varje klassrum på din skola för att registrera dig.

## 3. Fråga om din arbetsgivare vill engagera sig

[Skicka detta e-postmeddelande](%= resolve_url('/promote/resources#sample-emails') %) till din chef eller VD.

## 5. Gör reklam för Hour of Code i din kommun

[Rekrytera en lokal grupp](%= resolve_url('/promote/resources#sample-emails') %) — scouter, kyrkan, universitet, veteraner, fackförening eller några vänner. Du behöver inte vara i skolan för att lära sig nya färdigheter. Använda dessa [affischer, banderoller, klistermärken, videor och mycket mer](%= resolve_url('/promote/resources') %) för dina evenemang.

## 5. Be dina lokala politiker stötta Hour of Code

[Skicka detta e-postmeddelande](%= resolve_url('/promote/resources#sample-emails') %) till din lokala politiker, stadsfullmäktige eller skolans ledning och bjud in dem att besöka din skola under Hour of Code. Det kan hjälpa till att bygga stöd för datavetenskap i din kommun efter Hour of Code.

<%= view :signup_button %>