---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

Tu faci posibil pentru toti elevii din intreaga lume sa invete o Ora de Programare ce le poate *chimba tot resul vietii*, in timpul campaniei <%= campaign_date('full') %>. Vom afla in curand premiile, noile tutoriale si alte noutati distractive. Ce poti face acum?

## 1. Răspândește vestea

Doar ce te-ai alaturat miscarii Hour of Code. Spune-le si prietenilor cu **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Găsiți un voluntar pe plan local pentru a vă ajuta în organizarea evenimentului dumneavoastră.

[Căuta pe harta noastră cu voluntari](<%= resolve_url('https://code.org/volunteer/local') %>) pe cineva care vă poate vizita în sala de clasă sau poate participa de la distanță prin video-chat pentru a vă inspira elevii cu privire la amploarea posibilităților domeniului.

## 3. Solicită întregii şcoli sa organizeze o Oră de Programare

[Trimiteți acest e-mail](<%= resolve_url('/promote/resources#sample-emails') %>)directorului scolii dvs si astfel provocati fiecare clasa sa se inscrie.

## 4. Solicită angajatorului să se implice

[Trimite acest e-mail](<%= resolve_url('/promote/resources#sample-emails') %>)catre manager-ul sau CEO-ul companiei la care lucrați.

## 5. Promovează Hour of Code în jurul tău

[Recruteaza un grup local](<%= resolve_url('/promote/resources#sample-emails') %>)- cluburi de fete/baieti, grupul bisericii, universitati, grupuri de veterani, sindicatele sau chiar câțiva prieteni. Nu trebuie să fii in şcoală ca să înveţi noi competenţe. Foloseşte aceste [postere, bannere, stickere, videoclipuri si multe altele](<%= resolve_url('/promote/resources') %>) pentru evenimentul tau.

## 6. Solicită unui oficial ales local sprijinul pentru organizarea Hour of Code

[Trimite acest e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) catre reprezentantii locali, consiliului local, inspectorilor scolari si invita-i sa iti viziteze scoala in timpul unui eveniment Hour of Code. Acestea te pot ajuta in construirea unei sustineri pentru tehnologia computerelor si programare si dincolo de tutorialele de o ora.

## 7. Planifică ora ta de programare

Alege o activitate Hour of Code şi [vizualizeaza acest ghid de organizare](<%= resolve_url('/how-to') %>).

## 8. Go beyond an Hour of Code

Ready to go beyond an hour? Check out [our full courses and teacher resources](<%= resolve_url('https://code.org/teach')%>) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>