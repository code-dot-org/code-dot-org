* * *

title: Grazie per esserti iscritto per ospitare un evento dell'Ora del Codice! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#OradelCodice' %>

# Grazie per esserti iscritto per ospitare un evento dell'Ora del Codice!

**OGNI** organizzatore dell'Ora del Codice riceverà 10 GB di spazio Dropbox o $10 di credito Skype come ringraziamento. [ Dettagli](<%= hoc_uri('/prizes') %>)

## 1. Diffondi la notizia

Dì ai tuoi amici de L'Ora del Codice con #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## Proponi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## Chiedi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Invia questa email](<%= hoc_uri('/resources#email') %>) o [questo volantino](/resources/hoc-one-pager.pdf) al tuo principale.

<% end %>

## 3. Fai una donazione generosa

[Dona alla nostra campagna di crowdfunding.](http://<%= codeorg_url() %>/donate) Per insegnare a 100 milioni di bambini abbiamo bisogno del vostro sostegno. Abbiamo appena lanciato la [più grande campagna di crowdfunding per l'educazione](http://<%= codeorg_url() %>/donare) nella storia. *Ogni* dollaro sarà abbinato al[donatore](http://<%= codeorg_url() %>/about/donors), raddoppiando il vostro impatto.

## 4. Chiedi al tuo datore di lavoro di essere coinvolti

[Inviare questa email](<%= hoc_uri('/resources#email') %>) al tuo manager, o al tuo CEO. Oppure [dai loro questo volantino](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promuovi L'Ora del Codice nella tua comunità

Recluta un gruppo locale — un gruppo di boy scout, la tua chiesa, l'università o un sindacato. Oppure organizza una "festa di quartiere" per l'Ora del Codice.

## 5. Chiedi ad un funzionario locale di sostenere l'Ora del Codice

[Invia questa email](<%= hoc_uri('/resources#politicians') %>) al tuo sindaco, al consiglio comunale o al consiglio scolastico. O [dai loro questo volantino](http://hourofcode.com/resources/hoc-one-pager.pdf) e invitali a visitare la tua scuola.

<%= view 'popup_window.js' %>