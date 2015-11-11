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

# Thanks for signing up to host an Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>. We'll be in touch about prizes, new tutorials and other exciting updates. What can you do now?

## 1. Spread the word

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til skólastjórans og skoraðu á hvern bekk í skólanum að skrá sig. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. Ask your employer to get involved

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til yfirmanns þíns eða forstjóra.

## 4. Promote Hour of Code in your community

[Skráðu hóp í nágrenninu](<%= resolve_url('/promote/resources#sample-emails') %>)— skátaflokk, kirkjuhóp, háskóla, eldri borgara, stéttarfélag eða bara vinahóp. You don't have to be in school to learn new skills. Notaðu þessi [veggspjöld, borða, límmiða, myndbönd og fleira](<%= resolve_url('/promote/resources') %>) fyrir þinn eigin viðburð.

## 5. Ask a local elected official to support the Hour of Code

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til þingmanna, bæjarfulltrúa eða menntamálanefndar og bjóddu þeim að heimsækja skólann þinn á Klukkustund kóðunar. It can help build support for computer science in your area beyond one hour.

<%= view 'popup_window.js' %>