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

# Hour of Code! 행사를 운영하는데 가입해 주셔서 감사합니다.

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>. 우리는 새로운 상품들, 새로운 튜토리얼들, 그 외 다른 멋진 업데이트들로 여러분들과 함께 할 것입니다. 지금 여러분들에게 필요한 것은?

## 1. 널리 알려주세요.

여러분들은 이제 막 Hour of Code 운동에 합류했습니다. 여러분들의 친구들에게 **#HourOfCode** 를 알려주세요.!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 2. 여러분 학교의 행사로 Hour of Code 를 열어달라고 요청하세요.

[교장선생님께 이 이메일을 보내서](<%= resolve_url('/promote/resources#sample-emails') %>) 학교의 모든 학급이 참여할 수 있도록 도전해보세요.

## 4. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

[이 이메일을](<%= resolve_url('/promote/resources#sample-emails') %>) 여러분 직장의 상사나 CEO에게 보내주세요.

## 5. Hour of Code를 여러분의 소속 단체나 커뮤니티에 홍보해 주세요.

[지역 단체를 모집하세요.](<%= resolve_url('/promote/resources#sample-emails') %>) 보이/걸 스카우드, 교회, 대학, 재향 군인 단체, 노동 조합 등등 그 이외 어떤 친구들도 좋습니다. 새로운 기술들을 배우기 위해서 학교에서만 있을 필요는 없습니다. 이 [포스터, 배너, 스티커, 동영상 등을](<%= resolve_url('/promote/resources') %>) 여러분의 이벤트에 활용해보세요.

## 6. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

지역대표, 시의회, 교육위원회, 교육청 등에 [이메일](<%= resolve_url('/promote/resources#sample-emails') %>)을 보내세요. 그리고 그들이 여러분 학교의 Hour of Code 행사를 방문할 수 있도록 초대하세요. 그렇게 하면 여러분 지역에서 한 시간의 Hour of Code 이후의 컴퓨터과학(정보과학) 수업이 이루어지는데 큰 도움이 될 수 있습니다.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>