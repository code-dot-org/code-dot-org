---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Zaangażuj swoją społeczność do Godziny Kodowania

## 1. Rozgłaszaj

Powiadom znajomych o **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Zaproponuj całej swojej szkole udział w Godzinie Kodowania

[Wyślij tego e-maila](<%= resolve_url('/promote/resources#sample-emails') %>) swojemu dyrektorowi i poproś każdą klasę w swojej szkole, aby się zarejestrowała.

## 3. Poproś swojego pracodawcę o przyłączenie się

[Wyślij tę wiadomość](<%= resolve_url('/promote/resources#sample-emails') %>) do swojego menedżera lub dyrektora firmy.

## 4. Promuj Godzinę Kodowania w swojej społeczności

[Zwerbuj grupę lokalną](<%= resolve_url('/promote/resources#sample-emails') %>) — klub harcerzy lub harcerek, kościół, uniwersytet, grupę weteranów, unię pracy lub nawet kilku znajomych. Nie musisz być w szkole, by poznać nowe umiejętności. Użyj te [plakaty, banery, naklejki, wideo, i wiele więcej](<%= resolve_url('/promote/resources') %>) dla swojego wydarzenia.

## 6. Poproś władze lokalne o udzielenie wsparcia Godzinie Kodowania

[Wyślij tę wiadomość](<%= resolve_url('/promote/resources#sample-emails') %>) do przedstawicieli władz lokalnych, rady miasta lub rady szkoły i zaproś ich do swojej szkoły na Godzinę Kodowania. Może to pomóc w tworzeniu wsparcia dla informatyki w twoim obszarze poza tą jedną godziną.

<%= view :signup_button %>