* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Siyabonga ngokuzinikela ukuze usingathe iHora loKufingqwa!

Wenza kukhonakale ukuba abafundi kumhlaba wonke jikelele bakhone ukufunda ihora elilodwa leHora loKufingqwa elinga *shintsha ukuphila kwabo konke*, phakathi <%= campaign_date('full') %>. Sizoxhumana ngezifundiso ezinsha kanye nezibuyekezo ezithokozisayo. Ungenzani?

## 1. Sabalalisa izwi

Usuzibandakanye nonyakazo weHora loKufingqwa. Xoxela izihlobo zakho nge**#HoraloKufingqwa**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Thola ivolontiya yendawo ukukusiza ngomcimbi wakho.

[ Cinga ibalazwe yamavolontiya ethu](%= resolve_url('https://code.org/volunteer/local') %) ukuthola amavolontiya angasiza ukuvakashela ikilasi lakho okanye baxoxisane ngokwe vidiyo ukugqugquzela abafundi bakho ngobubanzi bamathuba ngekhompyutha sayensi.

## 3. Cela isikole sakho sonke sinikezele iHora loKufingqwa

[Thumela imeyili leli](%= resolve_url('/promote/resources#sample-emails') %) kuthisha nhloko wakho uphinde ufake inselela kumakilasi wonke akho kusikole sakho ukuba babhalise.

## 4. Cela umqashi wakho azibandakanye

[Thumela le imeyili](%= resolve_url('/promote/resources#sample-emails') %) kumphathi wakho okanye kuCEO yenkampani.

## 5. Khuthaza iHora loKufingqwa kumphakathi wakho

[Faka iqembu lendawo](%= resolve_url('/promote/resources#sample-emails') %)- umfana/intombazana ikilabhu yamaskhawuthi, ibandla, inyuvesi, iqembu lamaqhawe akudala, inyunyana zabasebenzi, okanye abagane abathize. Akudingeki ukuba ube esikoleni ukuze ufunde amakhono amasha. Sebenzisa lokhu [amaphosta, amabhena, izitembu, amavidiyo kanye nokunye okuningi](%= resolve_url('/promote/resources') %) kumcimbi wakho.

## 6. Cela okhethiwe ngokusemthethweni womphakarthi ukuba asekele iHora loKufingqwa

[Thumela le-imayili](%= resolve_url('/promote/resources#sample-emails') %) kulabo abamela indawo yakini, umasipaladi, okanye ibhodi yesikole uphinde ubameme ukuba bezovakashela isikole sakho ngeHora loKufingqwa. Ingasiza ukwakha ukusekelwa kwekhompyutha sayensi kusigodi sakho phambi kwehora elilodwa.

## 7. Hlela iHora loKufingqwa lwakho

Khetha umsebenzi weHora loKufingqwa uphinde [ubuyekeze lendlela yokuqondisa](%= resolve_url('/how-to') %).

## 8. Go beyond an Hour of Code

Ready to go beyond an hour? Check out [our full courses and teacher resources](%= resolve_url('https://code.org/teach')%) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>