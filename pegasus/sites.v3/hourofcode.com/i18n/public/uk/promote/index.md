---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Як взяти участь

## 1. Sign up to host an Hour of Code

Anyone, anywhere can host an Hour of Code. [Sign up](<%= resolve_url('/') %>) to receive updates and qualify for prizes.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Поширюйте інформацію

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Попросіть про участь свою адміністрацію

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 5. Promote Hour of Code in your community

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 6. Зверніться до місцевих депутатів по підтримку Години коду

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>