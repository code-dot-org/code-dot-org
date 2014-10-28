* * *

title: Takk for at du meldte deg på som vert for Kodetimen! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#Kodetimen' %>

# Takk for at du meldte deg på som vert for Kodetimen!

**ALLE** som organiserer en Kodetime får 10 GB Dropbox-lagringsplass eller $10 Skype-kredit som en takk. [Detaljer](/prizes)

<% if @country == 'us' %>

Få hele [skolen din til å delta](/us/prizes) for å gi den en sjanse til å vinne store premier.

<% end %>

## 1. Spre ordet

Fortell vennene dine om #Kodetimen.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Spør hele skolen din om å tilby en Kodetime

[Send denne eposten](/resources#email) eller [gi denne flyeren til rektoren din](/files/schools-handout.pdf). Når skolen din har meldt seg på, [bli med i konkurransen om $10,000 i datautstyr til din skole](/prizes) og utfordre andre skoler i ditt område til å bli med.

<% else %>

## 2. Spør hele skolen din om å tilby en Kodetime

[Send denne e-posten](/resources#email) eller gi [dette støttearket](/files/schools-handout.pdf) til rektoren din.

<% end %>

## 3. Bidra med midler

[Bidra til vår crowdfunding-kampanje](http://code.org/donate). For å lære 100 millioner barn programmering, trenger vi din støtte. Vi har akkurat lansert det som kan bli den [største crowdfunding-kampanje for opplæring](http://code.org/donate) i historien. Hver krone som samles inn vil bli matchet av Code.orgs [sponsoer ](http://code.org/about/donors), så din gave blir dobbelt så stor.

## 4. Be arbeidsgiveren din engasjere seg

[Send denne e-posten](/resources#email) til din leder eller administrerende direktør. Eller [gi dem dette fllygebladet](/resources/hoc-one-pager.pdf).

## 5. Snakk om Kodetimen i ditt lokalmiljø

Rekrutter en lokal klubb, ett idrettslag, universitet eller fagforening. Eller arranger en Kodetime "fest" for nabolaget.

## 6. Spør en lokalpolitiker om å støtte Kodetimen

[Send denne e-posten](/resources#politicians) til ordfører, bystyret eller skolestyret. Eller [gi dem dette flygebladet](/resources/hoc-one-pager.pdf) og invitere dem til skolen.

<%= view 'popup_window.js' %>