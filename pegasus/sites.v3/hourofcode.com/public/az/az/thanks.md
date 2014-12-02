<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# "Kod Saatı" təşkili üçün qeydiyyatınıza görə təşəkkür edirik!

**HƏR BİR** "Kod Saatı" təşkilatçısı təşəkkür olaraq 10 QB-lıq Dropbox yeri və ya $10 Skype balansı qazanacaq. [Ətraflı](<%= hoc_uri('/prizes') %>)

## 1. Hamıya xəbər ver

Dostlarınıza #KodSaatı haqqında danışın.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Məktəbinizdən "Kod Saatı" təşkil etməsini istəyin

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## 2. Məktəbinizdən "Kod Saatı" təşkil etməsini istəyin

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. İanə verin

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Müdirinizdən iştirak etməsini istəyin

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. "Kod Saatı"-nı öz ətrafınızda təbliğ edin

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Yerli vəzifəli şəxslərdən "Kod Saatı"-nı dəstəkləmələrini istəyin

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>