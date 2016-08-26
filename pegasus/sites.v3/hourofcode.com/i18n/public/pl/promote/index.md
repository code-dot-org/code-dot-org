---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Jak się zaangażować

## 1. Rozgłaszaj

Powiedz swoim znajomym o **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Zaproponuj całej swojej szkole udział w Godzinie Kodowania

[Wyślij tego e-maila](<%= resolve_url('/promote/resources#sample-emails') %>) swojemu dyrektorowi i zaproś każdą klasę w swojej szkole, aby się zarejestrowała. <% if @country == 'us' %> Jedna szczęśliwa szkoła w *każdym* stanie USA (i w Washington D.C.) wygra technologię wartą 10.000 dolarów. <% end %>

## 3. Poproś swojego pracodawcę o przyłączenie się

[Wyślij tę wiadomość](<%= resolve_url('/promote/resources#sample-emails') %>) do swojego menedżera lub dyrektora firmy.

## 4. Promuj Godzinę Kodowania w swojej społeczności

[Zachęć lokalną grupę](<%= resolve_url('/promote/resources#sample-emails') %>) — klub harcerzy lub harcerek, kościół, uniwersytet, grupę weteranów, związki zawodowe lub nawet kilku znajomych. Nie musisz chodzić do szkoły, by nabyć nowe umiejętności. Użyj te [plakaty, banery, naklejki, wideo, i wiele więcej](<%= resolve_url('/promote/resources') %>) dla swojego wydarzenia.

## 6. Poproś władze lokalne o udzielenie wsparcia Godzinie Kodowania

[Wyślij tę wiadomość](<%= resolve_url('/promote/resources#sample-emails') %>) do przedstawicieli władz lokalnych, rady miasta lub rady szkoły i zaprosić ich do swojej szkoły na Godzinę Kodowania. Może to pomóc we wspieraniu informatyki w Twoim obszarze poza jedną godzinę.