---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Try the tutorials:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**모든 Hour of Code 튜토리얼들은:**

  * Require minimal prep-time for organizers
  * 학생 자신의 진도와 수준에 맞추어 자기주도 학습이 가능합니다.

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Test tutorials on student computers or devices.** Make sure they work properly (with sound and video).
  * **Preview the congrats page** to see what students will see when they finish. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Plan ahead based on your technology available

  * **Don't have enough devices?** Use [pair programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **통신 속도가 느리다면?** 교실 앞에서 비디오를 보여주면, 학생들 모두가 비디오를 다운로드 받으면서 보지 않아도 됩니다. 아니면, 오프라인용 언플러그드 활동을 활용해 보세요. 

## 4) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * 빌 게이츠(Bill Gates), 마크 주커버그(Mark Zuckerberg)와 NBA 농구 스타인 크리스 보쉬(Chris Bosh)의 원래 Code.org 소개 동영상이 있습니다.([ 1분 ](https://www.youtube.com/watch?v=qYZF6oIZtfc), [ 5분 ](https://www.youtube.com/watch?v=nKIu9yen5nc), [ 9분 ](https://www.youtube.com/watch?v=dU1xS07N-FA) 버전들이 있습니다.)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [오바마 대통령은 모든 학생들이 컴퓨터과학(정보과학)을 배울 수 있도록 도와달라고 요청하고 있습니다.](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% else %>

# 추가 리소스 출시 예정!

<% end %>

<%= view :signup_button %>