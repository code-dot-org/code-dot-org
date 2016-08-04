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

# Grazie per esserti iscritto per organizzare un evento dell'Ora del Codice!

Stai facendo sì che gli studenti di tutto il mondo possano provare un'Ora del Codice che può *cambiare il resto delle loro vite*, <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. Cosa puoi fare ora?

## 1. Diffondi la notizia

Ti sei appena unito al movimento dell'Ora del Codice. Dillo ai tuoi amici con **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Chiedi alla tua scuola di organizzare un'Ora del Codice

[Invia questo messaggio di posta elettronica](<%= resolve_url('/promote/resources#sample-emails') %>) al Dirigente Scolastico della tua scuola e invita ogni classe ad iscriversi.

## 4. Chiedi al tuo datore di lavoro di partecipare

[Invia questo messaggio di posta elettronica](<%= resolve_url('/promote/resources#sample-emails') %>) al tuo responsabile, o all'Amministratore Delegato della tua azienda.

## 5. Promuovi l'Ora del Codice fra i tuoi conoscenti

[ Recluta un po' di persone](<%= resolve_url('/promote/resources#sample-emails') %>) — tra i boy-scout, in parrocchia, all'università, tra gli esperti, al sindacato o tra i tuoi amici. Non c'è bisogno di stare a scuola per acquisire nuove competenze. Utilizza questi [poster, banner, adesivi, video e altro](<%= resolve_url('/promote/resources') %>) per il tuo evento.

## 6. Proponi ad un rappresentante eletto di sostenere L'Ora del Codice

[Invia questo messaggio di posta elettronica](<%= resolve_url('/promote/resources#sample-emails') %>) agli Amministratori Locali, al Consiglio Comunale o al Consiglio Scolastico per invitarli a visitare la tua scuola. Può aiutare a costruire un supporto per l'informatica nella tua zona che va oltre un ora.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>