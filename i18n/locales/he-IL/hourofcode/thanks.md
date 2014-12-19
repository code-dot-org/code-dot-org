* * *

כותרת: תודה על שנרשמתם לארח את "שעהשל קוד"! פריסה: רחב

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# תודה שנרשמת לארח את "שעה של קוד"!

**כל** מארגן של "שעה של קוד" יקבל 10 GB של שטח ב-Dropbox או 10 דולר לחשבון סקייפ, כאות תודה. [ פרטים](<%= hoc_uri('/prizes') %>)

## 1. הפיצו את השמועה

ספר לחבריך על #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. לשאול את בית הספר שלך להציע "שעה של קוד" לתלמידים

[ לשלוח מכתב זו](<%= hoc_uri('/resources#email') %>) או [עלון זה](/resources/hoc-one-pager.pdf) למנהל בית הספר שלך.

<% else %>

## 2. לשאול את בית הספר שלך להציע "שעה של קוד" לתלמידים

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. תרומה נדיבה

[ לתרום לקמפיין crowdfunding (מימון מונים) שלנו.](http://<%= codeorg_url() %>/donate)כדי ללמד את 100 מיליון הילדים , אנחנו צריכים את התמיכה שלך. אנחנו רק השקהנו<[ את ההקמפיין crowdfunding לצרכי חינוך](http://<%= codeorg_url() %>/donate) הגדול בהיסטוריה . *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. לבקש מהמעסיק שלך להיות מעורב

[ לשלוח את האימייל הזה](<%= hoc_uri('/resources#email') %>) אל המנהל שלך או המנכ''ל. או [תן לו את העלון](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. לקדם את "שעת של קוד" בתוך הקהילה שלך

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>