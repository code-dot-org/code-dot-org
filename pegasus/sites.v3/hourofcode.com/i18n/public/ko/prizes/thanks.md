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

## 1. 널리 알려주세요.

여러분의 친구들에게 #HourOfCode 를 이야기해 주세요.

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 열어달라고 요청하세요.

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your principal.

## 3. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your manager, or the CEO.

## 4. 여러분의 동료들과 Hour of Code를 함께 해 보세요.

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood. [Send this email](<%= resolve_url('/promote/resources#email') %>).

## 5. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

[Send this email](<%= resolve_url('/promote/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school.

<%= view :signup_button %>