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

# Köszönjük hogy jelentkeztél a Kódolás Órájának megtartására!

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Spread the word in your school and community

Csatlakoztál az "Hour of Code" mozgalomhoz. Meséld el a barátaidnak a **#HourOfCode** hashtaget használva!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](<%= resolve_url('/promote/resources#sample-emails') %>) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Nem kell az iskolába járnod ahhoz, hogy új készségeket sajátíts el. Invite a local politician or policy maker to visit your school for the Hour of Code. Ez az egy óra képes növelni a számítástechnika oktatás támogatását a saját térségedben.

Használd ezeket a [posztereket, hírdetéssket, matricákat, videókat stb.](<%= resolve_url('/promote/resources') %>) a saját rendezvényeden.

## 2. Keress egy helyi önkéntest, hogy segítsen az esemény során.

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](<%= resolve_url('/how-to') %>).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>