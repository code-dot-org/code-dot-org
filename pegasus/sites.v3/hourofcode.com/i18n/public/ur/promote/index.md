---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# How to get involved

## 1۔ آور-آف-کوڈ کو ھوسٹ کرنے کے لیے سائن اپ کریں

کوئی بھی کہیں بھی ایک آور-آف-کوڈ ایونٹ کو ھوسٹ کرسکتا ہے۔  [ سائن-اَپ کریں](<%= resolve_url('/') %>) تاکہ اَپ ڈیٹس موصول کرسکیں اور پرائزز کے اہل ہوسکیں۔   
</p> 

[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2۔ اس بات کو عام کریں

** # آور-آف-کوڈ** کے بارے میں اپنے دوستوں کو بتائیں!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3۔ اپنے تمام اسکول سے کہیں کہ وہ آور-آف-کوڈ کے پروگرام پیش کریں

[ یہ ای-میل بھیجیں](<%= resolve_url('/promote/resources#sample-emails') %>) اپنے پرنسپل کو اور اپنے اسکول میں ہر کلاس روم کے شوق کو بڑھانے کے لیے تاکہ وہ سائن-اَپ کریں۔ <% if @country == 'us' %> یو-ایس اسٹیٹ (بشمول واشنگٹن ڈی سی) کی *ہر ایک* ریاست میں کوئی ایک لکی اسکول $10,000 مالیت کی ٹیکنالوجی جیت سکے گا۔ [ یہاں سائن-اَپ کریں](<%= resolve_url('/prizes/hardware-signup') %>) تاکہ اہل ہو سکیں اور [** گزشتہ سال کے وِنرز دیکھ سکیں**](http://codeorg.tumblr.com/post/104109522378/prize-winners)۔ <% end %>

## 4. اپنے ایمپلائر کو ملوث/شامل ہونے کے لئے پوچھیں/کہے۔

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 5۔ اپنی کمیونٹی میں آور-آف-کوڈ کو پروموٹ کریں۔

[ مقامی گروپ کو بھرتی کریں](<%= resolve_url('/promote/resources#sample-emails') %>) — مثلاً بوائے/گرلز اسکاؤٹس کلب، چرچ، یونیورسٹی، ویٹرنز گروپ، لیبر یونین، یا پھر چند دوست۔ آپ کو نئی اسکلز سیکھنے کے لیے کسی اسکول میں ہونا ضروری نہیں۔ ان [ پوسٹرز، بینرز، اسٹیکرز، ویڈیوز اور مزید کچھ](<%= resolve_url('/promote/resources') %>) خود اپنے ایونٹ کے لیے استعمال کریں۔

## 6. کوڈ کی گھڑی کی حمایت کرنے کے لئے ایک مقامی منتخب اہلکار سے کہیں/پوچھیں۔

[ یہ ای-میل بھیجیں ](<%= resolve_url('/promote/resources#sample-emails') %>) اپنے مقامی نمائندگان کو، سٹی کونسل، یا اسکول بورڈ اور انہیں دعوت دیں کہ وہ آور-آف-کوڈ کے لیے آپ کے اسکول کا دورہ کرنے آئیں۔ یہ آپ کے علاقہ میں کمپیوٹر سائنس کے لیے سپورٹ بنانے میں ایک گھنٹہ سے بڑھ کر مددگار ہوگا۔

