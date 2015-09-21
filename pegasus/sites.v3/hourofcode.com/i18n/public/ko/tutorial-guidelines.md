---

title: <%= hoc_s(:title_tutorial_guidelines) %>
layout: wide

---

<%= view :signup_button %>

# Tutorial guidelines for the Hour of Code™ and Computer Science Education Week

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>).

우리는 다양하면서도 매력적인 활동들을 제공하고 싶습니다만, 가장 중요한 목표는 컴퓨터과학(정보과학)을 처음 배우게 되는 학생들과 선생님들의 학습경험과 효과를 최대화 하는 것입니다. 이 문서를 활용하세요. 코딩, 컴퓨터프로그래밍, 컴퓨터과학(정보과학)에 대해 전혀 알지 못하는 사람들을 대상으로하는 여러가지 활동들을 만들어내는 가이드로서 활용하면 됩니다.

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](http://goo.gl/forms/6GSklaO9Oa).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## 목차:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [최종적으로 완성되어 포함될 튜토리얼은 어떻게 평가 되는가?](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [활동을 설계하는데 도움이되는 제안사항들](#design)
  * [트레이드마크(상표) 가이드라인](#tm)
  * [트랙킹 픽셀(Tracking Pixel)](#pixel)
  * [자신이 만든 튜토리얼, CSEdWeek, Hour of Code 활성화하기](#promote)
  * [장애를 가진 학생을 위한 참고사항](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activites: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. 이상적으로는, 교재나 튜토리얼들이 프로그래밍 플랫폼/도구에 집약/모두 포함 되도록 함으로서, 튜토리얼과 프로그래밍 플랫폼/도구 창을 반복적으로 왔다갔다 하지 않도록 해야함.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Hour of Code 활동을 만들어내는 일반적 가이드라인들

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * 친구들 또는 온라인으로 함께 나누고 공유할 수 있는 새로운 것들을 만들어 낼 수 있도록 학생들을 격려해야한다.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**맨 위로**](#top)

<a id="inclusion"></a>

## 최종적으로 완성되어 포함될 튜토리얼은 어떻게 평가 되는가?

컴퓨터과학(정보과학) 교사 위원회는 더 많은 교사들로 부터 얻어진 통계를 포함한 결과들을 포함하는 질적/양적 평가 척도에 기준을 두고 제출된 내용들에 대해 순위를 메길 것입니다.

**다음과 같은 사항들을 포함하고 있는 튜토리얼들은 더 높은 평가를 받을 것입니다.:**

  * 질적으로 수준이 높은 것
  * designed for beginners - among students AND teachers
  * 1시간 이내의 활동으로 설계된 것
  * require no sign up
  * require no payment
  * require no installation
  * 모바일 기기와 태블릿을 포함한 많은 운영체제/장비에서 가능한 것
  * 많은 언어들로 제공되는 것
  * promote learning by all demographic groups (esp. under-represented groups)
  * 순수하게 HTML+CSS와 같은 웹 디자인에만 포커스를 맞추지 않을 것 - (우리의 목표는 컴퓨터과학(정보과학)이며, 단순한 HTML 코딩을 의미하는 것이 아닙니다.)

**다음과 같은 사항들을 포함하고 있는 튜토리얼들은 더 낮은 평가를 받을 것입니다.:**

  * 질적으로 수준이 낮은 것
  * 높은 수준의 학습자를 대상으로 하는 것(초보자를 위한 것이 아닌)
  * 다양한 운영체제/장비를 지원하지 못하는 것 - 웹을 기반으로 하는 경우 모든 웹브라우져에서 제대로 동작하도록 해야합니다.: IE9 이상 및 최신 버전의 Chrome, Firefox, Safari
  * 영어로만 가능한 것
  * reinforce stereotypes that hinder participation by under-represented student groups
  * 사용하는데 비용이 드는 학습 플랫폼의 구입을 강요하는 경우

**다음과 같은 튜토리얼들은 게시되지 않을 것입니다.:**

  * (대략적으로) 1시간 이내의 활동으로 설계되지 않은 경우
  * 별도의 회원가입을 필요로 가는 경우 
  * 비용을 요구하는 경우
  * require installation (other than mobile apps)
  * 오로지 HTML+CSS 웹 디자인에만 포커스를 맞추는 경우
  * 제출 기한을 넘겨서 제출하거나, 미완성(다음 참조)으로 제출하는 경우

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

궁극적으로, Hour of Code 행사와 캠페인의 목표는 학생들과 선생님들에 의해, 더 많이 컴퓨터과학(정보과학) 교육을 할 수 있도록 하는데 있으며, 컴퓨터과학(정보과학)은 누구나 쉽게 배울 수 있다는 것을 보여주기 위한 것이고, 많은 사람들이 생각하는 것보다 "더 쉽습니다." 이러한 목표는 처음 접하는 초보자를 위해 준비한 질 높은 선택사항들과 함께, 여러 가지 방법으로 학생들과 선생님들에게 보다 적은 시간으로 단순한 방법과 선택으로 쉽게 달성될 수 있습니다. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**맨 위로**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](http://goo.gl/forms/6GSklaO9Oa) and follow the steps to submit your tutorial.

**필요한 사항:**

  * 이름, 로고(jpt, png, etc.)
  * 특별한 활동에 관련된 화면캡쳐 또는 설명이미지의 URL 주소 설명이미지/화면캡쳐는 정확히 446x335 해상도이어야 함. 적합한 이미지가 제출되지 않으면, 튜토리얼 화면이 캡쳐되어 사용되던가 등록되지 않을 수 있음.
  * 로고에 링크될 URL 주소
  * 활동 이름
  * 활동에 링크될 URL 주소
  * 선생님들을 위한 추가 내용에 대한 URL 주소(선택사항, 자세한 내용은 아래 참조)
  * 활동에 대한 설명(PC 실행 화면과 모바일 기기 실행 화면) 
      * **PC 화면을 위한 최대 문자 개수:** 384
      * **모바일 화면을 위한 최대 문자 개수:** 74
      * 학생 자기주도적, 교사 지도형인지에 상관없이 상세한 설명을 포함시켜주세요. 추가적으로, 학교들은 Hour of Code 활동이 일반적인 기초 교육활동과 연관된 것인지, 새로운 과학교과 표준교육과정과 관련된 것인지에 대해 관심을 가지고 있습니다. 활동이 특정 표준교육과정과 관련되는 것이라면, 이러한 정보를 포함시켜주세요.
  * 테스트된/가능한 플랫폼들: 
      * Web based: Which platforms have you tested 
          * 운영체제 - Mac OS, Windows 버전
          * 웹 브라우져 - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS 모바일 Safari (모바일-최적화된)
          * Android Chrome (모바일-최적화된)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * 언플러그드 활동
  * 지원 언어 및 적합한 포맷: 
      * 튜토리얼들은 제공되는 언어에 따라 2문자의 언어 코드를 표시해야합니다. 예시 en-영어; ja-일본어
      * 추가적인 언어 속성은 대쉬(-)를 이용해 명시해 주세요. 예시 fr-be 벨기에에서 사용되는 프랑스어, fr-ca 캐나다에서 사용되는 프랑스어
      * ***참고사항: 언어 자동 선택은 튜토리얼을 제공하는 분이 작업해 주어야 합니다. 모든 사용자에게는 한가지 URL 주소만 제시됩니다.*** 
  * 온라인 튜토리얼을 제출하는 경우, [COPPA(Children's Online Privacy Protection Act)](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act)(역자 주: 온라인 아동 개인정보 보호 법률) 준수 여부를 알려주어야 합니다.
  * 사용자를 예상한 권장 학년/수준. 다음을 참고하세요. [미국 컴퓨터과학 교사 협의회 K-12 모델 교육과정(Computer Science Teachers’ Association’s K-12 Standards)](http://csta.acm.org/Curriculum/sub/K12Standards.html) 학년별 컴퓨터과학 기초/개념/원리. 예시 학년/수준: 
      * 초등학교: 유치원-2학년 또는 3학년-5학년
      * 중학교: 6학년-8학년
      * 고등학교: 9학년-12학년
      * 모든 연령
  * 학년 수준과 함께 권장되는 컴퓨터과학(정보과학) 수준도 포함시켜주세요: 초급, 중급, 고급 Hour of Code 웹사이트는 초보자를 위한 활동들을 가장 두드러지게 강조하여 보여줄 것입니다. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * 기술적 요구사항들: 
      * 참여상황을 보다 정확하게 추적할 수 있도록 모든 서드파티 튜토리얼 파트너들은 Hour of Code 튜토리얼의 첫페이지와 마지막 페이지에 1픽셀짜리 트랙킹 이미지들을 포함시켜줄 것을 당부합니다. 시작 픽셀이미지를 첫페이지에 삽입하고, 마지막페이지에 마지막 픽셀이미지를 삽입해주세요. 중간페이지에 픽셀이미지를 삽입하지 말아 주세요. 보다 자세한 사항들은 아래의 트랙킹 픽셀 부분을 살펴보세요. 
      * 튜토리얼의 과정을 모두 끝내고 나서 모든 사용자들은 다음의 URL 주소로 안내되어야 합니다. [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) where they will be able to: 
          * Hour of Code를 완료한 상황을 소셜네트워크로 공유할 수 있습니다.
          * Hour of Code 완료 인증서를 받을 수 있습니다.
          * Hour of Code 활동을 가장 많이 참여하는 순의 지역/도시 랭킹을 볼 수 있습니다.
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) as well. 
  * *(선택 사항)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * 온라인 활동과 관련하여(특히 스마트폰/태블릿 앱): 
          * 참여자 수
          * 테스크(미션) 완료 갯수
          * 평균 테스크(미션) 수행 시간
          * 모든 참여자가 작성한 코드 라인(줄) 갯수
          * 학습을 계속하는 참여자수(여러분의 사이트에서 모든 테스크를 완료하고 계속적으로 추가 테스크를 계속하는 사람의 인원 수)
      * 오프라인활동과 관련하여 
          * 인쇄 버전(가능한 경우)의 활동 자료 다운로드 횟수

[**맨 위로**](#top)

<a id="design"></a>

## 활동을 설계하는데 도움이되는 제안사항들

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Code.org 로고와 이름은 어떤 제약도 없이 사용될 수 있습니다. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**대부분의 학생들이 1시간 이내에 충분히 해결할 수 있도록 해주세요.** 준비한 과정을 빠른 시간에 완료하는 학생들을 위해 창의적으로 활동할 수 있는 오픈형 활동을 마지막에 배치하는 것도 고려해 주세요. 대부분의 아이들은 컴퓨터과학(정보과학)과 코딩을 전혀 모른다는 것을 생각해주세요.

**선생님용 설명을 포함해서** 대부분의 활동들은 학생들 스스로 자기주도적으로 가능해야합니다. 하지만 선생님의 도움이나 지도를 통해서 이루어지는 활동들에는, 반드시 선생님들을 위해 여러분의 활동에 대한 명확하고 간단한 지도사항/방법/내용을 별도의 URL 주소 형태로 함께 제공해 주세요. 대부분의 학생들이 초보자인것과 같이, 많은 선생님들도 별로 다르지 않습니다. 다음과 같은 정보를 포함시켜주세요:

  * 우리의 튜토리얼은 다음과 같은 플랫폼과 브라우져에서 가장 잘 동작합니다.
  * Does it work on smartphones? Tablets?
  * 짝지어 활동하는 페어프로그래밍 방법을 권장하나요? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**각 활동의 마지막에는 피드백 활동을 넣어주세요.**(예시: "10 레벨을 끝내고 반복실행을 배웠구나! 멋진데?")

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode" 또는 "나는 #CSEdWeek 의 행사활동으로 #HourofCode를 해보고 모두 성공했다. 여러분들도 해보셨나요? @Scratch?" **#HourOfCode** 해쉬 태그를 사용하세요.(대문자 H, O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**사회적으로 중요한 맥락으로 활동들을 설명하고 연관시켜주세요.** 세상을 좀더 좋게 변화시킬 수 있다는 것을 학생들이 인식하게 될 때 컴퓨터 프로그래밍은 매우 강력한 힘과 능력이 됩니다.

**학생들이 여러분이 만든 튜토리얼을 해보기 전에 별도의 회원가입이나 비용을 요구하지 마세요.** 별도의 회원 가입이나 비용을 필요로하는 활동들은 게시되지 않을 것입니다.

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * 드라이버(driver)는 마우스와 키보드 입력을 맏습니다.
  * 네비게이터(navigator)는 제안하고, 오류를 찾아내고, 질문을 합니다. 
  * 학생들은 하나의 세션 활동중에 적어도 2번 이상 역할을 바꾸어 활동해야 합니다.

페어프로그래밍의 장점:

  * 학생들이 선생님에게 의지하는 대신 서로 도울 수 있습니다.
  * 코딩은 혼자만의 활동이 아니라, 다른 사람들과의 사회적 교류 활동이라는 것을 보여줄 수 있습니다.
  * 교실이나 실험실에 학생 수에 맞는 컴퓨터를 갖추고 있지 않아도 활동이 가능합니다.

[**맨 위로**](#top)

<a id="tm"></a>

## 트레이드마크(상표) 가이드라인

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

이러한 내용의 목적은 "Hour of Code" 이름이 혼란스럽게 사용되는 것을 막고자 하는 것입니다. 우리와 함께하는 많은 튜토리얼 파트너들은 "Hour of Code"를 여러분의 웹 사이트에 사용해 왔습니다. 이러한 이름 사용을 제한하고 싶지는 않지만, 다음과 같은 몇가지 제한 사항은 지켜주길 바랍니다.

  1. 의류 등 각종 패션 제품에 사용되는 "Hour of Code"는 브랜드 이름으로서 사용되서는 안되며, Hour of Code 운동에 대한 참조를 달아야 합니다. Good example: "Participate in the Hour of Code™ at ACMECorp.com". 나쁜 예시: "ACME 회사의 Hour of Code를 사용해 보세요"
  2. "Hour of Code"를 언급하는 경우, 웹사이트에 게제하거나, 앱/프로그램에 설명하는 경우에는 윗 첨자 "TM"를 눈에 띄게 표시해 주세요.
  3. 알압로 수 있는 말로된 언어와 함께(혹은 페이지의 하단에), 다음과 같은 문구와 함께 CSEdWeek 와 Code.org 웹사이트의 URL 링크를 포함시켜주세요.
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. "Hour of Code"를 앱/프로그램 이름으로 사용하지 말아주세요.

[**맨 위로**](#top)

<a id="pixel"></a>

## 트랙킹 픽셀(Tracking Pixel)

참여 인원을 보다 정확하게 추적하기 위해 모든 서드파티 튜토리얼 파트너들은 1픽셀 크기의 트랙킹 이미지를 Hour of Code 튜토리얼의 가장 첫 페이지와 마지막 페이지에 삽입해 주시기 바랍니다.(첫 페이지와 마지막 페이지에 삽입되는 픽셀 이미지. 마지막 트랙킹 픽셀 이미지는 중간페이지에는 삽입하지 말아주세요).

이렇게 하면 Hour of Code 활동을 위해 여러분의 웹사이트로 직접 안내한 사람들이나, 선생님들이 적어준 URL 주소를 입력한 사람들의 인원수를 카운트할 수 있게 됩니다. 그렇게 하면 여러분의 튜토리얼이 얼마나 많은 사람들에게 도움이 되는지를 보다 정확한 참여 인원을 카운팅 할 수 있게 됩니다. 마지막 페이지에 두 개의 트랙킹 픽셀을 함께 삽입해도 튜토리얼을 완료한 비율을 카운팅 할 수 있습니다.

여러분의 튜토리얼이 승인되고 최종 튜토리얼 페이지에 포함이 된다면, Code.org 에서 유일한 트랙킹 픽셀 이미지를 여러분의 튜토리얼에 제공할 것입니다. 아래 내용을 살펴보세요.

참고: 설치 가능형 앱/응용프로그램(iOS/Android, PC)에는 별로 중요하지 않습니다.

앱 인벤터에 대한 예시 트랙킹 픽셀:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**맨 위로**](#top)

<a id="promote"></a>

## 자신이 만든 튜토리얼, CSEdWeek, Hour of Code 활성화하기

우리는 여러분의 1시간 튜토리얼을 많은 사람들이 해볼 수 있도록 안내할 것입니다. Please direct them to ***your*** Hour of Code page. 그 사람들을 위해 여러분의 튜토리얼에 대한 내용으로 메일을 보내주면 더욱 더 좋아할 것입니다. 컴퓨터과학교육주간(Computer Science Education Week)에 이루어지는 전세계적인 Hour of Code 캠페인을 통해, 많은 사람들을 초대하고 참여할 수 있도록 하여 1억명의 목표를 달성할 수 있도록 도와주세요.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * 소셜미디어, 일반 언론매체, 메일링 리스트 등을 통해 **#HourOfCode**(대문자 H, O, C) 해쉬코드를 이용해 Hour of Code 를 홍보해 주세요.
  * 지역 이벤트를 운영하거나, 여러분의 직장 상사나 대표에게 지역 학교 또는 커뮤니티에서 이멘트를 운영해 달라고 요청해 주세요. 
  * 더 많은 정보는 리소스 킷(예정)을 살펴보세요.

[**맨 위로**](#top)

<a id="disabilities"></a>

## 장애를 가진 학생들을 위한 추가 참고사항

시각 장애인을 위한 튜토리얼을 만들어주신다면, 잘 보이는 위치에 강조하여 배치하여 안내할 것입니다. 아직 그러한 튜토리얼을 받지는 못했지만, 그렇게 몸이 불편한 학생들을 위한 튜토리얼이 있으면 매우 좋을 것 같습니다.

[**맨 위로**](#top)

<%= view :signup_button %>