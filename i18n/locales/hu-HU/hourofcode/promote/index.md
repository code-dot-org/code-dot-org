---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Vond be a közösségedet a "Hour of Code" kezdeményezésbe

## 1. Mondd el másoknak

Mesélj a barátaidnak a **#HourOfCode** kezdeményezésről!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Javasold, hogy az egész iskola tartsa meg a "Hour of Code" eseményt

Küldd el [ezt az emailt](%= resolve_url('/promote/resources#sample-emails') %) az intézményvezetőnek és hívd fel minden osztály figyelmét az eseményen való részvételi lehetőségre.

## 3. Kérd meg a munkáltatódat, hogy vegyetek részt

Küldd el [ezt az emailt](%= resolve_url('/promote/resources#sample-emails') %) a céged vezetőjének.

## 4. Népszerűsítsd a Kódolás Óráját a közösségben

[Szervezz egy helyi csapatot](%= resolve_url('/promote/resources#sample-emails') %) - fiú/lány klubból, templomból, egyetemről, veterán klubból vagy néhány jó barátból. Nem kell az iskolába járnod ahhoz, hogy új készségeket sajátíts el. Használd ezeket a [posztereket, hírdetéssket, matricákat, videókat stb.](%= resolve_url('/promote/resources') %) a saját rendezvényeden.

## 5. Kérj meg egy helyi választott vezetőt, hogy támogassa a Kód Órája kezdeményezést

Küldd el [ezt az emailt](%= resolve_url('/promote/resources#sample-emails') %) a helyi képviselőknek, városi követeknek, iskolaszéknek és kérd meg őket, hogy az "Hour of Code" esemény keretében látogassák meg az iskolát. Ez az egy óra képes növelni a számítástechnika oktatás támogatását a saját térségedben.

<%= view :signup_button %>