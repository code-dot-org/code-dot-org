* * *

title: Дякуємо за реєстрацію заходу Години коду! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Дякуємо за реєстрацію заходу в межах Години коду!

**КОЖЕН** організатор Години код отримає 10 Гб простору Dropbox або кредит $10 у Skype в якості подяки. [Подробиці](/prizes)

<% if @country == 'us' %>

Залучайте [цілу школу](/us/prizes), щоб отримати шанс виграти цінні призи для свого закладу.

<% end %>

## 1. Поширюйте інформацію

Розкажіть своїм друзям про #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Розішліть цього листа](/resources#email) або [передайте роздруківку директору](/files/schools-handout.pdf). Як тільки ваша школа зареєструється, вона [отримує шанс виграти техніку вартістю $10,000](/prizes) і кинути виклик іншим школам району.

<% else %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Розішліть цього листа](/resources#email) або передайте [роздруківку](/files/schools-handout.pdf) директору.

<% end %>

## 3. Зробіть пожертву

[Підтримайте нашу кампанію з краудфандингу](http://code.org/donate). Щоб навчити 100 мільйонів учнів, нам потрібна фінансова підтримка. Ми розпочали кампанію, котра може стати [найбільшою освітньою краудфандинговою кампанією](http://code.org/donate) в історії. На кожен долар пожертви [партнери](http://code.org/about/donors) Code.org додадуть ще один, подвоюючи Ваш вклад.

## 4. Попросіть про участь свою адміністрацію

[Відправте цього листа](/resources#email) своєму керівникові чи директору. Або [передайте їм роздруківку](/resources/hoc-one-pager.pdf).

## 5. Сприяйте Годині коду у свій спільноті

Залучайте місцеву спільноту - клуб пластунів, церкву, університет, ветеранський клуб чи профспілку. Або проведіть вечірку Години коду для своїх сусідів.

## 6. Зверніться до місцевих депутатів по підтримку Години коду

[Надішліть цього листа](/resources#politicians) своєму мерові, міській або шкільній раді. Або [передайте їм цю роздруківку](/resources/hoc-one-pager.pdf) і запросіть відвідати вашу школу.

<%= view 'popup_window.js' %>