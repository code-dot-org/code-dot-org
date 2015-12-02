---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## 在你的学校悬挂这些海报

<%= view :promote_posters %>

<a id="social"></a>

## 利用社交媒体发布

[![图片](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![图片](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![图片](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![图片](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![图片](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## 发送这些电子邮件帮助推广编程一小时

<a id="email"></a>

## 邀请你的学校，同事或朋友报名：

计算机无处不在，但是和10年前相比，教计算机科学的学校却更少了。 好消息是，我们正在着手改变现状。 If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! 以及迪斯尼。 Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

让这个活动传播出去，组织一场活动。邀请当地的学校报名，或者你自己尝试编程一小时--每个人都能从这项基础学习中获益。

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## 邀请媒体出席你的活动：

**Subject line:** Local school joins mission to introduce students to computer science

计算机无处不在，但是和十年前相比教这门课的学校却更少了。女孩和少数群体更是表现出严重稀缺。好消息是，我们正在着手改变这种状况。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! 以及迪斯尼。 Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

我写信邀请你参加我们的启动大会，并看到孩子们在[日期]开始参与这项活动。

编程一小时，由非营利的Code.org和超过100人组织，表明当今这一代的学生已经准备好学习能在21世纪取得成功的关键技能。 请加入我们。

**联系人：**[你的姓名]，[标题]，电话：（212）555-5555

**时间**[日期和你的活动时间]

**地点：**[地址及路线]

期待你的联系。

<a id="parents"></a>

## 告诉父母学校的活动：

亲爱的家长，

我们生活在一个被科技包围的世界。 我们知道，无论我们的学生成人后选择进入何种领域，他们的成功将越来越多地取决于如何理解科技所产生的作用。 但是我们中只有一小部分在学习计算机科学，学习他的学生比十年前更少。

这就是我们全校加入这项史上最大学习活动的原因：编程一小时，计算机科学教育周期间（十二月。 7-13). More than 100 million students worldwide have already tried an Hour of Code.

我们的编程一小时表明[学校名称]已经准备好教这门21世纪的基础技能。 为了继续把编程活动带给你的学生，我们要壮大编程一小时活动。 I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

这是一个改变未来教育的机会在[镇/城市名称]。

更多细节和宣传见http://hourofcode.com/<%= @country %>

尊敬的，

校长

<a id="politicians"></a>

## 邀请当地的政界人士出席你们学校的活动：

敬爱的[市长/州议员/议员/参议院 姓]：

你知道吗在当今经济形势下，学生毕业后从事计算机行业的人数多于计算机职位需求人数比率达到3比1？ 并且，计算机科学是现今*每个*工业的基础。 Yet most of schools don’t teach it. [学校名称]我们正在尝试改变现状。

这就是我们全校加入这项史上最大学习活动的原因：编程一小时，计算机科学教育周期间（十二月。 7-13). More than 100 million students worldwide have already tried an Hour of Code.

我正在写信邀请你加入我们的编程一小时活动并在开幕典礼上讲话。 我们的活动在[日期，时间，地点]开始，郑重声明[国家或城市名称]准备教给学生21世纪的关键技能。 我们希望确保我们的学生处于创造未来技术的最前沿 -- 而不只是消费它。

请联系我[电话号码或邮箱地址]，期待你的回应。

此致， [姓名]，[标题]

<%= view :signup_button %>