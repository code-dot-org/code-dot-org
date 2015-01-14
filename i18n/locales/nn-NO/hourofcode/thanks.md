* * *

title: Takk for at du melde deg som vert for Kodetimen! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#Kodetimen' %>

# Takk for at du melde deg som vert for Kodetimen!

**KVAR** arrangør av Kodetimen får som takk anten 10 GB lagringsplass i Dropbox eller Skype-kreditt verd 10 dollar. [ Detaljer](<%= hoc_uri('/prizes') %>)

## Spre bodskapet

Fortel venane dine om #Kodetimen.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Be heile skulen din om å tilby ein Kodetime

[Send denne e-mailen](<%= hoc_uri('/resources#email') %>) eller [dette utdraget](/resources/hoc-one-pager.pdf) til rektoren din.

<% else %>

## 2. Be heile skulen din om å tilby ein Kodetime

[Send denne e-mailen](<%= hoc_uri('/resources#email') %>) eller gi [dette utdraget](/resources/hoc-one-pager.pdf) til rektoren din.

<% end %>

## 3. Bidra med midler

[Doner til vår gruppe-fonderende kampanje.](http://<%= codeorg_url() %>/donate) For å lære 100 millioner barn, så trenger vi din støtte. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Be arbeidsgjevaren din om å engasjere seg

[Send denne e-mailen](<%= hoc_uri('/resources#email') %>) til lederen din, eller sjefen din. Eller [gi dem dette utdraget.](http://hourofcode.com/resources/hoc-one-pager.pdf).

## Reklamer for Kodetimen i lokalmiljøet

Rekrutter en lokal klubb, ett idrettslag, universitet eller fagforening. Eller arranger en Kodetime "fest" for nabolaget.

## 6. Be ein lokalpolitikar om å støtte Kodetimen

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>