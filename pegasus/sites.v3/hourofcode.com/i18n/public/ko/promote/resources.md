---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Hour of Code 를 홍보해주세요.

## Hour of Code 행사를 운영하시나요? [how-to 가이드를 살펴보세요.](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## 이 포스터들을 여러분의 학교에 게시해 주세요.

<%= view :promote_posters %>

<a id="social"></a>

## 이러한 내용들을 소셜미디어에 포스팅해주세요.

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## 이 Hour of Code 로고를 사용해 세상에 널리 알려주세요.

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[고해상도 버전들 다운로드](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. 의류 등 각종 패션 제품에 사용되는 "Hour of Code"는 브랜드 이름으로서 사용되서는 안되며, Hour of Code 운동에 대한 참조를 달아야 합니다. 좋은 예시: "ACMECorp.com 에서 Hour of Code 에 함께 참여하세요" Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. 알압로 수 있는 말로된 언어와 함께(혹은 페이지의 하단에), 다음과 같은 문구와 함께 CSEdWeek 와 Code.org 웹사이트의 URL 링크를 포함시켜주세요.
    
    *" 'Hour of Code'는 1시간 짜리의 컴퓨터과학/컴퓨터프로그래밍 과정을 전세계 수천만명의 학생들에게 소개하고 경험할 수 있도록 하기 위해, 컴퓨터과학교육주간(Computer Science Education Week[csedweek.org]) 과 Code.org [code.org] 에 의해 조직/운영되는 전세계적인 운동입니다."*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## 이 스티커들을 인쇄해서 학생들에게 나누어 주세요.

(스티커들은 1인치 짜리가, 각 시트에 63개씩 있습니다.)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Hour of Code 행사를 홍보하고 부흥시키기 위해 이 이메일들을 보내주세요.

<a id="email"></a>

## 여러분의 학교, 직장, 친구들에게 함께해 보자고 이야기 해보세요:

컴퓨터는 모든 곳에 있지만, 10년전 보다도 더 적은 학교들에서만 컴퓨터과학(정보과학)을 교육합니다. 그래도 좋은 소식은, 이제 우리가 이러한 상황을 바꾸어가고 있다는 것입니다. 여러분들이 Hour of Code 에 대해서 들어보셨다면, 만들어진 이유들을 들었을 수도 있습니다. 1억명 이상의 학생들이 Hour of Code 를 해보았습니다.

Hour of Code는 구글, MSN, 야후 홈페이지에서 함께 진행되어왔습니다. 그리고 디즈니에도.. 이러한 전세계적 운동을 지원하기 위해 전세계적으로 100개 이상의 기업과 사람들이 협력하였습니다. 작년에는, 전세계 모든 애플스토어에서도 Hour of Code가 운영되었으며 미국 오바마 대통령도 캠페인에 참여해서 코드를 작성했습니다.

올해에는, 함께 더 크게 해보고자 합니다. 2015 Hour of Code에 함께 동참해 주세요. 컴퓨터과학교육주간 동안에 Hour of Code 행사에 함께 참여해 주세요. <%= campaign_date('full') %>.

Hour of Code 를 널리 알려주시고, 이벤트를 조직/운영해주세요. 지역 학교들이 가입하고 함께 참여할 수 있게 해주세요. 또는 직접 해보세요 -- 누구나 쉽게 기초/개념/원리들을 배울 수 있습니다.

다음 링크에서 시작하면 됩니다. http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## 여러분의 이벤트 행사에 언론매체를 초대하세요.

**제목:** 우리 지역 학교가 학생들에게 컴퓨터과학(정보과학) 을 소개하기 위한 전세계적 캠페인에 참여합니다.

컴퓨터는 일상생활의 모든 곳에 있지만, 10년 전 보다도 더 적은 학교만이 컴퓨터과학(정보과학)을 가르치고 있습니다. 여학생들과 문화적 소외 계층들은 더 심각하게 배우지 못하고 있습니다. 하지만, 좋은 소식은 우리가 이러한 상황을 바꾸려고 하고 있다는 것입니다. 

Hour of Code는 구글, MSN, 야후 홈페이지에서 함께 진행되어왔습니다. 그리고 디즈니에도.. 이러한 전세계적 운동을 지원하기 위해 전세계적으로 100개 이상의 기업과 사람들이 협력하였습니다. 작년에는, 전세계 모든 애플스토어에서도 Hour of Code가 운영되었으며 미국 오바마 대통령도 캠페인에 참여해서 코드를 작성했습니다.

그러기 위해 [SCHOOL NAME] 학교의 [X number] 명의 학생들이 역사상 가장 큰 교육 이벤트에 참여합니다.: The Hour of Code. 12월7일~13일까지 진행됩니다.

우리의 킥오프 과정에 여러분들을 초대하기 위해 글을 씁니다. [DATE] 에 학생들이 활동을 시작하는 것을 살펴봐주세요.

100 개 이상의 조직들이 함께 비영리로 조직하고 운영하는 Hour of Code 는, 오늘날의 젋은 세대의 학생들에게 21세기에서 성공하기 위한 필요한 핵심 역량과 기술을 배울 수 있도록 준비시키는 핵심 목표를 가지고 있습니다. 우리와 함께 해주세요.

**연락처:** [YOUR NAME], [TITLE], 휴대폰: (212) 555-5555

**행사일:** [DATE and TIME of your event]

**장소:** [ADDRESS and DIRECTIONS]

여러분의 연락을 기다리겠습니다.

<a id="parents"></a>

## 부모님들에게 여러분의 학교 이벤트에 대해서 이야기 해주세요.

친애하는 부모님들께,

우리는 컴퓨터과학기술에 둘러싸인 세상속에서 살아가고 있습니다. 그리고 우리는 학생들이 자라나 어른이 되면서 어떤 진로와 분야를 선택하게 되던지, 현재와 같은 IT 기술들을 이해하고 활용할 수 있는 능력이 그 진로와 분야에서 성공할 수 있도록 하는데, 전적으로 달려있다는 것을 알고 있습니다. 하지만, 아주 극소수만 컴퓨터과학(정보과학)을 배우고 있고, 지난 10년 이전 보다도 더, 공부하는 학생들이 줄어들고 있습니다.

그렇기 때문에 우리의 모든 학교가 역사상 가장 큰 교육 이벤트에 참가해야하는 것입니다: Hour of Code 이벤트가 컴퓨터과학교육주간(Computer Science Education Week) 동안에 진행됩니다.(12월 7-13). 전세계 1억명 이상의 학생들이 이미 Hour of Code 를 경험해 보았습니다.

[SCHOOL NAME] 에서 준비중인 우리의 Hour of Code 는 21세기를 살아가기 위한 핵심 역량을 교육하고자하는 노력입니다. 우리 학생들에게 프로그래밍 활동들을 계속 할 수 있도록 하기 위해, Hour of Code 이벤트를 아주 크게 진행하고 싶습니다. 자원봉사, 지역 언론매체에 안내, 소셜미디어 서비스와 채널들에 소개해 주실 것들을 부탁드리며, 여러분이 속한 커뮤니티에서의 추가적인 Hour of Code 이벤트들을 열어주시면 좋겠습니다.

이것은 [TOWN/CITY NAME]에서 교육의 미래를 변화시킬 수 있는 좋은 기회입니다.

자세한 사항은 Http://hourofcode.com/<%= @country %>를 참고하세요. 그리고 전세계에 알리기 위해 도와주세요.

친애하는,

여러분의 교장선생님께

<a id="politicians"></a>

## 교장 선생님의 학교 행사에 지역 정치인을 초대해주세요:

친애하는 [시장/공무원/대표/의원] 님께:

오늘날의 경제에서 컴퓨팅과 관련된 일자리들이 졸업하는 학생들에 비해 3배나 더 많다는 것을 알고 계시나요? 그리고, 컴퓨터과학(정보과학)이 오늘날의 *모든* 산업의 기초라는 것을 알고 계신가요? 하지만 아직 대부분의 학교에서는 가르치지 않고 있습니다. [SCHOOL NAME] 에서, 우리는 이런 상황을 바꾸어보려고 합니다.

그렇기 때문에 우리의 모든 학교가 역사상 가장 큰 교육 이벤트에 참가해야하는 것입니다: Hour of Code 이벤트가 컴퓨터과학교육주간(Computer Science Education Week) 동안에 진행됩니다.(12월 7-13). 전세계 1억명 이상의 학생들이 이미 Hour of Code 를 경험해 보았습니다.

저는 여러분을 우리학교의 Hour of Code 이벤트 행사에 강연자로서, 행사시작을 알리는 연설을 부탁드리기 위해 이 글을 쓰게 되었습니다. 행사는 [DATE, TIME, PLACE] 과 같이 진행될 예정이고, [State or City name] 에서는 우리의 학생들에게 필요한 21세기의 핵심 능력과 기술들을 교육할 수 있도록 하는 중요한 발표를 할 예정입니다. 저희는 우리 학생들이, 지금처럼 소모만 하는 것이 아니라, 미래에 나타나게 될 컴퓨터과학기술들을 스스로 창조해내는 최첨단의 위치에 서게 하고 싶습니다.

[전화번호 또는 이메일주소] 로 연락을 부탁드리겠습니다. 여러분의 연락과 도움을 기다리겠습니다.

진심을 담아, [NAME], [TITLE]

<%= view :signup_button %>