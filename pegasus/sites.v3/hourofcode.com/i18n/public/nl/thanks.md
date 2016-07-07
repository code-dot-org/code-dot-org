---
  title: <%= hoc_s(:title_signup_thanks) %>
  layout: wide
  nav: how_to_nav

  social:
    "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
    "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
    "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
    "og:image:width": 1440
    "og:image:height": 900
    "og:url": "http://<%=request.host%>"

    "twitter:card": player
    "twitter:site": "@codeorg"
    "twitter:url": "http://<%=request.host%>"
    "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
    "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
    "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  ---

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Bedankt dat je je hebt opgegeven om een CodeUur te organiseren!

Je maakt het mogelijk voor studenten over de hele wereld om te leren van één uur van CodeUur die *de rest van hun leven zal veranderen*, tijdens < % = campaign_date('full') % >. We'll be in touch about new tutorials and other exciting updates. Wat kunt u nu doen?

## 1. Spreid het woord

U heeft zojuist deelgenomen aan de CodeUur beweging. Vertel het uw vrienden met **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Vind een vrijwilliger uit de buurt die u kunt helpen met uw evenement.

[Kijk op onze vrijwilligers kaart](<%= resolve_url('https://code.org/volunteer/local') %>) voor vrijwilligers die uw klas kunnen bezoeken of met de klas kunnen videochatten om uw studenten te inspireren over de breedte van mogelijkheden van programmering.

## 2. Vraag je hele school om een CodeUur aan te bieden

[Stuur deze e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) naar uw opdrachtgever en daag elk klaslokaal op uw school uit om aan te melden.

## 4. Vraag uw werkgever om betrokken te raken

[Stuur deze e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) naar uw manager of bedrijf CEO.

## 5. Promoot het CodeUur in uw gemeenschap

[Werf een lokale groep](<%= resolve_url('/promote/resources#sample-emails') %>) — jongen/meisje scout clubs, kerk, universiteit, veteranen groep, vakbond of zelfs sommige vrienden. U hoeft niet op school te zitten om nieuwe skills te leren. Gebruik deze [posters, banners, stickers, video's en meer](<%= resolve_url('/promote/resources') %>) voor uw eigen evenement.

## 6. Vraag een politicus het CodeUur te ondersteunen

[Stuur deze e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) naar uw lokale vertegenwoordigers, gemeenteraad of schoolbestuur, om hen uit te nodigen voor het CodeUur op uw school. Het kan steun bieden aan programmering binnen uw gemeente in maar één uur.

## 7. Plan uw CodeUur

Kies een CodeUur activiteit en [bekijk deze how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>