---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Implicați comunitatea dumneavoastră în Ora de Cod

## 1. Răspândește vestea

Spune-le prietenilor tăi despre **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Solicită întregii şcoli sa ofere o Oră de Programare

[Trimiteți acest e-mail](%= resolve_url('/promote/resources#sample-emails') %)directorului scolii dvs si astfel provocati fiecare clasa sa se inscrie.

## 3. Solicită angajatorului tău să se implice

[Trimite acest e-mail](%= resolve_url('/promote/resources#sample-emails') %)catre manager-ul sau CEO-ul companiei la care lucrați.

## 4. Promovează Hour of Code în comunitatea ta

[Recruteaza un grup local](%= resolve_url('/promote/resources#sample-emails') %)- cluburi de fete/baieti, biserici, universitati, grupuri de veterani, sindicate sau chiar câțiva prieteni. Nu trebuie să fii in şcoală ca să înveţi noi competenţe. Foloseşte aceste [postere, bannere, stickere, videoclipuri si multe altele](%= resolve_url('/promote/resources') %) pentru evenimentul tau.

## 5. Solicită unui oficial ales local sprijinul pentru organizarea Hour of Code

[Trimite acest e-mail](%= resolve_url('/promote/resources#sample-emails') %) catre reprezentantii locali, consiliului local, inspectorilor scolari si invita-i sa iti viziteze scoala in timpul unui eveniment Hour of Code. Acestea te pot ajuta in construirea unei sustineri pentru tehnologia computerelor si programare si dincolo de tutorialele de o ora.

<%= view :signup_button %>