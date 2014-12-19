* * *

title: Paldies par izrādīto vēlmi vadīt "Programmēšanas stundu"! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Paldies, ka uzņēmies vadīt "Programmēšanas stundu"!

**Katrs** "Programmēšanas stundas" organizators pateicībā saņems 10 GB vietas Dropbox vai $10 Skype kredīta. [Sīkāk](<%= hoc_uri('/prizes') %>)

## 1. Dalies ar informāciju

Pastāsti saviem draugiem par "Programmēšanas stundu".

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Lūdz visai skolai piedalīties "Programmēšanas stundā"

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## 2. Lūdz visai skolai piedalīties "Programmēšanas stundā"

[Nosūti šo e-pastu](<%= hoc_uri('/resources#email') %>) vai iesniedz[šo reklāmlapu](/resources/hoc-one-pager.pdf) šo reklāmlapu</a> direktoram.

<% end %>

## 3. Veic dāsnu ziedojumu

[ Ziedo mūsu kampaņai.](http://<%= codeorg_url() %>/ziedo) Lai apmācītu 100 miljonus bērnu, mums ir nepieciešams tavs atbalsts. Mēs tikko sākām [lielāko izglītības kampaņu](http://<%= codeorg_url() %>/donate) vēsturē. 

## 4. Aiciniet savu darba devēju iesaistīties

[Nosūtiet šo e-pastu](<%= hoc_uri('/resources#email') %>) priekšniekam vai uzņēmuma vadītājam. Iesniedziet [šo reklāmlapu](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Popularizē "Programmēšanas stundu" savā kopienā

Iesaisti vietējās organizācijas - baznīcas, universitāšu vai veterānu kopienas/organizācijas. Tāpat vari arī vadīt "Programmēšanas stundu" kaimiņiem.

## 6. Lūdziet vietējām amatpersonām atbalstīt "Programmēšanas stundu"

[Nosūtiet šo e-pastu](<%= hoc_uri('/resources#politicians') %>) deputātiem, pilsētu padomēm vai skolu padomēm. [Iedodiet šo reklāmlapu](http://hourofcode.com/resources/hoc-one-pager.pdf) un uzaiciniet viņus apmeklēt Jūsu skolu.

<%= view 'popup_window.js' %>