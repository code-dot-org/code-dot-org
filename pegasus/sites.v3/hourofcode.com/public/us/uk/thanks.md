---
title: Thanks for signing up to host an Hour of Code! 
layout: wide
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Дякуємо за реєстрацію заходу в межах Години коду!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details][1]

 [1]: /prizes

<% if @country == 'us' %>

Get your [whole school to participate][2] for a chance for big prizes for your entire school.

 [2]: /us/prizes

<% end %>

## 1. Поширюйте інформацію

Tell your friends about the #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Send this email][3] or [give this handout to your principal][4]. Once your school is on board, [enter to win $10,000 worth of technology for your school][1] and challenge other schools in your area to get on board.

 [3]: /resources#email
 [4]: /files/schools-handout.pdf

<% else %>

## 2. Запропонуйте взяти участь у Годині коду всій школі

[Send this email][3] or give [this handout][4] to your principal.

<% end %>

## 3. Попросіть про участь свою адміністрацію

[Send this email][3] to your manager, or the CEO. Or [give them this handout][5].

 [5]: /resources/hoc-one-pager.pdf

## 4. Сприяйте Годині коду у свій спільноті

Recruit a local group — boy scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Зверніться до місцевих депутатів по підтримку Години коду

[Send this email][3] to your mayor, city council, or school board. Or [give them this handout][5] and invite them to visit your school.

<%= view 'popup_window.js' %>