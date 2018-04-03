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

# Uključi svoju zajednicu u Čas Kodiranja

## 1. Reci svima

Recite svojim prijateljima o **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pitajte cijelu školu da ugoste Sat programiranja

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up.

## 3. Pitajte svog poslodavca da se uključite

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 4. Promote Hour of Code in your community

[Regrutiraj lokalnu grupu](<%= resolve_url('/promote/resources#sample-emails') %>)dječak/djevojčica klub izviđača, crkvu, univerzitet, grupu veterana, sindikat, ili čak neke prijatelje. Ne morate biti u školi da naučite nove vještine. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 5. Pitajte lokalno izabranog u zajednici da podrži Sata programiranja

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>