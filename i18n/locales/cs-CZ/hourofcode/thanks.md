* * *

Název: Děkujeme Vám za registraci uspořádání Hodiny kódu! rozložení: široký

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Děkujeme za přihlášení k hostování akce Hodina kódu!

**KAŽDÝ** organizátor akce Hodina kódu obdrží jako poděkování 10 GB místa na Dropboxu nebo 10 dolarů kreditu na Skypu. [ Podrobnosti](<%= hoc_uri('/prizes') %>)

## 1. Povídejte o tom

Povězte svým přátelům o #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Požádejte celou vaší školu, aby nabídla akci Hodina kódu

[Pošli tento email](<%= hoc_uri('/resources#email') %>) nebo [tento leták](/resources/hoc-one-pager.pdf) svému řediteli.

<% else %>

## 2. Požádejte celou vaší školu, aby nabídla akci Hodina kódu

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. Podpořte projekt velkorysým darem

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Přesvědčete svého zaměstnavatele, aby se zapojil

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Propagujte akci Hodina kódu ve Vaší komunitě

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Požádejte místní radní, aby podpořili akci Hodina kódu

Pošli tento email tvému starostovi, městskému úřadu nebo školní radě. Nebo jim dej tento leták a pozvi je na návštěvu tvé školy.

<%= view 'popup_window.js' %>