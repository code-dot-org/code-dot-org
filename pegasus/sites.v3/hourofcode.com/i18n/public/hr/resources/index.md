* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# Hvala na prijavi za domaćina Sata Kodiranja!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## Proširite riječ

Recite svojim prijateljima o #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Zatražite da cijela škola sudjeluje u Satu Kodiranja

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Zamolite svog poslodavca da sudjeluje

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 4. Promovirajte Sat Kodiranja u svojoj zajednici

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Zamolite mjesnog dužnosnika da podrži Sat Kodiranja

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>