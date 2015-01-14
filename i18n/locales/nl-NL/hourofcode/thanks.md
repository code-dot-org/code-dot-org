* * *

title: Bedankt dat je je hebt opgegeven een Uur Code te organiseren! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/srH1OEKB2LE"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Bedankt dat je je hebt opgegeven om een Uur Code te organiseren!

**ELKE** Uur Code organisator ontvangt 10 GB Dropbox ruimte of $10 van Skypetegoed als bedankje. [ Details](<%= hoc_uri('/prizes') %>)

## 1. Zegt het voort

Vertel je vrienden over het Uur Code, #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Vraag je hele school een Uur Code aan te bieden

[ Stuur deze mail](<%= hoc_uri('/resources#email') %>) of [deze hand-out](/resources/hoc-one-pager.pdf) aan uw opdrachtgever.

<% else %>

## 2. Vraag je hele school een Uur Code aan te bieden

[ Stuur deze email](<%= hoc_uri('/resources#email') %>) of geef [deze hand-out](/resources/hoc-one-pager.pdf) deze hand-out</a> aan uw opdrachtgever.

<% end %>

## 3. Maak een donatie

[ doneer aan onze crowdfunding campagne.](http://<%= codeorg_url() %>/ doneren) Om 100 miljoen kinderen iets aan te leren hebben wij uw steun nodig. We hebben zopas <0donate">de grootste crowdfunding campagne</a> in de geschiedenis gelanceerd. *Elke*ingezamelde euro zal worden verdubbeld door[ donoren](http://<%= codeorg_url() %>/over/donoren) zij verdubbelen je inspanning.

## 4. Vraag uw werkgever om betrokken te raken

[ Stuur deze email](<%= hoc_uri('/resources#email') %>) naar uw manager of de CEO. Of [Geef ze deze hand-out](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promoot het Uur Code in je gemeenschap

Werk samen met een vereniging — scouting, kerk, universiteit of vakbond. Of organiseer een Uur Code "buurtfeest" voor je wijk.

## 6. Vraag een politicus het Uur Code te ondersteunen

[ Stuur deze email](<%= hoc_uri('/resources#politicians') %>) naar uw burgemeester, gemeenteraad of schoolteam. Of [Geef ze deze hand-out](http://hourofcode.com/resources/hoc-one-pager.pdf) om hen voor een bezoek aan uw school uit te nodigen.

<%= view 'popup_window.js' %>