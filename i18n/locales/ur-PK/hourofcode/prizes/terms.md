* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# پرائزز – شرائط و ضوابط

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. فی آرگنائزیشن ایک ریڈمپشن (مختص) محدود کریں۔

ہر آرگنائزر کو آور-آف-کوڈ کے تحت دی ایمیزون ڈاٹ کام، آئی ٹیونز یا ونڈوز اسٹور کریڈٹ وصول کرنے کے لیے لازماً رجسٹر کرانا ہوگا۔ اگر آپ کا پورا اسکول آور-آف-کوڈ میں شرکت کر رہا ہے تو کوالیفائی کے لیے ہر ایجوکیٹر کو لازماً بطور انفرادی آرگنائزر رجسٹر کرانا ہوگا۔

Code.org آور-آف-کوڈ (7 تا 13 دسمبر) کے بعد آرگنائزر سے رابطہ کرے گا تاکہ دی ایمیزون ڈاٹ کام، آئی ٹیونز یا ونڈوز اسٹور کریڈٹ مختص کرانے کے لیے ہدایات فراہم کی جاسکیں۔

<% if @country == 'us' %>

## لیپ-ٹاپس کلاس-سیٹ (یا $10,000 کی دیگر ٹیکنالوجی):

پرائزز صرف US اور کینیڈا میں K-12 کلاسرومز کے لیے محدود ہیں۔ کوالیفائی کرنے کے لیے آپ کے پورے اسکول کو 16 نومبر 2015 تک لازماً آور-آف-کوڈ سے رجسٹر ہونا پڑے گا۔ ہر یو-ایس اسٹیٹ کا کوئی ایک اسکول کمپیوٹرز کا ایک کلاس-سیٹ وصول کرے گا۔ Code.org کے ونرز (فاتحین) کو منتخب اور مطلع بذریعہ ای-میل 1 دسمبر 2015 کو کرے گا۔

یہ واضح رہے، کہ یہ کوئی سویپ-اسٹیکس یا کانٹیسٹ نہیں ہے جو کہ نادر موقع پر مبنی ہو۔

1) اپلائی کرنے کے لیے کوئی فنانشیل اسٹیک یا رسک شامل نہیں۔ کوئی بھی اسکول یا کلاس روم بغیر کسی ادائیگی کے Code.org یا کسی بھی دیگر آرگنائزیشن کے تحت شرکت کرسکتی ہے۔

2) جیتنے والے صرف اُن اسکولز میں سے ہی منتخب ہوں گے جہاں کی تمام کلاس روم (یا اسکول) نے آور-آف-کوڈ میں حصہ لیا ہو، جس میں اسٹوڈینٹس اور ٹیچرز کی مجموعی مہارت کا ٹیسٹ شامل ہے۔

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat with a guest speaker:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>