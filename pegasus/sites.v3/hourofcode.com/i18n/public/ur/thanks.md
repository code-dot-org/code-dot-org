---
  title: <%= hoc_s(:title_signup_thanks) %>
  layout: wide
  nav: how_to_nav

  social:
    "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
    "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
    "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
    "og:image:width": 1440
    "og:image:height": 900
    "og:url": "http://<%=request.host%>"

    "twitter:card": player
    "twitter:site": "@codeorg"
    "twitter:url": "http://<%=request.host%>"
    "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
    "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
    "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  ---

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# آور-آف-کوڈ کو ھوسٹ کرنے کے لیے سائن-اَپ کرنے کا شکریہ!

آپ دنیا بھر کے تمام اسٹوڈینٹس کے لیے آور-آف-کوڈ کو سیکھنا ممکن بنا رہے ہیں جو کہ *ان کی باقی ماندہ تمام زندگی تبدیل کر دے گا* دوران، <%= ('campaign_date('full %> We'll be in touch about new tutorials and other exciting updates. اب آپ کیا کر سکتے ہیں؟

## 1. دوسروں تک بھجیں

آپ نے بالکل ابھی آور-آف-کوڈ کی مومنٹ (تحریک) جوئن کی ہے۔ اپنے دوستوں کو **#HourOfCode** کے بارے میں بتائیں۔!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3۔ اپنے تمام اسکول سے کہیں کہ وہ آور-آف-کوڈ کے پروگرام پیش کریں

[ یہ ای-میل بھیجیں](<%= resolve_url('/promote/resources#sample-emails') %>) اپنے پرنسپل کو اور اپنے اسکول میں ہر کلاس روم کے شوق کو بڑھانے کے لیے تاکہ وہ سائن-اَپ کریں۔

## 4. اپنے ایمپلائر کو ملوث/شامل ہونے کے لئے پوچھیں/کہے۔

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 5۔ اپنی کمیونٹی میں آور-آف-کوڈ کو پروموٹ کریں۔

[ مقامی گروپ کو بھرتی کریں](<%= resolve_url('/promote/resources#sample-emails') %>) — مثلاً بوائے/گرلز اسکاؤٹس کلب، چرچ، یونیورسٹی، ویٹرنز گروپ، لیبر یونین، یا پھر چند دوست۔ آپ کو نئی اسکلز سیکھنے کے لیے کسی اسکول میں ہونا ضروری نہیں۔ ان [ پوسٹرز، بینرز، اسٹیکرز، ویڈیوز اور مزید کچھ](<%= resolve_url('/promote/resources') %>) خود اپنے ایونٹ کے لیے استعمال کریں۔

## 6. کوڈ کی گھڑی کی حمایت کرنے کے لئے ایک مقامی منتخب اہلکار سے کہیں/پوچھیں۔

[ یہ ای-میل بھیجیں ](<%= resolve_url('/promote/resources#sample-emails') %>) اپنے مقامی نمائندگان کو، سٹی کونسل، یا اسکول بورڈ اور انہیں دعوت دیں کہ وہ آور-آف-کوڈ کے لیے آپ کے اسکول کا دورہ کرنے آئیں۔ یہ آپ کے علاقہ میں کمپیوٹر سائنس کے لیے سپورٹ بنانے میں ایک گھنٹہ سے بڑھ کر مددگار ہوگا۔

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>