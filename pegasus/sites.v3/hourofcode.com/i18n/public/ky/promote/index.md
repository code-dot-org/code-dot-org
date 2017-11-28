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

# Жамаатыңарды Код саатына тарткыла

## 1. Маалымат тараткыла

**#HourOfCode** тууралуу досторуңузга билдиргиле!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Мектебиңизге Код саатын сунуштагыла

[Бул эмейлди](<%= resolve_url('/promote/resources#sample-emails') %>)мектептин директоруна жөнөткүлө жана бардык класстарды катталууга үндөгүлө.

## 3. Кызматкерлериңизди катышууга чакыргыла

[Бул эмейлди](<%= resolve_url('/promote/resources#sample-emails') %>) компанияңыздын башкаруучусуна же директоруна жөнөткүлө.

## 4. Коомдоштугуңузда Код саатын илгерилеткиле

[Жергиликтүү топторду тарткыла](<%= resolve_url('/promote/resources#sample-emails') %>)— балдардын/кыздардын клубу, университет, ардагерлер тобу же досторуңар. Жаңы жөндөмдөрдү үйрөнүү үчүн мектепте болуу шарт эмес. Бул [постерлерди, баннерлерди, чаптамаларды, видеолорду](<%= resolve_url('/promote/resources') %>) иш-чараңарга колдонгула.

## 5. Жергиликтүү бийлик өкүлүнөн Код саатын колдоосун сурангыла

[Бул эмейлди](<%= resolve_url('/promote/resources#sample-emails') %>) жергиликтүү бийлик өкүлүнө, шаар башчысына же мектептин байкоочулар кеңешине жөнөткүлө жана мектебиңерде өтүүчү Код саатына чакыргыла. Бул сааттан кийин дагы аймагыңарда компүтердик илимди өнүктүрүүгө жардам берет.

<%= view :signup_button %>