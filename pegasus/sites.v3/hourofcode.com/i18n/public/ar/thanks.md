<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# شكراً لمشاركتك في استضافة حدث "ساعة البرمجة"!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## انشر الكلمة

اخبر أصدقائك عن #ساعة_من_الكود_البرمجي.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## اطلب من مدرستك كلها أن تشارك في حدث "ساعة من الكود البرمجي"

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3.أطلب من مشغلك/صاحب العمل الخاص بك أن يشارك في هدا الحدث

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. شجع و روج حدث "ساعة من الكود البرمجي" في المجتمع

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. أطلب من مسؤول محلي لدعم حدث "ساعة من الكود البرمجي"

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>