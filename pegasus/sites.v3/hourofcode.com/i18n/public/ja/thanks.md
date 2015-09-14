<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Hour of Codeのイベント主催への登録にご協力頂き大変ありがとうございます！

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. みんなに広めましょう

友達に #HourOfCodeを教えましょう。

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. 雇用主にも参加するよう聞いてみてください。

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. あなたのコミュニティーにもHour of Codeを宣伝しましょう。

ボーイスカウト/ガールスカウト、教会、大学、退役軍人のグループ、労働組合など地域のグループにも募集をかけます。もしくは、近所でHour of Code地域の集いを主催してください。

## 5. 地元選出の議員にもHour of Codeのサポートをお願いしましょう

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>