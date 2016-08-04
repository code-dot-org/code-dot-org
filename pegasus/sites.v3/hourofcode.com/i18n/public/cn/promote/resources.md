---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# 推广《编程一小时》

## 组织一次编程一小时？[请参阅操作指南](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## 在你的学校悬挂这些海报

<%= view :promote_posters %>

<a id="social"></a>

## 利用社交媒体发布

[![图片](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![图片](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![图片](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## 使用编程一小时标志来传播这个词

[![图片](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[下载高分辨率版本](http://images.code.org/share/hour-of-code-logo.zip)

**"编程一小时"是商标。我们不想要防止它被使用，但我们想要确保它符合几个限制:**

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". 坏例子：“试验ACME公司的编程一小时”。
  2. 用一个“TM”上标放在最显著的提到“编程一小时”的地方。包括网站和应用程序。
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. 不要将“编程一小时”用在应用程序名字中。

<a id="stickers"></a>

## 打印这些贴纸，给你的学生。

(贴纸直径1"，每张纸 63个)  
[![图片](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## 发送这些电子邮件帮助推广编程一小时

<a id="email"></a>

## 邀请你的学校，同事或朋友报名：

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. 好消息是，我们正在着手改变现状。 If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

和代码一小时一起，计算机科学已经登上谷歌，MSN，雅虎， 以及迪斯尼的主页。 Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

从http://hourofcode.com/ 开始<%= @country %>

<a id="media-pitch"></a>

## 邀请媒体出席你的活动：

**主题行：**本地学校加入到给一亿学生介绍计算机科学的任务

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. 好消息是，我们正在着手改变现状。

和代码一小时一起，计算机科学已经登上谷歌，MSN，雅虎， 以及迪斯尼。 Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

我写信邀请你参加我们的启动大会，并看到孩子们在[日期]开始参与这项活动。

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. 请加入我们。

**联系人：**[你的姓名]，[标题]，电话：（212）555-5555

**时间**[日期和你的活动时间]

**地点：**[地址及路线]

期待你的联系。

<a id="parents"></a>

## 告诉父母学校的活动：

亲爱的家长，

我们生活在一个被科技包围的世界。 And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## 邀请当地的政界人士出席你们学校的活动：

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]