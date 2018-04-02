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

## 1. Spreid het woord

Vertel uw vrienden over **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Vraag je hele school om een CodeUur aan te bieden

[Stuur deze e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) naar uw opdrachtgever en daag elk klaslokaal op uw school uit om aan te melden.

## 3. Vraag uw werkgever betrokken te raken

[Stuur deze e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) naar uw manager of bedrijf CEO.

## 5. Promoot het CodeUur in uw gemeenschap

[Werf een lokale groep](<%= resolve_url('/promote/resources#sample-emails') %>) — jongen/meisje scout clubs, kerk, universiteit, veteranen groep, vakbond of zelfs sommige vrienden. U hoeft niet op school te zitten om nieuwe skills te leren. Gebruik deze [posters, banners, stickers, video's en meer](<%= resolve_url('/promote/resources') %>) voor uw eigen evenement.

## 5. Vraag een politicus het CodeUur te ondersteunen

[Stuur deze e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) naar uw lokale vertegenwoordigers, gemeenteraad of schoolbestuur, om hen uit te nodigen voor het CodeUur op uw school. Het kan steun bieden aan programmering binnen uw gemeente in maar één uur.

<%= view :signup_button %>