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

# Zapojte vašich známych do projektu Hodina Kódu

## 1. Informujte ostatných

Povedzte svojim priateľom o **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Požiadajte Vašu školu, aby usporiadala Hodinu kódu

[Pošlite tento e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) riaditeľovi a povzbuďte triedy k účasti.

## 3. Požiadajte Vášho zamestnávateľa, aby sa zapojil

[Pošlite tento e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) Vášmu manažérovi alebo riaditeľovi spoločnosti.

## 4. Propagujte Hodinu kódu vo Vašom okolí

[Zapojte lokálne skupiny](<%= resolve_url('/promote/resources#sample-emails') %>) - skautské kluby, kostoly, univerzity, kluby dôchodcov či vašich priateľov. Nemusíte byť v škole, aby ste sa naučili nové zručnosti. Na Vašej udalosti využite [plagáty, bannery, nálepky, či videá](<%= resolve_url('/promote/resources') %>).

## 5. Oslovte lokálne politické osobnosti, aby podporili Hodinu kódu

[Pošlite tento e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) lokálnym politikom alebo školskej rade a pozvite ich na návštevu Vašej školy počas Hodiny kódu. Môže to podporiť vyučovanie informatiky vo vašom okolí.

<%= view :signup_button %>