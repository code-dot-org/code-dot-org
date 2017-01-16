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

# Hour of Code වැඩසටහනක් සංවිධානය කිරීම සඳහා ලියාපදිංචී වීම පිලිබඳ ඔබට ස්තුතියි!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. What can you do now?

## 1. හැමෝටම කියන්න

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. ඔබේ වැඩසටහනට උදව් කිරීමට ස්වෙඡාසේවකයින් සොයන්න.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. ඔබේ පාසලෙන් Hour of Code වැඩසටහනක් පැවැත්වීමට ඉල්ලුම් කරන්න

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up.

## 3. Hour of Code සඳහා සභාගීවීමට ඔබගේ සේවා ස්ථානයටත් කියන්න

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 4. ඔබේ ප්‍රජාව අතර Hour of Code පිළිබඳ ප්‍රචාරණය කරන්න

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 5. Hour of Code සඳහා සහය පලකිරීමට ඔබේ රටේ ඉහළ නිලධාරීන්ටත් කියන්න

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

## 7. ඔබේ Hour of Code වැඩසටහන සැලසුම් කරන්න

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

## 8. Hour of Code එකෙන් ඔබ්බට

Ready to go beyond an hour? Check out [our full courses and teacher resources](<%= resolve_url('https://code.org/teach')%>) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>