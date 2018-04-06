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

# Beziehen Sie Ihre Bekannten in die "Hour of Code" ein

## Erzählen Sie es weiter

Erzählen Sie Ihren Freunden von der **HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## Frage in deiner Schule nach, und biete eine Hour-of-Code an

[Sende diese Email](<%= resolve_url('/promote/resources#sample-emails') %>) an Deinen Schulleiter und fordere alle Schüler an Deiner Schule auf sich anzumelden.

## 3. Bitte deinen Arbeitgeber sich zu engagieren

[Sende eine Email](<%= resolve_url('/promote/resources#sample-emails') %>) an den Verantwortlichen in Deinem Unternehmen.

## 4. Werbe für die Hour-of-Code in Deinem persönlichen Umfeld

[Eine lokale Gruppe anwerben](<%= resolve_url('/promote/resources#sample-emails') %>)-Vereine, Kirche, Universität, Sportklub, Gewerkschaft oder in deinem Freundeskreis. Du musst nicht in die Schule gehen, um neue Fähigkeiten zu erlernen. Benutze diese [Poster, Banner, Sticker, Videos und mehr](<%= resolve_url('/promote/resources') %>) für deine eigene Veranstaltung.

## 5. Frage deine gewählten Vertreter, ob sie Hour-of-Code unterstützen möchten

[Sende diese Email](<%= resolve_url('/promote/resources#sample-emails') %>) an deinen örtlichen Vertreter, Stadtrat oder deine Schulbehörde und lade sie ein, deine Schule für Hour-of-Code zu besuchen. Das wird helfen das Verständnis für Informatilk in deiner Region zu fördern.

<%= view :signup_button %>