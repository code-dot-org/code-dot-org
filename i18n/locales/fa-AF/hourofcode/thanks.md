* * *

عنوان: با تشکر برای ورود به میزبان ساعت کد! طرح: گسترده

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# با تشکر برای ورود به میزباني ساعت کدنويسي!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. گسترش واژه

درباره #HourOfCode به دوستان خود بگویید.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. از کل مدرسه خود بخواهید که یک ساعت برنامه نویسی را پیشنهاد دهد

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. از کارفرمای خود بخواهید که مشارکت کند

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. ساعت کدنویسی را در جامعه ی خود ارتقا دهید

یک گروه محلی را به کار بگیری - گروه‌های دختر/پسر، کلیسا، دانشگاه، گروه‌های نظامی یا سازمان‌های کار. یا یک مهمانی بلوکی ساعت کد برای همسایه‌هایتان ترتیب دهید. 

## از یک مقام منتخب محلی بخواهید از ساعت کدنویسی حمایت کند

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>