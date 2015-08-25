<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# ایک گھنٹے کے کوڈ کی میزبانی کے لئے شکریہ!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. دوسروں تک بھجیں

اپنے دوستوں کو #HourOfCode کے بارے میں بتائیں ۔

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. آپنے پورے اسکول کو ایک گھنٹے کے کوڈ کی پیشکش دیں۔

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. اپنے ایمپلائر کو ملوث/شامل ہونے کے لئے پوچھیں/کہے۔

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. آپنی کمیونٹی میں کوڈ کی گھڑی کو فروغ دیں۔

ایک مقامی گروپ کو بھرتی کرنا — لڑکا/لڑکی اسکاؤٹس کلب، چرچ، یونیورسٹی، ویٹرنز گروپ یا مزدور یونین ۔ یا ایک گھنٹہ کا کوڈ "بلاک پارٹی" اپنے محلے میں کروئیں۔

## 5. کوڈ کی گھڑی کی حمایت کرنے کے لئے ایک مقامی منتخب اہلکار سے کہیں/پوچھیں۔

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>