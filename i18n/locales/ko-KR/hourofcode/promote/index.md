---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Get your community involved in the Hour of Code

## 1. 널리 알려주세요.

친구들에게 **#HourOfCode**을 소개해 봅시다

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 여러분 학교의 행사로 Hour of Code 를 열어달라고 요청하세요.

교장선생님께 [이 이메일을 보내서](%= resolve_url('/promote/resources#sample-emails') %) 학교의 모든 학급이 참여할 수 있도록 도전해보세요.

## 3. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

이 [이메일을](%= resolve_url('/promote/resources#sample-emails') %) 여러분 직장의 상사나 CEO에게 보내주세요.

## 4. Hour of Code를 소속 단체나 조직에 안내해 주세요.

[지역 단체를 모집하세요.](%= resolve_url('/promote/resources#sample-emails') %) 보이/걸 스카우드, 교회, 대학, 재향 군인 단체, 노동 조합 등등 그 이외 어떤 친구들도 좋습니다. 새로운 기술들을 배우기 위해서 학교에서만 있을 필요는 없습니다. 이 [포스터, 배너, 스티커, 동영상 등을](%= resolve_url('/promote/resources') %) 여러분의 이벤트에 활용해보세요.

## 5. 투표로 선출된 지역 의원들/공무원들에게 Hour of Code 행사 운영을 지원해달라고 요청하세요.

지역대표, 시의회, 교육위원회, 교육청 등에 [이메일](%= resolve_url('/promote/resources#sample-emails') %)을 보내세요. 그리고 그들이 여러분 학교의 Hour of Code 행사를 방문할 수 있도록 초대하세요. 그렇게 하면 여러분 지역에서 한 시간의 Hour of Code 이후의 컴퓨터과학(정보과학) 수업이 이루어지는데 큰 도움이 될 수 있습니다.

<%= view :signup_button %>