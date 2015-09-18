* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# Hour of Codeのイベント主催への登録にご協力頂き大変ありがとうございます！

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. みんなに広めましょう

友達に #HourOfCodeを教えましょう。

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. 雇用主にも参加するよう聞いてみてください。

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 4. あなたのコミュニティーにもHour of Codeを宣伝しましょう。

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. 地元選出の議員にもHour of Codeのサポートをお願いしましょう

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>