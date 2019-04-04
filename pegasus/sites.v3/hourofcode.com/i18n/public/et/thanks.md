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

# Täname, et ühinesite KoodiTund kampaaniaga!

<br /> **KoodiTund toimub <%= campaign_date('full') %> ning me võtame ühendust, kui uued juhendid valmivad või kui meil on põnevaid uudiseid. Aga mida saaksid kohe teha?**

## 1. Levita infot oma koolis ja kogukonnas

Liitusid just KoodiTund liikumisega. Ütle oma sõpradele ka **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Julgusta teisi ka osalema [ meie näidis e-kirjadega.](<%= resolve_url('/promote/resources#sample-emails') %>) Võta ühendust oma direktoriga ning kutsu kõiki klasse KoodiTund üritust läbi viima. Kutsu ka kohalikke gruppe - skaudid, gaidid, klubid, kirikud, ülikoolid, seenioriteklubid, ametiühingud või isegi sõpruskonnad. Sa ei pea õppima koolis, et uusi oskusi omandada. Kutsu kohalik poliitik või otsustaja oma kooli KoodiTund ürituse ajal. See aitab kaasa arvutiteaduse tutvustamisele laiemalt.

Kasuta neid[ plakateid, kleepekaid, videosid ja muud](<%= resolve_url('/promote/resources') %>) enda ürituse korraldamisel.

## 2. Leia lähedal paiknev vabatahtlik, kes aitaks sind sinu üritusega.

[Otsi vabatahtlikke kaardilt](<%= codeorg_url('/volunteer/local') %>). Vabatahtlikud võivad su klassi külastada või videolingi abil klassiga suhelda ning kõneleda arvutiteaduse võimalustest.

## 3. Planeeri KoodiTund üritus

Vali [ KoodiTund tegevus](https://hourofcode.com/learn) oma klassi ja oks ja [ tutvu vastava juhendiga](<%= resolve_url('/how-to') %>).

# Peale KoodiTundi

<% if @country == 'us' %> KoodiTund on alles algus. Sõltumata sellest, kas oled õpetaja või projektijuht, meil on [ tunniplaanid ja materjalid, mis aitavad sinu koolil oma arvutiteaduse alast valikut laiendada.](https://code.org/yourschool) Kui sa juba õpetad arvutiteadusi, siis kasuta Arvutiteaduse hariduse nädalat kui võimalust valdkonda tutvustada ning lapsevanemate ja kogukonna toetust valdkonnale tõsta.

Teil on palju valikuid vastavalt oma koolile. Enamik organisatsioone pakub KoodiTund materjale koos tunniplaaniga ning võimalustega ametialaseks arenguks. Kui leiad tunni, mis sulle sobib, siis küsi lisainfot. Et aidata teil alustada, oleme välja toonud mitmeid [õppekava pakkujaid, kes aitavad õpilastel peale KoodiTundi valdkonnaga edasi minna.](https://hourofcode.com/beyond)

<% else %> KoodiTund on alles algus. Enamik organisatsioone pakub õppekavasid, mis aitavad valdkonnaga edasi liikuda. Et aidata teil alustada, oleme välja toonud mitmeid [õppekava pakkujaid, kes aitavad õpilastel peale KoodiTundi valdkonnaga edasi minna.](https://hourofcode.com/beyond)

Code.org pakub ka täielikke [ arvutiteaduste sissejuhatavaid kursusi](https://code.org/educate/curriculum/cs-fundamentals-international), mis on tõlgitud enam kui 25 keelde ning mida kool saab kasutada tasuta. <% end %>

<%= view 'popup_window.js' %>