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

# Ďakujeme Vám, že organizujete udalosť Hodina Kódu!

Ako poďakovanie za pomoc pri možnosti naštartovania výuky informatiky pre študentov by sme Vám radi ponúkli zadarmo sadu profesionálnych plagátov s rôznymi vzormi pre Vašu triedu. Použite kód **FREEPOSTERS** počas objednávania. (Poznámka: Plagáty sú dostupné len do vypredania zásob a musíte uhradiť poštovné. Tieto plagáty sa zasielajú zo Spojených Štátov Amerických a poštovné na Slovensko môže byť vysoké. V prípade, že nemáte dostatočné prostriedky, môžete si vytlačiť [PDF súbory](https://code.org/inspire) pre Vašu triedu.)  
<br /> [<button>Získajte plagáty</button>](https://store.code.org/products/code-org-posters-set-of-12) Použite kód FREEPOSTERS

<% if @country == 'us' %> <% end %>

<br /> **Hodina Kódu je počas <%= campaign_date('full') %> a my Vám budeme priebežne prinášať nové návody a iné zaujímavé aktuality. Viete však, čo môžete dovtedy spraviť?**

## 1. Šírte slovo vo Vašej škole a komunite

Práve ste sa zapojili do hnutia Hodina Kódu. Povedzte o tom svojim priateľom **#HourOfCode #HodinaKodu**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Povzbuďte ostatných k účasti [našimi vzorovými e-mailmi.](<%= resolve_url('/promote/resources#sample-emails') %>) Kontaktujte Vášho riaditeľa a povzbuďte každú triedu k účasti na aktivite. Naverbujte lokálnu skupinu - skautský klub, cirkevné spoločenstvo, univerzity, odbory alebo kamarátov. Nemusíte byť v škole, aby ste sa naučili nové zručnosti. Pozvite miestneho politika alebo zákonodarcu na návštevu Vašej školy počas Hodiny Kódu. Môže to podporiť vyučovanie informatiky vo Vašom okolí.

Na Vašej udalosti využite [plagáty, bannery, nálepky, či videá](<%= resolve_url('/promote/resources') %>).

## 2. Nájdite si dobrovoľníka vo Vašom okolí, ktorý Vám pomôže s organizáciou udalosti

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Naplánujte si Vašu Hodinu Kódu

Vyberte si [ aktivitu Hodiny Kódu](https://hourofcode.com/learn) pre Vašu triedu a [ prečítajte si tento návod](<%= resolve_url('/how-to') %>).

# Za hranice Hodiny Kódu

<% if @country == 'us' %> Hodina Kódu je len začiatkom. Či už ste správca, učiteľ, alebo ambasádor, máme [ profesionálne nástroje, osnovy a zdroje, ktoré Vám pomôžu priniesť hodiny informatiky na Vašu školu alebo rozšíriť ich ponuku.](https://code.org/yourschool) Ak už informatiku vyučujete, môžete použiť tieto zdroje počas Týždňa výučby informatiky pre získanie podpory zo strany správnych orgánov, rodičov a komunity.

Na výber máte z veľkého počtu možností. Väčšina organizácií ponúkajúca návody Hodiny Kódu má k dispozícií aj osnovy na profesionálny rozvoj. Ak nájdete Hodinu, ktorá sa Vám páči, spýtajte sa, ako môžete pokračovať ďalej. Pre uľahčenie začiatku sme pre Vás zvýraznili niekoľko [poskytovateľov osnov, ktorí pomôžu Vám alebo Vaším študentom pokračovať ďalej v aktivitách, ktoré začali počas Hodiny.](https://hourofcode.com/beyond)

<% else %> Hodina Kódu je len začiatkom. Väčšina organizácií ponúkajúca návody Hodiny Kódu má k dispozícií aj osnovy na profesionálny rozvoj. Pre uľahčenie začiatku sme pre Vás zvýraznili niekoľko [poskytovateľov osnov, ktorí pomôžu Vám alebo Vaším študentom pokračovať ďalej v aktivitách, ktoré začali počas Hodiny.](https://hourofcode.com/beyond)

Code.org ponúka pre Vás alebo Vašu školu [úvodné hodiny informatiky](https://code.org/educate/curriculum/cs-fundamentals-international) preložené do viac ako 25 jazykov a to úplne zadarmo, bez akýchkoľvek nákladov. <% end %>

<%= view 'popup_window.js' %>