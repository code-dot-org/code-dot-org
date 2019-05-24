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

# Get your community involved in the Hour of Code

## १. जानकारी फैलाउनुहोअस्

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## २. तपाईको विद्यालयलाई Hour of Code को प्रस्ताब राख्न भन्नुहोस्

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up.

## ३. तपाईको कम्पनीलाई संलग्न हुन भन्नुहोस्

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## ४. तपाईको समुदायमा Hour of Code अघि बढाउनुहोस्

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## ५. Hour of Code समर्थन गर्नकोलागी स्थानीय निर्वाचित आधिकारिकको सहयोग माग्नुहोस्

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>