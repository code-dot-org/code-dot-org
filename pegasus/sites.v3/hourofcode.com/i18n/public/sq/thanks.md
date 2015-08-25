* * *

titulli: Faleminderit qe u regjistruat si organizator në Orën e Kodimit! shtrirja: e gjerë

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/al"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Faleminderit që u regjistruat si organizator në Orën e Kodimit!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Përhap fjalën

Thuaji shokëve të tu për #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pyesni gjithë shkollën që të ofrojë një Orë Kodimi

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Pyesni punëdhënsin tuaj, që të arrish të përfshihesh

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promovo Orën e Kodimit brenda komunitetit tënd

Rekruto një grup lokal — klube skaute djemësh/vajzash, kishash, universitetesh, grupe veteranësh ose grupe pune. Ose organizo një Orë e Kodimit "festë blloku" për lagjen tuaj.

## 5. Pyet një zyrtar të zgjedhur për të përkrahur Orën e Kodimit

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>