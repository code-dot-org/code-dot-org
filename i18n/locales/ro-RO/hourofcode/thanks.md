* * *

Titlu: Vă mulțumim pentru ca v-ați înscris să organizați evenimentul Hour of Code! aspect: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

**FIECARE** Organizator Hour of Code va primi 10 GB de spaţiu de Dropbox sau 10 dolari de Skype credit ca multumire. [ Detalii](<%= hoc_uri('/prizes') %>)

## 1. Răspândește vestea

Spune prietenilor tai despre #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Trimiteți acest email](<%= hoc_uri('/resources#email') %>) sau [această broșură](/resources/hoc-one-pager.pdf) managerului dvs.

<% else %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Trimiteți acest email](<%= hoc_uri('/resources#email') %>) sau dați [această broșură](/resources/hoc-one-pager.pdf) această broșură</a> managerului dvs.

<% end %>

## 3. Oferă o donaţie generoasă

[Donați pentru campania noastră crowdfunding.](http://<%= codeorg_url() %>/donate) Pentru a învăța 100 millioane de elevi, avem nevoie de sprijinul dvs. Tocmai am lansat [cea mai amplă campanie crowdfunding](http://<%= codeorg_url() %>/donate) din istorie. *Fiecare* dolar va fi compensat [donatori](http://<%= codeorg_url() %>/despre/doantori), doublându-vă impactul.

## 3. Solicită angajatorului să se implice

[Trimiteți acest email](<%= hoc_uri('/resources#email') %>) managerului dvs. sau către CEO. Sau [dați-le această broșură](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 4. Promovează Hour of Code în jurul tău

Recrutați un grup local - club de cercetași băieți/fete, biserică, universitate, grupuri de veterani sau asociație. Sau găzduiți o petrecere la bloc Ora de Programare pentru vecinii dvs.

## 5. Solicită unui oficial, ales local, sprijinul pentru organizarea Hour of Code

[Trimiteți acest email](<%= hoc_uri('/resources#politicians') %>) primarului, consiliului local sau consiliului de administrație. Sau [dați-le această broșură](http://hourofcode.com/resources/hoc-one-pager.pdf) și invitați-i să vă viziteze școala.

<%= view 'popup_window.js' %>