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

**"Hour of Code"는 공식 상표입니다. 이 상표를 사용하는 것을 금지하지는 않지만, 몇 가지 제한 사항을 지켜주셔야 합니다:**

  1. 의류 등 각종 패션 제품에 사용되는 "Hour of Code"라는 브랜드 이름으로서 사용되서는 안되며, Hour of Code 운동에 대한 참조를 달아야 합니다. 좋은 예시: "Hour of Code™ 에 함께 참여해보세요. ACMECorp.com". 나쁜 예시: "ACME Corp 가 만든 Hour of Code를 해보세요".
  2. "Hour of Code"를 언급하는 경우, 웹사이트에 게제하거나, 앱/프로그램에 설명하는 경우에는 윗 첨자 "TM"를 눈에 띄게 표시해 주세요.
  3. 웹 페이지에 가능한 언어들을 포함시켜주세요.(아니면 아래쪽에 링크 포함) CSEdWeek 와 Code.org 웹사이트 링크를 포함시켜주세요:
    
    *" 'Hour of Code'는 1시간 짜리의 컴퓨터과학/컴퓨터프로그래밍 과정을 전세계 수천만명의 학생들에게 소개하고 경험할 수 있도록 하기 위해, 컴퓨터과학교육주간(Computer Science Education Week[csedweek.org]) 과 Code.org [code.org] 에 의해 조직/운영되는 전세계적인 운동입니다."*

  4. "Hour of Code"를 앱/프로그램 이름으로 사용하지 말아주세요.

<a id="stickers"></a>

## 이 스티커들을 인쇄해서 학생들에게 나누어 주세요.

(스티커들은 1인치 짜리가, 각 시트에 63개씩 있습니다.)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Hour of Code 행사를 홍보하고 부흥시키기 위해 이 이메일들을 보내주세요.

<a id="email"></a>

## 여러분의 학교, 직장, 친구들에게 함께해 보자고 이야기 해보세요:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. 그래도 좋은 소식은, 이제 우리가 이러한 상황을 바꾸어가고 있다는 것입니다. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Hour of Code는 구글, MSN, 야후 홈페이지에서 함께 진행되어왔습니다. 그리고 디즈니에도.. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

다음 링크에서 시작하면 됩니다. http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## 여러분의 이벤트 행사에 언론매체를 초대하세요.

**제목:** 우리 지역 학교가 학생들에게 컴퓨터과학(정보과학) 을 소개하기 위한 전세계적 캠페인에 참여합니다.

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. 그래도 좋은 소식은, 이제 우리가 이러한 상황을 바꾸어가고 있다는 것입니다.

Hour of Code는 구글, MSN, 야후 홈페이지에서 함께 진행되어왔습니다. 그리고 디즈니에도.. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

우리의 킥오프 과정에 여러분들을 초대하기 위해 글을 씁니다. [DATE] 에 학생들이 활동을 시작하는 것을 살펴봐주세요.

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. 우리와 함께 해주세요.

**연락처:** [YOUR NAME], [TITLE], 휴대폰: (212) 555-5555

**행사일:** [DATE and TIME of your event]

**장소:** [ADDRESS and DIRECTIONS]

여러분의 연락을 기다리겠습니다.

<a id="parents"></a>

## 부모님들에게 여러분의 학교 이벤트에 대해서 이야기 해주세요.

친애하는 부모님들께,

우리는 컴퓨터과학기술에 둘러싸인 세상속에서 살아가고 있습니다. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## 교장 선생님의 학교 행사에 지역 정치인을 초대해주세요:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]