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

여러분들은 전세계의 학생들에게 Hour of Code를 배워보도록 함으로서 *학생들의 인생을 바꿀 수도 있는 것입니다*, 다음 기간 동안에 <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. 지금 여러분들에게 필요한 것은?

## 1. 널리 알려주세요.

여러분들은 이제 막 Hour of Code 운동에 합류했습니다. 여러분들의 친구들에게 **#HourOfCode** 를 알려주세요.!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 이벤트 행사를 도와줄 수 있는 지역 자원 봉사자 찾기

[자원 봉사자 지도](<%= resolve_url('https://code.org/volunteer/local') %>)를 통해, 여러분의 수업에 함께 참여하거나 원격 비디오 채팅으로 학생들에게 컴퓨터과학(정보과학)으로 가능한 것들에 대해서 이야기하면서, 학생들에게 꿈과 희망을 불어 넣어줄 수 있는 자원 봉사자들을 찾아보세요.

## 2. 학교 전체 행사로 Hour of Code 를 열어달라고 요청하세요.

교장선생님께 [이 이메일을 보내서](<%= resolve_url('/promote/resources#sample-emails') %>) 학교의 모든 학급이 참여할 수 있도록 도전해보세요.

## 4. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

이 [이메일을](<%= resolve_url('/promote/resources#sample-emails') %>) 여러분 직장의 상사나 CEO에게 보내주세요.

## 5. Hour of Code를 여러분의 소속 단체나 커뮤니티에 홍보해 주세요.

[지역 단체를 모집하세요.](<%= resolve_url('/promote/resources#sample-emails') %>) 보이/걸 스카우드, 교회, 대학, 재향 군인 단체, 노동 조합 등등 그 이외 어떤 친구들도 좋습니다. 새로운 기술들을 배우기 위해서 학교에서만 있을 필요는 없습니다. 이 [포스터, 배너, 스티커, 동영상 등을](<%= resolve_url('/promote/resources') %>) 여러분의 이벤트에 활용해보세요.

## 6. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

지역대표, 시의회, 교육위원회, 교육청 등에 [이메일](<%= resolve_url('/promote/resources#sample-emails') %>)을 보내세요. 그리고 그들이 여러분 학교의 Hour of Code 행사를 방문할 수 있도록 초대하세요. 그렇게 하면 여러분 지역에서 한 시간의 Hour of Code 이후의 컴퓨터과학(정보과학) 수업이 이루어지는데 큰 도움이 될 수 있습니다.

## 7. Hour of Code 를 계획하세요.

Hour of Code 활동을 선택한 후, 이 [how-to 가이드를](<%= resolve_url('/how-to') %>) 살펴보세요..

<%= view 'popup_window.js' %>