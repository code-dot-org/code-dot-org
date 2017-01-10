* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#OraEKodimit' %>

# Faleminderit që u regjistruat si organizator në Orën e Kodimit!

Ju po i mundësoni studentëve në mbarë botën të mësojnë Orën e Kodimit e cila *mund të ndryshojë jetën e tyre*, gjatë <%= campaign_date('full') %>. Do të mbetemi në kontakt rreth tutorialeve të rinj dhe përditësimeve të tjera. Cfarë mund të bëni tani?

## 1. Përhap fjalën

Ju sapo u bashkuat lëvizjes Ora e Kodimit. Tregojuni miqve tuaj për **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Gjej një vullnetar të zonës për të të ndihmuar me eventin.

[Kërko në hartën tonë të vullnetarve](%= resolve_url('https://code.org/volunteer/local') %) për të gjetur vullnetarë të cilët mund të vizitojnë klasën tuaj ose të bëjnë një bisedë në video për të frymëzuar studentët rreth mundësive në shkencën kompjuterike.

## 3. Kërkoj gjithë shkollës që të ofrojë një Orë Kodimi

[Dergo këtë email](%= resolve_url('/promote/resources#sample-emails') %) në drejtori dhe sfidoni të gjithat klasat ne shkollën tuaj për tu regjistruar.

## 4. Kërkojini punëdhënësit tuaj që të përfshihet

[Dërgo këtë email](%= resolve_url('/promote/resources#sample-emails') %) te menaxheri juaj ose te drejtori ekzekutiv i kompanisë.

## 5. Promovo Orën e Kodimit brenda komunitetit tënd

[Rekruto një grup lokal](%= resolve_url('/promote/resources#sample-emails') %) — universiteti, klubi i futbollit, teatri. Nuk nevojitet shkolla për të mësuar aftësi të reja. Përdorni këto [postera, banera, stikers, video dhe më shumë](%= resolve_url('/promote/resources') %) për eventin tënd.

## 6. Pyet një deputet lokal për të suportuar Orën e Kodimit

[Dërgo këtë email](%= resolve_url('/promote/resources#sample-emails') %) te përfaqësuesit lokal, këshilli i qytetit ose bordi i shkollës dhe ftoji që të vizitojnë shkollën tuaj për Orën e Kodimit. Ajo mund të ndihmojë të ndërtosh mbështetje për shkencën kompjuterike në zonën tuaj përtej një ore.

## 7. planifikoni Orën tuaj të Kodimit

Zgjidhni një aktivitet të Orës së Kodimit dhe [shikoni këtë udhëzues](%= resolve_url('/how-to') %).

## 8. Shkoni përtej një Ore Kodimi

Jeni gati të shkoni përtej një ore? Shikoni [të gjitha kurset tona dhe burimet e mësuesve](%= resolve_url('https://code.org/teach')%) që përfshijnë mundësi mësimi profesionale për mësues të shkollave elementare deri tek ato në gjimnaz.

<%= view 'popup_window.js' %>