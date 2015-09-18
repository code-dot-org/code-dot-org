---

title: <%= hoc_s(:title_resources) %>
layout: wide

---

# Hour of Code Resources

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# Join Us

## 1. Sign up to host

Anyone, anywhere can host an Hour of Code. [Sign up](<%= resolve_url('/') %>) to recieve updates and qualify for prizes.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Spread the word

اخبر أصدقائك عن #ساعة_من_الكود_البرمجي.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your principal to encourage every classroom at your school to sign up.

## 4. Ask your employer to get involved

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your manager or the CEO.

## 5. Promote Hour of Code within your community

[Recruit a local group](<%= resolve_url('/resources/promote#sample-emails') %>)— boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>