---
title: '<%= hoc_s(:title_how_to_companies) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# 如何将编程一小时带到您的公司

## 激发学生和志愿者服务编程一小时活动

Code.org 提供了一些机会，让你的员工去[联系 ](<%= resolve_url('https://code.org/volunteer') %>)当地的班级，开展编程一小时活动来让他们分享他们的职业教学经历并激励学生去学习计算机科学。

- [报名志愿者](<%= resolve_url('https://code.org/volunteer') %>)。
- 获取员工如何联系当地课堂的指导，请参阅我们的[合作伙伴指南](<%= localized_file('/files/hoc-corporate-toolkit.pdf') %>)。

## 其他方式可以支持 编程一小时 活动的方式：

- 请你的CEO[发送一封全体电邮](<%= resolve_url('/promote/resources#sample-emails') %>)强调计算机科学的重要性，并鼓励员工去传播这个信息。 
- 与同事一起尝试使用[教程](<%= resolve_url('/learn') %>)开展快乐的编程一小时活动。
- 请参阅以下的操作指南，在您的公司为当地的学生或公益伙伴组织一场编程一小时活动。

# How to host an Hour of Code event with students

## 1. 推广你的编程一小时活动

- 推广你的[编程一小时](<%= resolve_url('/promote') %>)活动，并鼓励他人举办。
- 鼓励您公司的软件工程师参观当地课堂，以便帮助引导他们开展编程一小时，并鼓励学生们学习计算机科学。 通过[报名](<%= resolve_url('https://code.org/volunteer/engineer') %>)，他们可以与当地的课堂取得联系。

## 2. 观看视频指导 <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 3. 选择一个活动

我们通过各种各样的合作者为所有年龄的参与者举办一场[丰富多彩的一小时活动](<%= resolve_url('/learn') %>)。 [点击这里试一试！](<%= resolve_url('/learn') %>)

**All Hour of Code activities** require minimal prep-time, and are self-guided - allowing participants to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 4. 您所需的教学设备——电脑不是必需的

要获得编程一小时活动的最佳体验，需要一台联网的电脑。 但是你**不一定需要电脑**才能做参与活动，没有电脑也可以参与编程一小时活动。

您需要做以下**准备工作**：

- Test activities on computers or devices. Make sure they work properly on browsers with sound and video.
- Provide headphones, or ask participants to bring their own, if the activity you choose works best with sound.
- **电脑不够？**采取[搭档合作编程](https://www.youtube.com/watch?v=vgkahOzFH2Q)的方式。 搭档合作可以让参与者互相帮助，减少对组织者的依赖。 他们将明白编程也是一种社交和协作。
- **Have low bandwidth?** Plan to show videos at the front of the event, so each participant isn't downloading their own videos. Or try the unplugged / offline activities.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring video

讨论计算机科学对我们生活的各个方面的影响，鼓舞参与者，启动编程一小时活动 分享更多关于那些激励你探索计算机科学和你在公司的角色。

**播放鼓舞人心的视频：**

- Code.org 推出比尔·盖茨，马克·扎克伯格，NBA球星克里斯·波什为主演的视频（它们的长度分别为[1分钟](https://www.youtube.com/watch?v=qYZF6oIZtfc)，[5分钟](https://www.youtube.com/watch?v=nKIu9yen5nc)，和[9分钟](https://www.youtube.com/watch?v=dU1xS07N-FA)。）
- [2013年编程一小时活动视频](https://www.youtube.com/watch?v=FC5FbmsH4fw)，或者 <% if @country == 'uk' %> [ 2015年编程一小时活动 视频](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [ 2015 年编程一小时活动视频](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
- [总统奥巴马号召所有学生学习计算机科学](https://www.youtube.com/watch?v=6XvmhE1J9PY)。
- 从[这里](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)寻找更多的励志视频。

**介绍给学生编程一小时活动的建议。**

- 用一些男孩子们和女孩子们都关心的问题来解释科技对我们生活的影响——拯救生命，帮助人类，与他人交流。 
- 如果您所在的是一家科技公司，可以演示您公司的有趣的， 创新的产品。
- 如果您不是一家科技公司，可以讨论您公司是如何使用技术来解决问题和完成目标的。
- 邀请您公司的软件工程师谈谈为什么他们决定学习计算机科学以及他们目前从事的项目。
- [这里](<%= resolve_url('https://code.org/girls') %>)是一些能让女孩对计算机科学感兴趣的小技巧。

## 6. 编程！

**在活动中指导参与者**

- 在白板上写下活动链接。你可以在[你选择的活动信息](<%= resolve_url('/learn') %>)参与人数的下方找到链接。
- 对于年龄更小的学生，提前将活动页加载或将其保存为书签。

**当参与者遇到困难时，你可以使用的回答：**

- "我也不知道。让我们一起来找到问题的答案吧"。
- “科学技术并不总是同我们期望的方式一样工作。”
- “学习编程就像是学习一门新的语言（事实上就是-我们一直都将学习编程称作学习编程语言，你现在学的这种叫Blocky?）；你不会马上就说得很流利。”

**如果某些学生完成得比较快可以怎样做？**

- 他们可以尝试 hourofcode.com/learn 中的另一个编程一小时活动
- 或者请他们帮助在编程一小时活动中遇到困难的朋友。

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7) 表扬

- 为参与者和学生们[打印证书](<%= resolve_url('https://code.org/certificates') %>)。
- [打印"我完成了编程一小时 ！](<%= resolve_url('/promote/resources#stickers') %>)贴纸。
- 为您的员工[预订定制T恤](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)。
- 在社交媒体上分享关于您的编程一小时活动的照片或视频。请使用 #HourOfCode 和 @codeorg，这样我们也可以突出显示您活动的成功 ！

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

<%= view :signup_button %>