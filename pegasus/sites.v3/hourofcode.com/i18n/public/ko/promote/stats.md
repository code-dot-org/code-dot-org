---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# 안내 및 유용한 통계자료들

## 이 짧은 안내 문구를 각종 뉴스레터에 사용하세요.

### 여러분의 학교에 컴퓨터과학(정보과학) 수업을 가져가 보세요. Hour of Code 로 시작하면 됩니다.

컴퓨터는 모든 곳에 있지만, 10년전 보다도 더 적은 학교들에서만 컴퓨터과학(정보과학)을 교육합니다. 그래도 좋은 소식은, 이제 우리가 이러한 상황을 바꾸어가고 있다는 것입니다. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

