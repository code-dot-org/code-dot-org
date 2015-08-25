<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



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