* * *

títol: Gràcies per registrar-se per acollir una Hora de Codi! maquetació: àmplia

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Gràcies per registrar-se per acollir una Hora de Codi!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. Corre la veu

Informa als teus amics sobre #HoraDeCodi.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Demana a tothom de la teva escola que ofereixin una Hora de Codi

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>). Un cop la vostra escola sigui a bord, [entra per guanyar 10,000 dòlars de valor en tecnologia per a la teva escola](/prizes) i intenta que altres escoles de la teva àrea puguin a bord.

<% else %>

## 2. Demana a tothom de la teva escola que ofereixin una Hora de Codi

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>) to your principal.

<% end %>

## 3. Fes una donació generosa

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Demana a la teva empresa que s'impliqui

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promou l'Hora de Codi a la teva comunitat

Recluta un grup local — escoltes, església, universitat, grup de veterans o sindicals. O ofereix una Hora de Codi "com una festa al carrer" per al teu barri.

## 6. Demana a un funcionari electe local que doni suport a l'Hora de Codi

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>