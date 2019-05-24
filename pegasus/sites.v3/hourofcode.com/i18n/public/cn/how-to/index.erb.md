---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### 参与活动，并用下面的步骤向学生们介绍他们第一个小时的计算机科学。 编程一小时的课程哪怕是对初学者来说都非常容易上手！ 如果需要额外帮助的话，您可以通过[寻找本地志愿者](<%= codeorg_url('/volunteer/local') %>)来开展“编程一小时”课程。

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. 观看指导视频 <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. 选择教程

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. 推广您的编程一小时活动

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. 您所需的教学设备——电脑不是必需的

要获得编程一小时活动的最佳体验，需要一台联网的电脑。 但您**并不**需要给每一个孩子提供电脑，您甚至可以在没有电脑的情况下开展编程一小时课程活动。

在学生计算机或设备上测试这些指南，确保它们在播放器上的声音和视频能够正常运作。 **担心网速不好？** 可以在课程一开始就集中播放全部视频，这样学生就无需自行下载这些视频资料了。 也可采用线下离线的教学指南内容开展授课活动。

如果教程包含音频，那么应提前准备耳机，或者让学生自带耳机。

**电脑不够？**采取[搭档合作编程](https://www.youtube.com/watch?v=vgkahOzFH2Q)的方式。 学生之间搭档之后，他们会互相帮助并减少对老师的依赖。 他们将明白编程也是一种社交和协作。

<img src="/images/fit-350/group_ipad.jpg" />

## 5）以一段激励演讲或视频来开始编程一小时活动

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**播放鼓舞人心的视频：**

- 正版的 Code.org 推出包括比尔盖茨、马克·扎克伯格和 NBA 球星克里斯. 波什的视频。 （有[1 分钟的](https://www.youtube.com/watch?v=qYZF6oIZtfc)，[5 分钟的](https://www.youtube.com/watch?v=nKIu9yen5nc)和[9 分钟的](https://www.youtube.com/watch?v=dU1xS07N-FA)）
- 找到更多鼓舞人心的 [资源](<%= codeorg_url('/inspire') %>) 和[视频](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)。

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- 通过男孩和女孩们都关心的例子，介绍科技如何影响我们的生活（比如拯救生命，帮助人们，连接人们等）
- 让全班一起来列出每天生活中用到编程的地方。
- 帮助女孩对计算机科学感兴趣的小贴士见[这里](<%= codeorg_url('/girls')%>)。

## 6. 编程！

**Direct students to the activity**

- 把教学指南的链接写在白板上。在参加人员数量下面可以找到[你选择的指南链接](<%= resolve_url('/learn')%>)。

**When your students come across difficulties it's okay to respond:**

- "我也不知道。让我们一起来找到问题的答案吧"。
- “科学技术并不总是同我们期望的方式一样工作。”
- “学习编程就像是学习一门新的语言（事实上就是-我们一直都将学习编程称作学习编程语言，你现在学的这种叫Blocky?）；你不会马上就说得很流利。”

**What if a student finishes early?**

- 学生可以看所有的课程指南和[尝试另一个编程一小时的内容](<%= resolve_url('/learn')%>)
- 或者可以让提早完成的学生去帮助那些在活动中遇到困难的同学。

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. 庆祝

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- 为您的学生[打印证书](<%= resolve_url('https://code. org/certificates') %>) 。
- 为你的学生[打印"我学过《编程一小时》!"](<%= resolve_url('/promote/resources#stickers') %>) 贴纸。
- 为你的学校[预订定制T恤](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)。
- 在社交媒体上分享关于您的编程一小时活动的照片或视频。请使用 #HourOfCode 和 @codeorg，这样我们也可以突出显示您活动的成功 ！

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 给教育工作者的其他编程一小时的资源

- 访问[编程一小时教师论坛](http://forum.code.org/c/plc/hour-of-code)来从其他教育工作者那里获取建议、了解和支持。 <% if @country == 'us' %>
- 阅读 [编程一小时常见问题](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)。 <% end %>

## 编程一小时之后该做什么？

编程一小时只是学习技术的工作原理和创建软件应用旅程的第一步。继续这个旅程：

- 鼓励学生[在线学习](<%= codeorg_url('/learn/beyond')%>)
- [参加](<%= codeorg_url('/professional-development-workshops') %>) 1 天的面对面的研讨会，接受有经验的计算机科学推动者的指导。（仅美国教育者）

<%= view :signup_button %>