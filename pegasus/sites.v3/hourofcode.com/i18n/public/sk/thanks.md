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

# Ďakujeme Vám, že organizujete udalosť Hodina kódu!

Pomáhate študentom z celého svetka učiť sa pomocou Hodiny kódu, ktorá môže *zmeniť ich životy* už od <%= campaign_date('full') %>. O nových návodoch a iných zaujímavých aktualizáciách Vás budeme informovať. Ako sa môžete zapojiť?

## 1. Informujte ostatných

Práve ste sa zapojili do hnutia Hodina kódu. Povedzte o tom svojim priateľom **#HourOfCode #HodinaKodu**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Nájdite si dobrovoľníka vo vašom okolí, ktorý Vám pomôže s organizáciou udalosti.

[Pozrite si našu mapu s dobrovoľníkmi](<%= resolve_url('https://code.org/volunteer/local') %>) a nájdite si dobrovoľníka, ktorý vie navštíviť vašu triedu alebo sa pripojiť prostredníctvom videa a tak inšpirovať Vašich študenov.

## 3. Požiadajte školu vo Vašom okolí, aby usporiadala Hodinu kódu

[Pošlite tento e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) riaditeľovi a povzbuďte triedy k účasti.

## 4. Požiadajte Vášho zamestnávateľa, aby sa zapojil tiež

[Pošlite tento e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) Vášmu manažérovi alebo riaditeľovi spoločnosti.

## 5. Propagujte Hodinu kódu vo Vašom okolí

[Zapojte lokálne skupiny](<%= resolve_url('/promote/resources#sample-emails') %>) - skautské kluby, kostoly, univerzity, kluby dôchodcov či vašich priateľov. Nemusíte byť v škole, aby ste sa naučili nové zručnosti. Na Vašej udalosti využite [plagáty, bannery, nálepky, či videá](<%= resolve_url('/promote/resources') %>).

## 6. Oslovte lokálne politické osobnosti, aby podporili Hodinu kódu

[Pošlite tento e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) lokálnym politikom alebo školskej rade a pozvite ich na návštevu Vašej školy počas Hodiny kódu. Môže to podporiť vyučovanie informatiky vo vašom okolí.

## 7. Naplánujte si Hodinu kódu

Vyberte si svoju aktivitu z Hodiny kódu a [pozrite si návod Ako na to](<%= resolve_url('/how-to') %>).

## 8. Go beyond an Hour of Code

Ready to go beyond an hour? Check out [our full courses and teacher resources](<%= resolve_url('https://code.org/teach')%>) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>