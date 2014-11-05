* * *

title: Дякуємо за реєстрацію заходу Години коду! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Дякуємо за реєстрацію заходу в межах Години коду!

**КОЖЕН** організатор заходів Години коду отримає 10 GB простору на Dropbox або $10 кредиту Skype в якості подяки. [Детальніше](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Реєструйте [для участі всю школу,](<%= hoc_uri('/prizes') %>) щоб претендувати на більші призи.

<% end %>

## 1. Поширюйте інформацію

Розкажіть своїм друзям про #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Розішліть цього листа](<%= hoc_uri('/resources#email') %>) або [цю роздруківку](<%= hoc_uri('/files/schools-handout.pdf') %>). Як тільки ваша школа зареєструється, вона [отримує шанс виграти техніку вартістю $10,000](/prizes) і кинути виклик іншим школам району.

<% else %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Розішліть цього листа](<%= hoc_uri('/resources#email') %>) або передайте [цю роздруківку](<%= hoc_uri('/files/schools-handout.pdf') %>) своїй адміністрації.

<% end %>

## 3. Зробіть пожертву

[Зробіть внесок у нашу краудфандингову кампанію.](http://<%= codeorg_url() %>/donate) Щоб навчити 100 мільйонів учнів, нам потрібна підтримка. Ми оголосили кампанію, котра може стати [найбільшою освітньою краудфандинговою кампанією](http://<%= codeorg_url() %>/donate) в історії. Кожен отриманий долар пожертв буде подвоєний основними [спонсорами](http://<%= codeorg_url() %>/about/donors) Code.org.

## 4. Попросіть про участь свою адміністрацію

[Надішліть цього листа](<%= hoc_uri('/resources#email') %>) своєму керівникові. Або [передайте цю роздруківку](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Сприяйте Годині коду у свій спільноті

Залучайте місцеву спільноту - клуб пластунів, церкву, університет, ветеранський клуб чи профспілку. Або проведіть вечірку Години коду для своїх сусідів.

## 6. Зверніться до місцевих депутатів по підтримку Години коду

[Надішліть цього листа](<%= hoc_uri('/resources#politicians') %>) своєму мерові, міській чи шкільній раді. Або [передайте роздруківку](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) та запросіть відвідати школу.

<%= view 'popup_window.js' %>