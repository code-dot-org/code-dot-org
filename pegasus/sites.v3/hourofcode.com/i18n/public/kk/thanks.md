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

# Кодтау Сағатының иесі ретінде тіркелгеніңізге рахмет!

Сіз әлемнің түкпіріндегі студенттерге <%= campaign_date('full') %> *қалған өмірін түбегейлі өзгертетін* бір Кодтау Сағатын уйренуге мүмкіндік сыйлаудасыз. Біз жаңа оқулықтар мен басқа да толғандырарлық жаңартулар жөнінде хабардар боламыз. Қазір сіз не істей аласыз?

## Сөзді жариялаңыз

Сіз жақында Кодтау Сағаты қозғалысына қосылдыңыз. Достарыңызбен **#HourOfCode** -пен бөлісіңіз!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## Сіздің шараға көмектесетін жергілікті волонтер табыңыз.

Сіздің сынып бөлмеңізді көре алатын волонтерларды табуда [біздің волонтер картасын қараңыз](<%= resolve_url('https://code.org/volunteer/local') %>) немесе студенттеріңізді шабыттандыру мақсатында қашықтан информатика мүмкіндіктерінің кеңдігі туралы видео-чат арқылы айтыңыз.

## Түгел мектебіңізге Кодтау Сағатын ұсыныңыз

Сіздің басты міндетіңіз ретінде мектебіңіздегі әрбір сыныпты тіркеу үшін оларға [мына электрондық поштаны жіберіңіз](<%= resolve_url('/promote/resources#sample-emails') %>).

## Қызметкеріңізді қатысуға шақырыңыз

[Бұл email-ды](<%= resolve_url('/promote/resources#sample-emails') %>) өзіңіздің менеджер немесе компания CEO-сына жіберіңіз.

## Өз қауымығызға Код Сағатын жарнамалаңыз

[Жергілікті топ құрыңыз](<%= resolve_url('/promote/resources#sample-emails') %>) - ер/қыз барлаушы клубтары, шіркеу, университет, ардагерлер тобы, кәсіподақ, тіпті, немесе кейбір достарыңыз. Жаңа дағдыларды үйрену үшін сізге мектепте болу қажет емес. Өзіңіздің шараңыз үшін [мына постер, баннер, стикер, видео және тағы басқаларын](<%= resolve_url('/promote/resources') %>) пайдаланыңыз.

## Жергілікті лауазымды тұлғаларды Кодтау Сағатын демеуге шақырыңыз

Жергілікті өкілдерге, қалалық кеңеске немесе мектеп тақтасына [мына электрондық поштаны жіберіңіз](<%= resolve_url('/promote/resources#sample-emails') %>) және Кодтау Сағатында сіздің сыныпты қарауға шақырыңыз. Бұл сағаттан тыс уақытта сіздің ауданда компьютер ғылымдарын құруда көмегін тигізеді.

## Өзіңіздің Код Сағатын жоспарлаңыз

Кодтау Сағаты шарасын таңдаңыз және [қалай қолдану жөнінде шолу](<%= resolve_url('/how-to') %>) жасаңыз.

## Кодтау Сағатынан тыс барыңыз

Сағаттан тыс жерге баруға дайынсыз ба? Төменгі, орта және жоғарғы мектеп мұғалімдеріне арналған професионалды оқу мүмкіндіктерін қамтитын [толық қурстар мен мұғалім қорларды](<%= resolve_url('https://code.org/teach')%>) қараңыз.

<%= view 'popup_window.js' %>