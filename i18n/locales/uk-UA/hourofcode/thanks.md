* * *

title: Дякуємо за реєстрацію заходу Години коду! layout: wide

social: "og:title": "<%= hoc\_s(:meta\_tag\_og\_title) %>" "og:description": "<%= hoc\_s(:meta\_tag\_og\_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/srH1OEKB2LE"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc\_s(:meta\_tag\_twitter\_title) %>" "twitter:description": "<%= hoc\_s(:meta\_tag\_twitter\_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv\_load\_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc\_s(:twitter\_default\_text)} twitter[:hashtags] = 'HourOfCode' unless hoc\_s(:twitter\_default\_text).include? '#HourOfCode' %>

# Дякуємо за реєстрацію заходу в межах Години коду!

**КОЖЕН** організатор Години коду отримає 10 Гб простору на Dropbox або $10 кредиту в Skype в якості подяки. [Детальніше](/prizes)

<% if @country == 'us' %>

Залучайте [цілу школу](/us/prizes), щоб отримати шанс виграти цінні призи для свого закладу.

<% end %>

## 1. Поширюйте інформацію

Розкажіть друзям про Годину коду #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Розішліть цього листа](/resources#email) або [передайте роздруківку директору](/files/schools-handout.pdf). Як тільки зареєструєте школу, [отримайте шанс виграти техніки на $10,000](/prizes), і запросіть інші школи району.

<% else %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Розішліть цього листа](/resources#email) або передайте [роздруківку](/files/schools-handout.pdf) директору.

<% end %>

## 3. Попросіть про участь свою адміністрацію

[Надішліть цього листа](/resources#email) своїй адміністрації. Або [передайте їм роздруківку](/resources/hoc-one-pager.pdf).

## 4. Сприяйте Годині коду у свій спільноті

Залучайте місцеву спільноту - клуб пластунів, церкву, університет, ветеранський клуб чи профспілку. Або проведіть вечірку Години коду для своїх сусідів.

## 5. Зверніться до місцевих депутатів по підтримку Години коду

[Надішліть цього листа](/resources#politicians) своєму міському голові, міській або шкільній раді. Або [передайте їм роздруківку](/resources/hoc-one-pager.pdf) та запросіть відвідати Вашу школу.

<%= view 'popup_window.js' %>