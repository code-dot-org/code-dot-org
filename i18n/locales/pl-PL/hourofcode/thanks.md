* * *

Tytuł: < % = hoc_s(:title_signup_thanks) %> Układ: szeroki nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Dziękujemy za rejestrację jako organizator Godziny Kodowania!

Właśnie umożliwiasz uczniom z całego świata naukę jednej Godziny Kodowania, która może *zmienić resztę ich życia*, podczas <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. Co teraz możesz zrobić?

## 1. Rozgłaszaj

Dołączyłeś właśnie do inicjatywy Godzina Kodowania. Powiedz o tym swoim przyjaciołom z **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Znajdź lokalnego wolontariusza, by pomógł Ci z tym wydarzeniem.

[Znajdź na naszej mapie wolontariuszy](https://code.org/volunteer/local) ochotnika, który może odwiedzić Twoją klasę lub zorganizować zdalnie video chat, aby zainspirować Twoich uczniów, pokazując szerokie możliwości wykorzystania informatyki.

## 3. Poproś całą szkołę, aby zaproponowała Godzinę Kodowania

[Wyślij tego e-maila](%= resolve_url('/promote/resources#sample-emails') %) swojemu dyrektorowi i wezwij każdą klasę w swojej szkole, aby się zarejestrowała.

## 4. Poproś swojego pracodawcę o przyłączenie się do tej inicjatywy

[Wyślij tę wiadomość](%= resolve_url('/promote/resources#sample-emails') %) do swojego menedżera lub dyrektora firmy.

## 5. Promuj Godzinę Kodowania w swojej społeczności

[Zatrudnij grupę lokalną](%= resolve_url('/promote/resources#sample-emails') %) — klub harcerzy lub harcerek, kościół, uniwersytet, grupę weteranów, unię pracy lub nawet kilku znajomych. Nie musisz być w szkole, by nauczyć się nowych umiejętności. Użyj te [plakaty, banery, naklejki, wideo, i wiele więcej](%= resolve_url('/promote/resources') %) dla swojego wydarzenia.

## 6. Poproś władze lokalne o udzielenie wsparcia Godzinie Kodowania

[Wyślij tę wiadomość](%= resolve_url('/promote/resources#sample-emails') %) do przedstawicieli władz lokalnych, rady miasta lub rady szkoły i zaproś ich do swojej szkoły na Godzinę Kodowania. Może to pomóc w tworzeniu wsparcia dla informatyki w twoim obszarze poza tą jedną godziną.

## 7. Zaplanuj swoją Godzinę Kodowania

Wybierz aktywność w ramach Godziny Kodowania i [przejrzyj, jak pokierować](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>