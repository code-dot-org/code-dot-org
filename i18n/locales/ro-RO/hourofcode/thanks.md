* * *

Titlu: Vă mulțumim pentru ca v-ați înscris să organizați evenimentul Hour of Code! aspect: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Răspândește vestea

Spune prietenilor tai despre #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Solicită angajatorului tău să se implice

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promovează Hour of Code în comunitatea ta

Recrutați un grup local - club de cercetași băieți/fete, biserică, universitate, grupuri de veterani sau asociație. Sau găzduiți o petrecere la bloc Ora de Programare pentru vecinii dvs.

## 5. Solicită unui oficial, ales local, sprijinul pentru organizarea Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>