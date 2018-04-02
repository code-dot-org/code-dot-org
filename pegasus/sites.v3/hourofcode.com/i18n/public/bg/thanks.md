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

# Благодаря за регистрирането ви като домакин на Hour of Code събитие!

Като благодарност за подпомагане на учениците да започнат да учат компютърни науки бихме искали да ви дадем безплатен набор от професионално отпечатани плакати с участието на различни модели за подражание за класната стая. Използвайте код**FREEPOSTERS** за регистриране. (Забележка: трябва да покриете транспортните разходи.). Тъй като тези плакати се изпращат от Съединените щати, транспортните разходи може да са доста високи за Канада и в международен план. Ние разбираме, че това може да не е в бюджета ви, и ви препоръчваме да отпечатате [ PDF файлове](https://code.org/inspire) за класната стая.)   
<br /> [ <button>плакати</button>](https://store.code.org/products/code-org-posters-set-of-12) използвате кода FREEPOSTERS

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org will select the winning classrooms. In the meantime, check out some of the robotics and circuits activities. Please note that this is only open for US schools. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## Разпространете новината във вашата общност

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](<%= resolve_url('/promote/resources#sample-emails') %>) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Не е задължително да си в училище, за да придобиеш нови умения. Invite a local politician or policy maker to visit your school for the Hour of Code. Те може да помогнат за изграждане на подкрепа за компютърни науки във Вашия район и след Hour of Code.

Използвайте тези [ плакати, банери, стикери, видео клипове и др.](<%= resolve_url('/promote/resources') %>) за собственото си събитие.

## 2. Намерете местни доброволци да Ви помогнат с Вашето събитие.

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](<%= resolve_url('/how-to') %>).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>