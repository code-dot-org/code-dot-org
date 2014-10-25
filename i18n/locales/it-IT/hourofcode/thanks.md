* * *

title: Grazie per aver deciso di ospitare un evento dell'Ora del Codice! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'OradelCodice' unless hoc_s(:twitter_default_text).include? '#OradelCodice' %>

# Grazie per aver deciso di ospitare un evento dell'Ora del Codice!

**OGNI** organizzatore di un evento dell'Ora del Codice riceverà 10 GB di spazio su Dropbox o $10 di credito Skype come ringraziamento. [Dettagli](/prizes)

<% if @country == 'us' %>

Fai [partecipare tutta la tua scuola](/us/prizes) per avere la possibilità di ricevere grandi premi per tutta la scuola (solo per gli Stati Uniti).

<% end %>

## 1. Diffondi la notizia

Dì ai tuoi amici dell'#HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## Chiedi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Invia questa email](/resources#email) o [dai questo volantino al tuo dirigente](/files/schools-handout.pdf). Una volta che la tua scuola è a bordo, [partecipa per vincere $10.000 in strumenti tecnologici per la tua scuola](/prizes) (solo per gli Stati Uniti) e sfida le altre scuole della tua zona a salire a bordo.

<% else %>

## Chiedi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Invia questa email](/resources#email) o consegna [questo volantino](/files/schools-handout.pdf) al tuo dirigente.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Recluta un gruppo locale — un gruppo di boy scout, la tua chiesa, l'università o un sindacato. Oppure organizza una "festa di quartiere" per un'Ora del Codice.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>