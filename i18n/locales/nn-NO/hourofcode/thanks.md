* * *

title: Takk for at du melde deg som vert for Kodetimen! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#Kodetimen' %>

# Takk for at du melde deg som vert for Kodetimen!

**KVAR** arrangør av Kodetimen får som takk anten 10 GB lagringsplass i Dropbox eller Skype-kreditt verd 10 dollar. [ Detaljer](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Få [ heile skulen din til å vere med](<%= hoc_uri('/prizes') %>), og de kan vinne store premiar.

<% end %>

## Spre bodskapet

Fortel venane dine om #Kodetimen.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Be heile skulen din om å tilby ein Kodetime

[ Sende denne e-posten](<%= hoc_uri('/resources#email') %>) eller [ dette flygebladet](<%= hoc_uri('/files/schools-handout.pdf') %>). Når skulen din har meldt seg på, [bli med i konkurransen om datautstyr til ein verdi av 10.000 dollar til skulen din](/prizes) og utfordre andre skular i ditt område til å bli med.

<% else %>

## 2. Be heile skulen din om å tilby ein Kodetime

[ Sende denne e-posten](<%= hoc_uri('/resources#email') %>) eller gi [ dette flygebladet](<%= hoc_uri('/files/schools-handout.pdf') %>) til rektoren din.

<% end %>

## 3. Bidra med midler

[Støtt crowdfunding-kampanja vår!](http://<%= codeorg_url() %>/ donere)For å undervise 100 millioner barn, treng vi støtta di. Vi har akkurat lansert det som kan bli[historias største crowdfunding kampanje for utdanning](http://<%= codeorg_url() %>/ donere). Kva krone du gir vil bli matchet av Code.org sine hovudsponsorar [ hovudsponsorar](http://<%= codeorg_url() %>om/givere) slik at ditt bidrag får dobbel effekt.

## 4. Be arbeidsgjevaren din om å engasjere seg

[ Send denne e-posten](<%= hoc_uri('/resources#email') %>) til sjefen din, eller direktøren. Eller [ gi dei dette flygebladet](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## Reklamer for Kodetimen i lokalmiljøet

Rekrutter ein lokal klubb - eit idrettslag, høgskule eller fagforeining. Eller arranger en "Kodetimefest" for nabolaget.

## 6. Be ein lokalpolitikar om å støtte Kodetimen

[ Sende denne e-posten](<%= hoc_uri('/resources#politicians') %>) til ordførar, bystyret eller skulestyret. Eller [ gi dei dette flygebladet](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) og invitere dei til skulen.

<%= view 'popup_window.js' %>