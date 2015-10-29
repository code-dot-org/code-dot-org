* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

Tu faci posibil pentru toti elevii din intreaga lume sa invete o Ora de Programare ce le poate *chimba tot resul vietii*, in timpul campaniei <%= campaign_date('full') %>. Vom afia in curand premiile, noile tutoriale si alte noutati distractive. Ce poti face acum?

## 1. Răspândește vestea

Doar ce te-ai alaturat miscarii Hour of Code. Spune-le si prietenilor cu **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Solicită întregii şcoli sa ofere o Oră de Programare

[Trimiteți acest e-mail](%= resolve_url('/promote/resources#sample-emails') %)directorului scolii dvs si astfel provocati fiecare clasa sa se inscrie. <% if @country == 'us' %> O scoala norocoasa din *fiecare* stat U.S. (si Washington D.C.) vor castiga echipamente tehnologice in valoare de 10 000 de dolari. [Inregistreaza-te aici](%= resolve_url('/prizes/hardware-signup') %) pentru a fi eligibil si [**vezi castigatorii de anul trecut.**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. Solicită angajatorului tău să se implice

[Trimite acest e-mail](%= resolve_url('/promote/resources#sample-emails') %)catre manager-ul sau CEO-ul companiei la care lucrați.

## 4. Promovează Hour of Code în comunitatea ta

[Recruteaza un grup local](%= resolve_url('/promote/resources#sample-emails') %)- cluburi de fete/baieti, biserici, universitati, grupuri de veterani, sindicatele sau chiar câțiva prieteni. Nu trebuie să fii in şcoală ca să înveţi noi competenţe. Foloseşte aceste [ postere, bannere, stickere, videoclipuri si multe altele](%= resolve_url('/promote/resources') %) pentru evenimentul tau.

## 5. Solicită unui oficial ales local sprijinul pentru organizarea Hour of Code

[Trimite acest e-mail](%= resolve_url('/promote/resources#sample-emails') %) catre reprezentantii locali, consiliului local, inspectorilor scolari si invita-i sa iti viziteze scoala in timpul unui eveniment Hour of Code. Acestea te pot ajuta in construirea unei sustineri pentru tehnologia computerelor si programare si dincolo de tutorialele de o ora.

<%= view 'popup_window.js' %>