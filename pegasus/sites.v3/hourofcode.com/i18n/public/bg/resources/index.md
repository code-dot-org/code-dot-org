* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# Благодаря за регистрирането ви като домакин на Часът на кодрането събитие!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

Ние ще се свържем с вас за награди, нови уроци и други вълнуващи актуализации през есента. И така, какво можете да направите сега?

## Разпространете новината

Кажете на приятелите си за #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попитайте във вашето училище, дали се предлага участие в Часът на кодирането

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## Предложете на вашия работодател да се включи в инициативата

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## Рекламирайте "Час на Кодиране " във вашата Община

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5 Предложете на Общинската Администрация да подкрепи програмата "Един Час Програмиране"

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>