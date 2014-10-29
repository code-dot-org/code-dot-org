<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Дякуємо за реєстрацію заходу в межах Години коду!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. Поширюйте інформацію

Розкажіть своїм друзям про #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>). Як тільки ваша школа зареєструється, вона [отримує шанс виграти техніку вартістю $10,000](/prizes) і кинути виклик іншим школам району.

<% else %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>) to your principal.

<% end %>

## 3. Зробіть пожертву

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Попросіть про участь свою адміністрацію

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Сприяйте Годині коду у свій спільноті

Залучайте місцеву спільноту - клуб пластунів, церкву, університет, ветеранський клуб чи профспілку. Або проведіть вечірку Години коду для своїх сусідів.

## 6. Зверніться до місцевих депутатів по підтримку Години коду

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>