* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

ٹویٹر = = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :signup_button %>

# ایک گھنٹے کے کوڈ کی میزبانی کے لئے شکریہ!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

ہم انعامات، نۓ اسباق اور دوسری دلچسپ معلومات کے تبادلے کے حوالے سے اکتوبر تا نومبر کے دوران رابطے کریں گے۔ تو ابھی آپ کیا کر سکتے ہیں؟

## 1. Sign up to host

Anyone, anywhere can host an Hour of Code. [Sign up](%= resolve_url('/') %) to recieve updates and qualify for prizes.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Spread the word

اپنے دوستوں کو #HourOfCode کے بارے میں بتائیں ۔

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code

[Send this email](%= resolve_url('/resources/promote#sample-emails') %) to your principal to encourage every classroom at your school to sign up.

## 4. Ask your employer to get involved

[Send this email](%= resolve_url('/resources/promote#sample-emails') %) to your manager or the CEO.

## 5. Promote Hour of Code within your community

[Recruit a local group](%= resolve_url('/resources/promote#sample-emails') %)— boy/girl scouts club, church, university, veterans group or labor union. یا اپنے پڑوس کے لئے آور آف کوڈ "بلاک پارٹی" کی میزبانی کریں۔

## 6. Ask a local elected official to support the Hour of Code

[Send this email](%= resolve_url('/resources/promote#sample-emails') %) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>

<%= view :signup_button %>