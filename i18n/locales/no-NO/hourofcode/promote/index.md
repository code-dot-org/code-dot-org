---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#Kodetimen' %>

# Selg inn Kodetimen i nærmiljøet

## 1. Spre budskapet

Fortell venner og bekjente om **#Kodetimen**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Få den lokale skolen til å arrangere en Kodetime

Send [denne e-posten](%= resolve_url('/promote/resources#sample-emails') %) til rektor, med en utfordring til å melde på alle klasser på alle trinn.

## 3. Spør arbeidsgiveren din om å bidra

Send [denne e-posten](%= resolve_url('/promote/resources#sample-emails') %) til sjefen din eller ledelsen i bedriften.

## 4. Promoter Kodetimen i ditt lokalsamfunn

[Rekrutter grupper i lokalmiljøet](%= resolve_url('/promote/resources#sample-emails') %) — speidergrupper, kirken, universiteter, eldresentre, arbeidersamfunn, eller rett og slett din egen omgangskrets. Du trenger ikke gå på skolen for å lære noe nytt. Benytt våre [plakater, bannere, klistremerker, videoer og annet](%= resolve_url('/promote/resources') %) for å fremme ditt eget arrangement.

## 5. Spør en lokalpolitiker om å støtte Kodetimen

Send [denne e-posten](%= resolve_url('/promote/resources#sample-emails') %) til en lokalpolitiker, til rådhuset eller til det lokale skolestyret, og inviter dem til skolens Kodetime-arrangement. Dette kan hjelpe informatikkfaget å få fotfeste i ditt nærområde litt lenger enn én time.

<%= view :signup_button %>