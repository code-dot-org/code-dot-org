---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# 1시간짜리 Hour of Code 교육 방법

이 운동에 참여 하시고, 학생 그룹의 첫번째 컴퓨터 과학 시간에 이 절차대로 소개해보세요.

## 1) 이 설명 동영상을 시청하십시오. <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) 튜토리얼을 선택하세요:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for students of all ages, created by a variety of partners.

**[학생 주도의 Hour of Code 튜토리얼들:](<%= resolve_url('/learn') %>)**

  * 선생님들이 수업을 준비하는데 필요한 시간이 매우 적습니다.
  * 학생 자신의 진도와 수준에 맞추어 자기주도 학습이 가능합니다.

**[선생님 주도의 Hour of Code 튜토리얼들:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * 일부 전문 교사들을 위해 필요한 수업 계획입니다.
  * 학년별로 *그리고* 주제별(수학, 국어, 등) 로 분류되어있습니다.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 3) 당신의 Hour of Code를 알려주세요.

[이 도구들을 이용하여](<%= resolve_url('/promote') %>) 여러분의 Hour of Code를 알리고 다른 친구들이 자신만의 이벤트를 진행할 수 있도록 응원해주세요.

## 4) 컴퓨터과학기술/기기 필요사항 계획하기 - 컴퓨터는 선택 사항입니다.

Hour of Code를 경험하기 위한 최고의 선택은 인터넷이 연결된 컴퓨터입니다. 하지만 모든 아이들이 컴퓨터가 필요한 것은 **아닙니다**, 그리고 Hour of Code는 컴퓨터 없이도 가능합니다.

**계획을 먼저 하세요!** 여러분의 이벤트를 시작하기 전에 다음 순서를 따르세요.

  * 학생의 컴퓨터에서 튜토리얼을 테스트합니다. 웹브라우저에서 소리와 영상이 적절하게 나오는지 확인하십시오.
  * 소리와 관련된 튜토리얼을 수월하게 하기 위해서 학생들에게 헤드폰을 제공하거나, 그들이 가지고 있는 헤드폰을 가져오도록 요청하셔도 좋습니다.
  * **충분한 장비가 없습니까?**[페어 프로그래밍 방법을](https://www.youtube.com/watch?v=vgkahOzFH2Q) 활용하세요. 학생들을 짝 지어주면, 선생님보다 서로 서로 도움을 주고 받을 수 있도록 할 수 있습니다. 그렇게 함으로서 컴퓨터과학(정보과학)은 사회적이며 협동적이다라는 것을 알게 될 수 있습니다.
  * **통신 속도가 느리다면?** 교실 앞에서 비디오를 보여주면, 학생들 모두가 비디오를 다운로드 받으면서 보지 않아도 됩니다. 아니면, 오프라인용 언플러그드 활동을 활용해 보세요. 

![](/images/fit-350/group_ipad.jpg)

## 5) 격려해줄 수 있는 발표자나 비디오로 Hour of Code를 마무리하세요

**[지역 자원봉사자들](https://code.org/volunteer/local)을 초대해서 학생들에게 컴퓨터과학의 폭넓은 가능성에 대해 이야기하면서 꿈과 희망을 심어줄 수 있도록 해주세요.** 전세계 수 천명의 자원봉사자들이 여러분의 Hour of Code 행사를 도와줄 것입니다. [이 지도를 사용해서](https://code.org/volunteer/local) 여러분의 수업에 함께 참여하거나 학생들과 온라인 비디오채팅을 할 수 있는 지역 자원봉사자들을 찾아보세요.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**영감을 주는 동영상을 보여주세요:**

  * 빌 게이츠(Bill Gates), 마크 주커버그(Mark Zuckerberg)와 NBA 농구 스타인 크리스 보쉬(Chris Bosh)의 원래 Code.org 소개 동영상이 있습니다.([ 1분 ](https://www.youtube.com/watch?v=qYZF6oIZtfc), [ 5분 ](https://www.youtube.com/watch?v=nKIu9yen5nc), [ 9분 ](https://www.youtube.com/watch?v=dU1xS07N-FA) 버전들이 있습니다.)
  * [2013 Hour of Code 동영상](https://www.youtube.com/watch?v=FC5FbmsH4fw) 또는 <% if @country == 'uk' %> [2015 Hour of Code 동영상](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [2015 Hour of Code 동영상](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [오바마 대통령은 모든 학생들이 컴퓨터과학(정보과학)을 배울 수 있도록 도와달라고 요청하고 있습니다.](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * 영감을 주는 더 많은 [자료](<%= resolve_url('https://code.org/inspire') %>)와 [비디오](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)를 찾아보세요.

**여러분과 여러분의 학생들이 컴퓨터과학에 완전한 초보라도 괜찮습니다. 여기에는 여러분을 Hour of Code 활동으로 안내하기 위한 몇가지 아이디어가 있습니다.**

  * 남학생, 여학생들 모두 관심을 가질만한 예를 가지고 기술이 우리의 삶에 영향을 미치는 방식에 대해 설명하세요. (생명을 살리고, 사람들을 돕고, 사람들을 연결하는 등등에 관해 이야기하세요)
  * 수업에서, 일상생활 속에서 코드를 사용하는 것들을 나열하세요.
  * 여학생들이 컴퓨터과학에 흥미를 갖도록 하기 위한 팁이 [여기](<%= resolve_url('https://code.org/girls') %>) 있습니다..

**더 많은 안내가 필요한가요?** [수업 계획 양식](/files/EducatorHourofCodeLessonPlanOutline.docx)을 다운로드하세요..

**좀 더 많은 지도 아이디어를 원하시나요?** 경험자 선생님들의 [최고의 좋은 활동사례 예시들을](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) 살펴보세요.

## 6) 코딩하기

**학생들에게 활동을 안내하세요.**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**여러분의 학생들이 어려운 상황을 만났을 때 이렇게 응답해 주면 좋습니다:**

  * "나도 잘 모른단다. 우리 함께 생각해 보자."
  * "컴퓨터과학(정보과학) 기술은 항상 우리가 원하는대로만 동작하지 않는단다."
  * "프로그램을 배우는 것은 새로운 언어를 배우는 것과 같아; 곧바로 능숙할 수는 없는 것이란다."

**[가르치는 팁들을 확인하세요](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**누군가 일찍 완료 했을 때는 어떻게 할까요?**

  * Students can see all tutorials and try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>)
  * 또는, 일찍 완료한 학생들에게 어려워서 잘 해결하지 못하고 있는 다른 학생들을 도와달라고 이야기 해보세요.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) 축하하기

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * 여러분의 학생들을 위해서 [인증서](<%= resolve_url('https://code.org/certificates') %>)를 인쇄하세요.
  * 여러분의 학생들을 위한 ["나는 Hour of Code를 해냈다!"라는 스티커를 인쇄하세요.](<%= resolve_url('/promote/resources#stickers') %>)
  * [행사 T-셔츠 주문](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) 하기.
  * 소셜 미디어에 여러분의 Hour of Code 이벤트 사진이나 동영상을 공유하세요. #HourOfCode 와 @codeorg를 이용하면 우리도 여러분의 성공을 강조할 수 있어요.

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 교육자를 위한 다른 Hour of Code 리소스들

  * 이 [수업계획 양식](/files/EducatorHourofCodeLessonPlanOutline.docx)을 사용하여 여러분의 Hour of Code를 구성하세요.
  * 여러분 이전에 Hour of Code를 진행하신 선생님들의 [모범 활동 사례](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)를 확인하세요. 
  * 다음 가이드를 살펴보세요. [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * Hour of Code 행사를 준비하기 위해, [라이브 Q&A에 참여해보세요.](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) Hour of Code 를 만든, Hadi Partovi 가 도와 줄 것입니다.
  * 다른 교육자들로부터 조언, 통찰력, 지원을 얻을 수 있는 [Hour of Code 교사 포럼](http://forum.code.org/c/plc/hour-of-code)을 방문하세요. <% if @country == 'us' %>
  * [Hour of Code의 FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)를 검토해보세요. <% end %>

## Hour of Code 이후에는 어떤 것들이 있나요?

Hour of Code 는 컴퓨터과학기술이 어떻게 동작하고, 응용프로그램(앱) 들을 어떻게 만들어 낼 수 있는지 배울 수 있는 긴 여행의 첫 번째 시작입니다. 이 여행을 계속하려면:

  * 학생들에게 다음 온라인 과정들을 살펴보고 참여하도록 해주세요. [온라인 학습과정들](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [참여해보세요](<%= resolve_url('https://code.org/professional-development-workshops') %>) 컴퓨터과학 전문가와 함께 여러가지들을 배울 수 있는 하루 짜리 워크숍들에 개인적으로 참여할 수 있습니다. (US educators only)

<%= view :signup_button %>