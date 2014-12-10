* * *

title: Дякуємо за реєстрацію заходу Години коду! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Дякуємо за реєстрацію заходу в межах Години коду!

**КОЖЕН** організатор заходів Години коду отримає 10 GB простору на Dropbox або $10 кредиту Skype в якості подяки. [Детальніше](<%= hoc_uri('/prizes') %>)

## 1. Поширюйте інформацію

Розкажіть своїм друзям про #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Надішліть цього листа](<%= hoc_uri('/resources#email') %>) або [цей буклет](/resources/hoc-one-pager.pdf) своєму директору.

<% else %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Надішліть цього листа](<%= hoc_uri('/resources#email') %>) або передайте [цей ](/resources/hoc-one-pager.pdf) буклет</a> своєму директору.

<% end %>

## 3. Зробіть пожертву

[Зробіть внесок у нашу краудфандингову кампанію.](http://<%= codeorg_url() %>/donate) Щоб навчити 100 мільйонів учнів, нам потрібна підтримка. Ми запустили [найбільшу краудсорсингову кампанію](http://<%= codeorg_url() %>/donate) в історії. *Кожен* долар пожертв подвоять [спонсори](http://<%= codeorg_url() %>/about/donors), збільшуючи ваш внесок.

## 4. Попросіть про участь свою адміністрацію

[Надішліть цього листа](<%= hoc_uri('/resources#email') %>) своєму керівникові чи директору. Або [передайте їм буклет](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Сприяйте Годині коду у свій спільноті

Залучайте місцеву спільноту - клуб пластунів, церкву, університет, ветеранський клуб чи профспілку. Або проведіть вечірку Години коду для своїх сусідів.

## 6. Зверніться до місцевих депутатів по підтримку Години коду

[Надішліть цього листа](<%= hoc_uri('/resources#politicians') %>) міському голові, місцевій або шкільній раді. Або [передайте буклет](http://hourofcode.com/resources/hoc-one-pager.pdf) та запросіть відвідати школу.

<%= view 'popup_window.js' %>