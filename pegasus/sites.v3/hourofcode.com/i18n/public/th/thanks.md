<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Thanks for signing up to host an Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. เผยแพร่ต่อไป

บอกเพื่อนๆ ของคุณเกี่ยวกับ #ชั่วโมงแห่งCode

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. ชักชวนนายจ้างของคุณเข้ามามีส่วนร่วม

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. โปรโมท Hour of Code ในชุมชนของคุณ

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Ask a local elected official to support the Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>