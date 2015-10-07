---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# どうやって協力すればいい？

## 1. Hour of Codeのイベントを開催

誰でも、どこでもHour of Codeのイベントは開催できます。[登録](<%= resolve_url('/') %>)して、最新の情報を入手しましょう。   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. 周囲の人に広める

友達に**#HourOfCode**を広める!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. 学校全体でHour of Codeを開催できるように働きかける

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. 働いている会社に働きかける

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 5. Hour of Codeを、周囲のコミュニティで広める

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. 新しいスキルを学ぶのに、学校にいる必要はありません。 Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 6. 議員に働きかける

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. これらの活動は、Hour of Codeの活動を超えてコンピュータサイエンスをあなたの地域の学校で盛んにするのを長期的に助けます。

<%= view :signup_button %>