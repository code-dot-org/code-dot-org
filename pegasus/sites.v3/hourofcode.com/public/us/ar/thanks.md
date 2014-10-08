---
title: Thanks for signing up to host an Hour of Code! 
layout: wide
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# شكراً لمشاركتك في استضافة حدث "ساعة من الكود البرمجي"!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](/prizes)

<% if @country == 'us' %>

Get your [whole school to participate](/us/prizes) for a chance for big prizes for your entire school.

<% end %>

## انشر الكلمة

Tell your friends about the #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## اطلب من مدرستك كلها أن تشارك في حدث "ساعة من الكود البرمجي"

[Send this email](/resources#email) or [give this handout to your principal](/files/schools-handout.pdf). Once your school is on board, [enter to win $10,000 worth of technology for your school](/prizes) and challenge other schools in your area to get on board.

<% else %>

## اطلب من مدرستك كلها أن تشارك في حدث "ساعة من الكود البرمجي"

[Send this email](/resources#email) or give [this handout](/files/schools-handout.pdf) to your principal.

<% end %>

## 3. اطلب من صاحب العمل أن يشارك

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 4. شجع و روج حدث "ساعة من الكود البرمجي" في المجتمع

Recruit a local group — boy scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. أطلب من مسؤول محلي لدعم حدث "ساعة من الكود البرمجي"

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>