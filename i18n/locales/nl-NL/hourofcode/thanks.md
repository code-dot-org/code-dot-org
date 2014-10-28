* * *

title: Bedankt dat je je hebt opgegeven een Uur Code te organiseren! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/srH1OEKB2LE"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Bedankt dat je je hebt opgegeven om een Uur Code te organiseren!

**IEDERE** Uur Code-organisator krijgt 10GB Dropbox-ruimte of $10 aan Skype-credit als bedankje. [Details](/prizes)

<% if @country == 'us' %>

Zorg dat je [hele school meedoet](/us/prizes) om kans te maken op grote prijzen voor je hele school.

<% end %>

## 1. Zegt het voort

Vertel je vrienden over het Uur Code, #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Vraag je hele school een Uur Code aan te bieden

[Stuur deze mail](/resources#email) of [geef deze documenten aan je rector](/files/schools-handout.pdf). Is je school aan boord, [ding dan mee naar $10.000 aan technologie voor je school](/prizes) en daag andere scholen in je district uit ook mee te doen.

<% else %>

## 2. Vraag je hele school een Uur Code aan te bieden

[Stuur deze mail](/resources#email) of geef [deze documenten](/files/schools-handout.pdf) aan je rector.

<% end %>

## 3. Maak een donatie

[Doneer aan onze crowdfunding campagne](http://code.org/donate). Om te leren aan 100 miljoen kinderen, hebben wij uw steun nodig. We hebben zonet, wat hèt [grootste crowdfunding voorlichtingscampagne](http://code.org/donate) in de geschiedenis kan worden, gelanceerd. Elke dollar zal door grote Code.org [donoren](http://code.org/about/donors) verdubbeld worden.

## 4. Vraag uw werkgever om betrokken te raken

[Stuur deze e-mail](/resources#email) naar uw manager of de CEO. Of [Geef ze deze documenten](/resources/hoc-one-pager.pdf).

## 5. Promoot het Uur Code in je gemeenschap

Werk samen met een vereniging — scouting, kerk, universiteit of vakbond. Of organiseer een Uur Code "buurtfeest" voor je wijk.

## 6. Vraag een politicus het Uur Code te ondersteunen

[Stuur deze mail](/resources#politicians) aan je burgemeester, raad of schoolbestuur. Of [Geef ze deze documenten ](/resources/hoc-one-pager.pdf)en nodig hen uit voor een bezoek aan je school.

<%= view 'popup_window.js' %>