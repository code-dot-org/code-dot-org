* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# 안내 및 유용한 통계자료들

## 이 짧은 안내 문구를 각종 뉴스레터에 사용하세요.

### 여러분의 학교에 컴퓨터과학(정보과학) 수업을 가져가 보세요. Hour of Code 로 시작하면 됩니다.

컴퓨터는 모든 곳에 있지만, 10년전 보다도 더 적은 학교들에서만 컴퓨터과학(정보과학)을 교육합니다. 그래도 좋은 소식은, 이제 우리가 이러한 상황을 바꾸어가고 있다는 것입니다. 작년에 [Hour of Code](%= resolve_url('/') %) 에 대해서 들어보셨다면, 처음 시작되었던 이유들을 들어보셨을 것입니다. Hour of Code 첫 해에만, 1천5백만 학생들이 컴퓨터과학(정보과학) 을 알게 되었습니다. 작년에는 그런 학생들이 6천 만명이나 되었답니다! [Hour of Code](%= resolve_url('/') %)는 컴퓨터과학(정보과학) 에 대한 1시간짜리 소개 과정으로서, 코드에 대해서 쉽게 설명하고 누구나 그 기초/개념/원리들을 쉽게 배울 수 있다는 것을 보여줄 수 있도록 설계되었습니다. 이번 컴퓨터과학교육주간(Computer Science Education Week) 의 <%= campaign_date('full') %> 기간에 Hour of Code 행사 운영을 [등록해 주세요.](%= resolve_url('/') %) 여러분의 학교를 지도에 추가 하려면 https://hourofcode.com/ 를 방문해주세요.<%= @country %>

## 인포그래픽스

<%= view :stats_carousel %>

<%= view :signup_button %>