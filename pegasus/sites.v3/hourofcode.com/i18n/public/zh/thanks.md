<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# 謝謝您報名舉辦Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1.廣為宣傳

告訴你的朋友關於 #HourOfCode 。

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2.要求你的整所學校都提供一小程式設計活動

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. 詢問你的上司是否想參予

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. 在你的社群宣傳一下Hour of Code

招募本地群組—男女童軍,教堂,大學,退伍軍人團體或勞工組織，或為你的鄰居舉辦一場Hour of Code“街區派對”活動。

## 5. 詢問當地的政府機構是否參予Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>