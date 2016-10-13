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

# Дякуємо за реєстрацію заходу в межах Години коду!

Ви допомагаєте учням з усього світу зібратись для вивчення Години коду, яка може *змінити решту їхнього життя* протягом <%= campaign_date('full') %>. Ми нагадаємо про нові підручники та інші захоплюючі новини. А що зробити зараз?

## 1. Поширюйте інформацію

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Знайдіть місцевого волонтера для допомоги з проведенням заходу.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Запропонуйте взяти участь у Годині коду всій школі

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up.

## 4. Попросіть про участь свою адміністрацію

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 5. Поширюйтеу Годину коду у своїй спільноті

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 6. Зверніться до місцевих депутатів по підтримку Години коду

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

## 7. Сплануйте свою Годину коду

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>