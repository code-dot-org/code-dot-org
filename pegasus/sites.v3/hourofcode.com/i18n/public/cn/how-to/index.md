---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# 如何讲授编程一小时

加入这一运动并运用下列步骤向一组学生介绍他们的第一次计算机科学一小时：

## 1) 观看指导视频 <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe> 

## 2） 选择一小时的教程︰

我们提供面向所有年龄学生的，由多家合作伙伴提供的多种的[有趣的一小时长的教程](<%= resolve_url('/learn') %>)。

**[学生自学的编程一小时教程：](<%= resolve_url('/learn') %>)**

  * 老师只需极少的准备时间
  * 可允许学生按照他们自己的进度和能力水平自学

**[老师引领的编程一小时教程：](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * 有教案，需要老师提前备课
  * 按照年级</em>和</0>科目（如数学，英语等）分类

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 1) 推广你的编程一小时

[使用这些工具](<%= resolve_url('/promote') %>) 推广您的编程一小时活动，并鼓励他人举办他们自己的活动。

## 4) 计划您所需的教学设备 — 这并不一定需要电脑

要获得编程一小时活动的最佳体验，需要一台联网的电脑。 但您**并不**需要给每一个孩子提供电脑，您甚至可以在没有电脑的情况下开展编程一小时活动。

您需要做以下**准备工作**：

  * 在学生的计算机或设备上测试教程。确保教程能够在浏览器里正常使用，并能播放视频和声音。
  * 如果想让教程有最好的音响效果，需要给班级提供耳机，或者让他们自带耳机。
  * **电脑不够？**采取[搭档合作编程](https://www.youtube.com/watch?v=vgkahOzFH2Q)的方式。 学生之间搭档之后，他们会互相帮助并减少对老师的依赖。 他们也将明白计算机科学是一种社交和协作。
  * **宽带较低？**可计划在全班面前进行视频演示，这样就不是每个学生都在各自下载视屏，或或尝试不插电/离线教程。

![](/images/fit-350/group_ipad.jpg)

## 5) 以一段鼓舞人心的演讲或者视频开始你的编程一小时

**邀请一位[本地的志愿者](https://code.org/volunteer/local)通过谈及计算机科学的深度来激励你的学生。**有数千位来自世界各地的志愿者已经准备好来帮助你开始你的编程一小时了。 [利用这份地图](https://code.org/volunteer/local)来寻找那些可以来到你的课堂或者参与与你的学生视频聊天的本地志愿者。

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**播放鼓舞人心的视频：**

  * Code.org推出的原始视频有比尔·盖茨，马克·扎克伯格和NBA球星克里斯 - 波什（它们分别为[1分钟](https://www.youtube.com/watch?v=qYZF6oIZtfc)，[5分钟](https://www.youtube.com/watch?v=nKIu9yen5nc)和[9分钟](https://www.youtube.com/watch?v=dU1xS07N-FA)版本）
  * [2013年编程一小时活动视频](https://www.youtube.com/watch?v=FC5FbmsH4fw)，或者 <% if @country == 'uk' %> [ 2015年编程一小时活动 视频](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [ 2015 年编程一小时活动视频](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [奥巴马总统号召所有对的学生学习计算机科学](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * 寻找更多的鼓舞人心的[资源](<%= resolve_url('https://code.org/inspire') %>)和[视频](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**如果你和你的学生都是第一次接触计算机科学也没关系。这里有一些主意来帮助你介绍你的编程一小时活动：**

  * 解释科技影响我们生活的方法，并加以男孩和女孩都会关心的实例 (谈及科技如何拯救生命，帮助他人，连接人们等等)。
  * 让全班一起来列出每天生活中用到编程的地方。
  * 让女孩子也对计算机科学产生兴趣的小贴示 [点击这里](<%= resolve_url('https://code.org/girls') %>).

**需要更多引导？**下载这份[课程计划模板](/files/EducatorHourofCodeLessonPlanOutline.docx).

**想要更多的教学点子？** 看看来自其他有经验的教育工作者的 [最佳实践](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) 。

## 6) 编程!

**指导学生参与活动**

  * 将教程的链接写在白板上。从[你所选择教程的信息](<%= resolve_url('/learn') %>)列表中的参与者人数下找到该链接。

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**当你的学生遇到困难时，你完全可以用这样的方式回答：**

  * "我也不知道。让我们一起来找到问题的答案吧"。
  * “科学技术并不总是同我们期望的方式一样工作。”
  * “学习编程就像是学习一门新的语言（事实上就是-我们一直都将学习编程称作学习编程语言，你现在学的这种叫Blocky?）；你不会马上就说得很流利。”

**[看看这些教学窍门](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**如果一个学生提前完成了怎么办？**

  * 学生可以看到所有的教程并在[hourofcode.com/learn](<%= resolve_url('/learn') %>)尝试另一个编程一小时活动
  * 或者可以让提早完成的学生去帮助那些在活动中遇到困难的同学。

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) 表扬

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * 为您的学生[打印证书](<%= resolve_url('https://code.org/certificates') %>) 。
  * 为你的学生[打印"我学过《编程一小时》!"](<%= resolve_url('/promote/resources#stickers') %>) 贴纸。
  * 为你的学校[预订定制T恤](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)。
  * 在社交媒体上分享关于您的编程一小时活动的照片或视频。请使用 #HourOfCode 和 @codeorg，这样我们也可以突出显示您活动的成功 ！

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 给教育工作者的其他编程一小时的资源

  * 使用此 [模板教案](/files/EducatorHourofCodeLessonPlanOutline.docx) 组织编程一小时。
  * 查看以往编程一小时教师的[最佳实践](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)。 
  * 观看我们 [教育工作者的编程一小时指导网络研讨会](https://youtu.be/EJeMeSW2-Mw) 的录像.
  * 我们的创始人，哈迪帕托维为编程一小时准备的[现场问答](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911)。
  * 访问[编程一小时教师论坛](http://forum.code.org/c/plc/hour-of-code)来从其他教育工作者那里获取建议、了解和支持。 <% if @country == 'us' %>
  * 阅读 [编程一小时常见问题](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)。 <% end %>

## 编程一小时之后做什么？

编程一小时只是学习技术的工作原理和创建软件应用旅程的第一步。继续这个旅程：

  * 鼓励学生继续 [在线学习](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [参加](<%= resolve_url('https://code.org/professional-development-workshops') %>) 1 天的面对面的研讨会，接受有经验的计算机科学推动者的指导。 （仅适用于美国学习者）

<%= view :signup_button %>