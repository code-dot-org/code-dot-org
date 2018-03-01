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

# Get your community involved in the Hour of Code

## 1. Поширюйте інформацію

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Надішліть цього електронного листа](<%= resolve_url('/promote/resources#sample-emails') %>) своєму директорові, та киньте заклик зареєструватися кожному класові своєї школи.

## 3. Попросіть про участь свою адміністрацію

[Надішліть цього електронного листа](<%= resolve_url('/promote/resources#sample-emails') %>) своєму керівникові або генеральному директорові компанії.

## 4. Просувайте Годину коду у своїй спільноті

[Залучіть місцеву групу](<%= resolve_url('/promote/resources#sample-emails') %>) — хлоп'ячий/дівчачий скаутський клуб, церковну, університетську, ветеранську групу, профспілку, або навіть деяких друзів. Щоби вчитися нових навичок, вам не обов'язково потрібно бути в школі. Використовуйте ці [плакати, вивіски, наліпки, відео та інше](<%= resolve_url('/promote/resources') %>) для свого власного заходу.

## 5. Зверніться до місцевих депутатів по підтримку Години коду

[Надішліть цього електронного листа](<%= resolve_url('/promote/resources#sample-emails') %>) своїм місцевим депутатам, міській або шкільній раді, й запросіть їх відвідати вашу школу на Годину коду. Це може допомогти розбудувати підтримку інформатики в вашому регіоні за межами однієї години.

<%= view :signup_button %>