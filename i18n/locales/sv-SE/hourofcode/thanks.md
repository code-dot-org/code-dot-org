* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Tack för att du anmält dig som värd för ett Hour of Code-evenemang!

Du gör det möjligt för elever runt om i världen att lära sig en timme av kod som kan *ändra resten av deras liv*, under < % = campaign_date('full') % >. Vi hör av oss om nya guider och andra spännande uppdateringar. Vad kan du göra redan nu?

## 1. Sprid ordet

Du har nu gått med i Hour of Code rörelsen. Berätta för dina vänner med **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 1. Hitta en lokal volontär som hjälper dig med ditt evenemang.

[Sök på vår karta med volontärer](%= resolve_url('https://code.org/volunteer/local') %) efter någon som kan besöka ditt klassrum eller som kan videochatta på distans för att inspirera dina elever om de stora möjligheterna med datavetenskap.

## 2. Be din skola att arrangera Hour of Code

[Skicka detta mail](%= resolve_url('/promote/resources#sample-emails') %) till din huvudman och utmana varje klassrum på din skola för att registrera dig.

## 4. Be din arbetsgivare att engagera sig

[Skicka detta e-postmeddelande](%= resolve_url('/promote/resources#sample-emails') %) till din chef eller VD.

## 5. Gör reklam för Hour of Code i din kommun

[Rekrytera en lokal grupp](%= resolve_url('/promote/resources#sample-emails') %) — scouter, kyrkan, universitet, veteraner, fackförening eller några vänner. Du behöver inte vara i skolan för att lära sig nya färdigheter. Använda dessa [affischer, banderoller, klistermärken, videor och mycket mer](%= resolve_url('/promote/resources') %) för dina evenemang.

## 6. Be dina lokala politiker stötta Hour of Code

[Skicka detta e-postmeddelande](%= resolve_url('/promote/resources#sample-emails') %) till din lokala politiker, stadsfullmäktige eller skolans ledning och bjud in dem att besöka din skola under Hour of Code. Det kan hjälpa till att bygga stöd för datavetenskap i din kommun efter Hour of Code.

## 7. Planera din Hour of Code

Välj en Hour of Code aktivitet och [titta påndenna handledning](%= resolve_url('/how-to') %).

## 8. Go beyond an Hour of Code

Ready to go beyond an hour? Check out [our full courses and teacher resources](%= resolve_url('https://code.org/teach')%) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>