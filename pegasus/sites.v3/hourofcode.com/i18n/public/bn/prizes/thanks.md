---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<%= view :signup_button %>

# Thanks for signing up for a chance to win the $10,000 Hardware Prize

Your whole school is now entered to win a class-set of laptops (or $10,000 for other technology). We'll be reviewing your application and announcing the winners in December.

## ১. এই যুক্তশব্দকে ছড়িয়ে দাও

তোমার বন্ধুবান্ধবদের সাথে #HourOfCode নিয়ে কথা বলো।

## ২. তোমার বিদ্যালয় জুড়ে Hour of Code শেখাতে বলো

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your principal.

## ৩. তোমার উর্ধতন কর্মকর্তাকে এতে অংশ নেবার জন্য তাঁকে অবহিত করো

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your manager, or the CEO.

## ৪. তোমার সমাজে Hour of Code কে ছড়িয়ে দাও

জাগিয়ে তোলো স্থানীয় দল ও গোষ্ঠিকে — যেমন ছেলে/মেয়েদের স্কাউট ক্লাব, চার্চ, বিশ্ববিদ্যালয়, পুরনো কোনো সম্প্রদায় বা শ্রমিক সংগঠন। অথবা তোমার পাড়া-প্রতিবেশীর জন্য "block party" 'র মতো Hour of Code এর এক পার্টির আয়োজন করো। [Send this email](<%= resolve_url('/promote/resources#email') %>).

## ৫. স্থানীয় কোনো নির্বাচিত official কর্মকর্তাকে বলো যেন তারা Hour of Code কে সমর্থন করেন

[Send this email](<%= resolve_url('/promote/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school.

<%= view :signup_button %>