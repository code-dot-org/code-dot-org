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

# Get your community involved in the Hour of Code

## 1. Sabalalisa izwi

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Cela isikole sakho sonke ukuba sinikele ngeHora loKufingqwa

[Thumela imeyili leli](<%= resolve_url('/promote/resources#sample-emails') %>) kuthisha nhloko wakho uphinde ufake inselela kumakilasi wonke akho kusikole sakho ukuba babhalise.

## 3. Cela umqhashi wakho ukuthi azibandakanye

[Thumela le imeyili](<%= resolve_url('/promote/resources#sample-emails') %>) kumphathi wakho okanye kuCEO yenkampani.

## 4. Khuthaza iHora loKufingqwa kusigodi sakho

[Faka iqembu lendawo](<%= resolve_url('/promote/resources#sample-emails') %>)- umfana/intombazana ikilabhu yamaskhawuthi, ibandla, inyuvesi, iqembu lamaqhawe akudala, inyunyana zabasebenzi, okanye abagane abathize. Akudingeki ukuba ube esikoleni ukuze ufunde amakhono amasha. Sebenzisa lokhu [amaphosta, amabhena, izitembu, amavidiyo kanye nokunye okuningi](<%= resolve_url('/promote/resources') %>) kumcimbi wakho.

## 5. Cela okhethiwe ngokusemthethweni womphakarthi ukuba asekele iHora loKufingqwa

[Thumela le-imayili](<%= resolve_url('/promote/resources#sample-emails') %>) kulabo abamela indawo yakini, umasipaladi, okanye ibhodi yesikole uphinde ubameme ukuba bezovakashela isikole sakho ngeHora loKufingqwa. Ingasiza ukwakha ukusekelwa kwekhompyutha sayensi kusigodi sakho phambi kwehora elilodwa.

<%= view :signup_button %>