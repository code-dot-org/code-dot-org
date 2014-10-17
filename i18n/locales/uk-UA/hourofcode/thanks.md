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

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Залучайте місцеву спільноту - клуб пластунів, церкву, університет, ветеранський клуб чи профспілку. Або проведіть вечірку Години коду для своїх сусідів.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>