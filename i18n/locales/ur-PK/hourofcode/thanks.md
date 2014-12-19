* * *

عنوان: ایک گھنٹہ کوڈ کی میزبانی کرنے لئے شکریہ! ترتیب: وسیع

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

ٹویٹر = = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# ایک گھنٹے کے کوڈ کی میزبانی کے لئے شکریہ!

**ہر** کوڈ تراشہ تنظیم کار کی گھڑی 10 GB ڈروپبون جگہ یا اسکائپ کریڈٹ 10 ڈالر شکریہ کے طور پر وصول کریں گے. [ تفصیلات](<%= hoc_uri('/prizes') %>)

## 1. دوسروں تک بھجیں

اپنے دوستوں کو #HourOfCode کے بارے میں بتائیں ۔

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. آپنے پورے اسکول کو ایک گھنٹے کے کوڈ کی پیشکش دیں۔

[ یہ ای میل ارسال کرہں](<%= hoc_uri('/resources#email') %>) یا اپنے پرنسپل کو [یہ ہینڈ آؤٹ](/resources/hoc-one-pager.pdf) دیں ۔

<% else %>

## 2. آپنے پورے اسکول کو ایک گھنٹے کے کوڈ کی پیشکش دیں۔

[ یہ ای میل ارسال](<%= hoc_uri('/resources#email') %>) یا دیں [یہ ہینڈ آؤٹ](/resources/hoc-one-pager.pdf) یہ ہینڈ آؤٹ </a> اپنے پرنسپل کو دیں ۔

<% end %>

## 3 ۔ ادار عطیہ دیں

[ ہمارے کراوڈفنڈڈ کے مہم کو عطیہ دیں.](http://<%= codeorg_url() %>/donate) تاکہ آپ ھماری 100 ملین بچوں کو پڑھانے میں ھماری مدد کرسکیں۔ ہم نے ابھی تاریخ کے [ سب سے بڑے تعلیمی کراوڈفنڈڈ کی مہم](http://<%= codeorg_url() %>/donate)کا آغاز کیا ھے۔ *ہر* ڈالر مشابہ ہو [ عطیہ دہندگان](http://<%= codeorg_url() %>/متعلق/عطیہ دہندگان)، آپ کے اثرات کو دگنا کرنے کے لئے.

## 4. اپنے ایمپلائر کو ملوث/شامل ہونے کے لئے پوچھیں/کہے۔

[ یہ ای میل بھیجیں](<%= hoc_uri('/resources#email') %>) آپنے منیجر، یا CEO ۔ یا [انہیں یہ ہینڈ آؤٹ دیں](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. آپنی کمیونٹی میں کوڈ کی گھڑی کو فروغ دیں۔

ایک مقامی گروپ کو بھرتی کرنا — لڑکا/لڑکی اسکاؤٹس کلب، چرچ، یونیورسٹی، ویٹرنز گروپ یا مزدور یونین ۔ یا ایک گھنٹہ کا کوڈ "بلاک پارٹی" اپنے محلے میں کروئیں۔

## 6. کوڈ کی گھڑی کی حمایت کرنے کے لئے ایک مقامی منتخب اہلکار سے کہیں/پوچھیں۔

آپنے میئر، سٹی کونسل یا اسکول بورڈ کو [ یہ ای میل بھیجیں](<%= hoc_uri('/resources#politicians') %>)۔ یا [انہیں یہ ہینڈ آؤٹ دیں](http://hourofcode.com/resources/hoc-one-pager.pdf) اور انہیں اپنے سکول کا دورہ کرنے کی دعوت دیں۔

<%= view 'popup_window.js' %>