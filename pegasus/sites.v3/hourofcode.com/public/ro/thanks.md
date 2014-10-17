---
title: Vă mulțumim pentru ca v-ați înscris să organizați evenimentul Hour of Code!
layout: wide
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo'
%>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

**FIECARE** Organizator al Hour of Code va primi 10 GB spaţiu Dropbox sau 10 dolari credit Skype în semn de mulțumire. [Detalii](/prizes)

<% if @country == 'us' %>

Invită [toată scoala să participe ](/us/prizes) pentru șansa de câștiga premii mari pentru întreaga școală.

<% end %>

## 1. Răspândește vestea

Spune prietenilor tai despre #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Trimite acest e-mail](/resources#email) sau [oferă această broșură](/files/schools-handout.pdf). Odată ce şcoala ta s-a înscris, [participă pentru a câştiga tehnologie în valoare de 10.000 dolari pentru şcoala ta](/prizes) şi provoacă alte şcoli din orașul tău să participe.

<% else %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Trimite acest e-mail](/resources#email) sau [oferă această broșură](/files/schools-handout.pdf).

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Recrutează un grup local — club de copii, universitate, biserică. Sau organizează o petrecere Hour of Code în cartierul sau zona ta.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>