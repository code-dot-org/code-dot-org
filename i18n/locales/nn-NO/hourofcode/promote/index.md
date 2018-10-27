---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#Kodetimen' %>

# Få nærmiljøet ditt involvert i Kodetimen

## 1. Spre bodskapen

Fortel venner og kjende om **#Kodetimen**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Be heile skulen din om å tilby ein Kodetime

Send [denne e-posten](%= resolve_url('/promote/resources#sample-emails') %) til rektor, med ei utfordring om å melde på alle klasser på alle trinn.

## 3. Be arbeidsgjevaren din om å engasjere seg

Send [denne e-posten](%= resolve_url('/promote/resources#sample-emails') %) til sjefen din eller leiinga i bedrifta.

## 4. Reklamer for Kodetimen i lokalmiljøet ditt

[Rekrutter grupper i lokalmiljøet](%= resolve_url('/promote/resources#sample-emails') %) — speidargrupper, kyrkja, universiteter, eldresentre, arbeidarsamfunn, eller rett og slett din eigen omgangskrins. Du treng ikkje gå på skulen for å lære noko nytt. Bruk desse [plakatar, bannere, klistremerke, videoar og meir](%= resolve_url('/promote/resources') %)for ditt eige arrangement.

## 5. Be ein lokalpolitikar om å støtte Kodetimen

Send [denne e-posten](%= resolve_url('/promote/resources#sample-emails') %) til ein lokalpolitikar, til rådhuset eller til det lokale skulestyret, og inviter dei til skulens Kodetime-arrangement. Dette kan hjelpe å bygge støtte til informatikkopplæring i ditt område ut over ein Kodetime.

<%= view :signup_button %>