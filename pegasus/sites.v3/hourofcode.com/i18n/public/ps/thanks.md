<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# مننه، چې د کوډ ساعت د کوربونې لپاره مو ځان ثبت کړ!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## ۱. خبره خپره کړئ

ټول ملګري مو له #HourOfCode خبر کړئ.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## ۲. له ټول ښوونځي مو وغواړئ، چې د کوډ ساعت ترتيب کړي

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Ask your employer to get involved

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promote Hour of Code within your community

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Ask a local elected official to support the Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>