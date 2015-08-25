* * *

title: Grazie per esserti iscritto per ospitare un evento dell'Ora del Codice! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#OradelCodice' %>

# Grazie per esserti iscritto per ospitare un evento dell'Ora del Codice!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Diffondi la notizia

Dì ai tuoi amici de L'Ora del Codice con #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## Proponi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Proponi al tuo datore di lavoro di essere coinvolti

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promuovi il progetto L'Ora del Codice nella tua comunità

Recluta un gruppo locale — un gruppo di boy scout, la tua chiesa, l'università o un sindacato. Oppure organizza una "festa di quartiere" per l'Ora del Codice.

## 5. Proponi ad un funzionario locale di sostenere L'Ora del Codice

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>