* * *

Merci de vous inscrire pour organiser une Heure de Code! mise en page: large

sociale: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Merci de vous inscrire pour organiser une Heure de Code!

**Chaque** organisateur d'Heure de Code recevra 10 GB d'aspace sur Dropbox ou 10$ de crédits Skype comme remerciement. [Détails](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Faites participer [toute votre école](<%= hoc_uri('/prizes') %>) pour avoir la change de gagner de gros lots pour toute votre école.

<% end %>

## Passer le mot

Parlez de #HourOfCode à vos amis.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Demandez à toute votre école de participer à l'Heure de Code

[Envoyer cet email](<%= hoc_uri('/resources#email') %>) ou [ce feuillet](<%= hoc_uri('/files/schools-handout.pdf') %>). Une fois votre école enrôlée, [tentez de gagner une valeur de 10,000 $ en produits technologiques pour votre école](/prizes) et défiez les autres écoles de votre région à participer.

<% else %>

## 2. Demandez à toute votre école de participer à l'Heure de Code

[Envoyez cet email](<%= hoc_uri('/resources#email') %>) ou donnez [ce feuillet](<%= hoc_uri('/files/schools-handout.pdf') %>) à votre directeur.

<% end %>

## 3. Faites un don généreux

[ Donnez à notre campagne de financement participatif.](http://<%= codeorg_url() %>/ Faites un don) Pour enseigner à 100 millions d'enfants, nous avons besoin de votre soutien. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promote Hour of Code within your community

Recruit a local group — boy scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>