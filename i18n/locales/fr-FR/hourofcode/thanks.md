* * *

Merci de vous inscrire pour organiser une Heure de Code! mise en page: large

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Merci de vous inscrire pour organiser une Heure de Code!

**Chaque** organisateur d'Heure de Code recevra 10 GB d'aspace sur Dropbox ou 10$ de crédits Skype comme remerciement. [Détails](<%= hoc_uri('/prizes') %>)

## Passer le mot

Parlez de #HourOfCode à vos amis.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Demandez à toute votre école de participer à l'Heure de Code

[ Envoyez ce courriel](<%= hoc_uri('/resources#email') %>) ou [ce document](/resources/hoc-one-pager.pdf) à votre directeur ou votre directrice.

<% else %>

## 2. Demandez à toute votre école de participer à l'Heure de Code

[ Envoyez ce courriel](<%= hoc_uri('/resources#email') %>) ou [ce document](/resources/hoc-one-pager.pdf) ce document</a> à votre directeur ou votre directrice.

<% end %>

## 3. Faites un don généreux

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Demandez à votre employeur de s'impliquer

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promouvoir Une Heure de Code au sein de votre communauté

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Demandez à un élu local d'appuyer l'heure de Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>