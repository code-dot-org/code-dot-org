---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# 推广《编程一小时》

## 组织一次编程一小时？[请参阅操作指南](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## 在你的学校悬挂这些海报

<%= view :promote_posters %>

<a id="social"></a>

## 利用社交媒体发布

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## 使用编程一小时标志来传播这个词

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[下载高分辨率版本](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. 凡引用“编程一小时”时，都不应该使用令别人误以为这是你自己的品牌的表述方式，而应该引用“编程一小时”为一场民间的运动。
    
    - 好例子：“在ACMECorp.com上参加编程一小时”。 
    - 坏例子：“试验ACME公司的编程一小时”。
2. 用一个“TM”上标放在最显著的提到“编程一小时”的地方。包括网站和应用程序。
3. 在页面（或页脚）加入以下文字内容，包括CSEdWeek和Code.org的网站链接：
    
    *编程一小时是一项由Computer Science Education Week[csedweek.org] 和Code.org[code.org] 发起的全国性倡议，旨在向百万计的学生介绍一个小时的计算机科学和计算机编程。*

4. 不要将“编程一小时”用在应用程序名字中。

<a id="stickers"></a>

## 打印这些贴纸，给你的学生。

（贴纸直径为2.54cm，63个一整张）  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## 发送这些电子邮件帮助推广编程一小时

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

计算机无所不在，它正改变着世界上的工业。 但只有不到一半的学校教授计算机科学。 Good news is, we’re on our way to change this! 如果你之前听说过编程一小时，你可能知道它创造了历史。 超过 1 亿学生尝试过编程一小时。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 超过100个机构加入一起支持这一项目的发展。 Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

帮助宣传，实际举办一场活动，邀请当地学校报名加入，或者自己尝试编程一小时-每个人都能从这项基础学习中获益。

从 http://hourofcode.com/ 开始<%= @country %>

<a id="media-pitch"></a>

### 邀请媒体出席你的活动：

**主题:** 本地学校加入让学生认识计算机科学的使命中来

计算机无处不在，正在改变着这个星球上每一行业，但我们只有不到一半的学校有在教授计算机科学。 计算机课堂上的女性和少数族裔学生严重偏少，在整个科技产业亦是如此。 好消息是，我们正在着手改变现状。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 超过100个机构加入一起支持这一项目的发展。 世界上的每个苹果商店都举办过编程一小时活动。 Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. 请加入我们。

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### 告诉家长关于您学校的活动：

**Subject line:** Our students are changing the future with an Hour of Code

亲爱的家长们：

我们生活在一个被科技包围的世界。 同时我们也知道我们的学生长大后无论选进入什么领域，他们取得成功的能力都将越来越多地取决于他们对于科技如何运作的理解。

但只有极小一部分人在学习科技是**如何**运作的，只有不到一半的学校在教授计算机科学。

这就是为什么在计算机科学教育期间(<%= campaign_date('full') %>)，我们整个学校都加入到这个史上最大规模的学习活动：编程一小时。 全世界已经有超过1亿名学生体验了编程一小时。

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. 为了持续带来更多的编程活动给同学们，我们希望把编程一小时可以办得更加盛大。 这里鼓励大家加入进来作为志愿者，在本地媒体宣传，社交平台上分享这个消息，并考虑在社区里举办更多编程一小时的活动。

这是一个改变[城市名称] 教育未来的机会。

详情，请参阅http://hourofcode.com/<%= @country %>，并协助传播这个信息。

诚挚问候，

您们的校长

<a id="politicians"></a>

### 邀请当地的政界人士出席你们学校的活动：

**Subject line:** Join our school as we change the future with an Hour of Code

尊敬的[姓氏 市长/省长/领导/代表]:

您知道在美国电脑工作的收入是排名第一的吗？ 全美国有超过500,000个电脑工作空缺，但去年只有42,969个计算机科学专业毕业生进入劳动力市场。

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

这就是为什么在计算机科学教育期间(<%= campaign_date('full') %>)，我们整个学校都加入到这个史上最大规模的学习活动：编程一小时。 全世界已经有超过1亿名学生体验了编程一小时。

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. 我们要确保我们的学生都能走在未来创新科技的前沿-而不只是享受它。

请联系我：[电话号码或邮箱地址]。期待您的回复。

诚挚问候，

[NAME], [TITLE]

<%= view :signup_button %>