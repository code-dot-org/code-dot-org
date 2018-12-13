---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Kaasa kogukond KoodiTund kampaaniasse

## 1. Reklaami

Räägi oma sõpradele KoodiTund kampaaniast ** #HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Kutsu oma kool KoodiTund kampaanias kaasa lööma

[Saada see e-kiri](%= resolve_url('/promote/resources#sample-emails') %) oma direktorile ja julgusta kõiki klasse liituma.

## 3. Kutsu oma tööandja kaasa lööma

[Saada see e-kiri](%= resolve_url('/promote/resources#sample-emails') %) oma ülemusele või ettevõtte juhile.

## 4. Reklaami KoodiTund kampaaniat oma kogukonnas

[Kaasa kohalikud grupid](%= resolve_url('/promote/resources#sample-emails') %) - skaudid, gaidid, klubid, kirikud, ülikoolid, seenioriteklubid, ametiühingud ning sõpruskonnad. Sa ei pea õppima koolis, et uusi oskusi omandada. Kasuta neid[ plakateid, kleepekaid, videosid ja muud](%= resolve_url('/promote/resources') %) enda ürituse korraldamisel.

## 5. Palu kohalikel rahvasaadikutel KoodiTund kampaaniat toetada

[Saada see e-kiri](%= resolve_url('/promote/resources#sample-emails') %) kohalikele rahvasaadikutele, linnavalitsusele, kohalikule omavalitsusele või koolide juhtkondadele ja kutsu neid osalema teie kooli KoodiTund üritusel. See aitab kaasa arvutiteaduse tutvustamisele laiemalt.

<%= view :signup_button %>