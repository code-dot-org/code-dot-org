* * *

títol: Gràcies per registrar-se per acollir una Hora de Codi! maquetació: àmplia

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Gràcies per registrar-se per acollir una Hora de Codi!

**CADA** organitzador de l'Hora de Codi rebrà 10 GB d'espai Dropbox o 10 dòlars de crèdit Skype com agraïment. [Detalls](/prizes)

<% if @country == 'us' %>

Aconsegueix que tota la teva [escola participi](/us/prizes) d'una oportunitat de grans premis per a tota l'escola.

<% end %>

## 1. Corre la veu

Informa als teus amics sobre #HoraDeCodi.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Demana a tothom de la teva escola que ofereixin una Hora de Codi

[Envia aquest correu](/resources#email) o [dona aquest fulletó al teu director](/files/schools-handout.pdf). Un cop la vostra escola sigui a bord, [entra per guanyar 10,000 dòlars de valor en tecnologia per a la teva escola](/prizes) i intenta que altres escoles de la teva àrea puguin a bord.

<% else %>

## 2. Demana a tothom de la teva escola que ofereixin una Hora de Codi

[Envia aquest correu](/resources#email) o dona [aquest fulletó](/files/schools-handout.pdf) al teu director.

<% end %>

## 3. Fes una donació generosa

[Doneu a la nostra campanya de crowdfunding](http://code.org/donate). Per ensenyar a 100 milions de nens, necessitem el teu suport. Acabem de llançar el que podria ser la [major campanya de crowdfunding per l'educació](http://code.org/donate) en la història. Cada dòlar serà igualat pel majors [donants](http://code.org/about/donors) de Code.org , doblant el seu impacte.

## 4. Demana a la teva empresa que s'impliqui

[Envia aquest correu](/resources#email) al teu superior, o director executiu. O [dóna'ls aquest fulletó](/resources/hoc-one-pager.pdf).

## 5. Promou l'Hora de Codi a la teva comunitat

Recluta un grup local — escoltes, església, universitat, grup de veterans o sindicals. O ofereix una Hora de Codi "com una festa al carrer" per al teu barri.

## 6. Demana a un funcionari electe local que doni suport a l'Hora de Codi

[Envia aquest correu](/resources#politicians) al seu alcalde, Ajuntament o Consell Escolar. O [dóna'ls aquest fulletó](/resources/hoc-one-pager.pdf) i convida'ls a visitar la teva escola.

<%= view 'popup_window.js' %>