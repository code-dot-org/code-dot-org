---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# قیامت کے دن اپنے کمیونٹی کو شامل کریں

## 1. دوسروں تک بھجیں

اپنے دوستوں کو ** #HourOfCode </ strong> کے بارے میں بتائیں!</p> 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. آپنے پورے اسکول کو ایک گھنٹے کے کوڈ کی پیشکش دیں۔

[ یہ ای-میل بھیجیں](<%= resolve_url('/promote/resources#sample-emails') %>) اپنے پرنسپل کو اور اپنے اسکول میں ہر کلاس روم کے شوق کو بڑھانے کے لیے تاکہ وہ سائن-اَپ کریں۔.

## 3. اپنے ایمپلائر کو ملوث/شامل ہونے کے لئے پوچھیں/کہے۔

اپنے مینیجر یا کمپنی کے سی ای او میں [ یہ ای میل بھیجیں ](٪= حل_ورل( '/ پیومیٹ / حوالہ جات#sample-emails') ٪).

## اپنی کمیونٹی میں کوڈ کے قیام کو فروغ دیں

[ مقامی گروپ کو بھرتی کریں](<%= resolve_url('/promote/resources#sample-emails') %>) — مثلاً بوائے/گرلز اسکاؤٹس کلب، چرچ، یونیورسٹی، ویٹرنز گروپ، لیبر یونین، یا پھر چند دوست۔. آپ کو نئی اسکلز سیکھنے کے لیے کسی اسکول میں ہونا ضروری نہیں۔. ان [ پوسٹرز، بینرز، اسٹیکرز، ویڈیوز اور مزید کچھ](<%= resolve_url('/promote/resources') %>) خود اپنے ایونٹ کے لیے استعمال کریں۔.

## 5. آور آف کوڈ کی حمایت کرنے کے لئے ایک مقامی منتخب اہلکار سے کہیں/پوچھیں۔

[ یہ ای-میل بھیجیں ](<%= resolve_url('/promote/resources#sample-emails') %>) اپنے مقامی نمائندگان کو، سٹی کونسل، یا اسکول بورڈ اور انہیں دعوت دیں کہ وہ آور-آف-کوڈ کے لیے آپ کے اسکول کا دورہ کرنے آئیں۔. یہ آپ کے علاقہ میں کمپیوٹر سائنس کے لیے سپورٹ بنانے میں ایک گھنٹہ سے بڑھ کر مددگار ہوگا۔

<%= view :signup_button %>