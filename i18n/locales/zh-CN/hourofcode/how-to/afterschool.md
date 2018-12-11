---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# 如何在课后及兴趣班中讲授编程一小时

### 参与活动，并用下面的步骤向学生们介绍他们第一个小时的计算机科学。 编程一小时的课程哪怕是对初学者来说都非常容易上手！ 如果你需要额外的帮助，你可以寻找[本地志愿者](%= codeorg_url('/volunteer/local') %)来协助开展课后“编程一小时”。

* * *

## 1. 观看指导视频 <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. 请选择一个教程

We provide a variety of [fun, hour-long tutorials](%= resolve_url('/learn') %) for participants all ages, created by a variety of partners. [点击这里试一试！](%= resolve_url('/learn') %)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](%= resolve_url('/learn') %)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. 推广你的编程一小时活动

Promote your Hour of Code [with these tools](%= resolve_url('/promote') %) and encourage others to host their own events.

## 4. 您所需的教学设备——电脑不是必需的

要获得编程一小时活动的最佳体验，需要一台联网的电脑。 但您**并不**需要给每一个孩子提供电脑，您甚至可以在没有电脑的情况下开展编程一小时课程活动。

在学生计算机或设备上测试这些指南，确保它们在播放器上的声音和视频能够正常运作。 **担心网速不好？** 可以在课程一开始就集中播放全部视频，这样学生就无需自行下载这些视频资料了。 也可采用线下离线的教学指南内容开展授课活动。

如果教程包含音频，那么应提前准备耳机，或者让学生自带耳机。

**电脑不够？**采取[搭档合作编程](https://www.youtube.com/watch?v=vgkahOzFH2Q)的方式。 学生之间搭档之后，他们会互相帮助并减少对老师的依赖。 他们将明白编程也是一种社交和协作。

## 5. 用一段鼓舞人心的视频来开始你的编程一小时

讨论计算机科学对我们生活的各个方面的影响，鼓舞参与者，启动编程一小时活动

**播放鼓舞人心的视频：**

- 最初的 Code.org 推出的视频, 有比尔盖茨, 马克·扎克伯格, NBA 球星克里斯波什-有[1 分钟 ](https://www.youtube.com/watch?v=qYZF6oIZtfc), [ 5 分钟 ](https://www.youtube.com/watch?v=nKIu9yen5nc),和 [9 分钟 ](https://www.youtube.com/watch?v=dU1xS07N-FA) 版本可用。
- [全球 编程一小时活动 视频 ](https://www.youtube.com/watch?v=KsOIlDT145A)
- [总统奥巴马号召所有学生学习计算机科学](https://www.youtube.com/watch?v=6XvmhE1J9PY)。
- 更多励志的视频可以[ 点此查看](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)。

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- 用无论男孩还是女孩都会关心的例子来阐述技术是如何影响我们的生活的（比如一些用于挽救生命、帮助人类、沟通你我的一些软件和技术之类的例子）。
- 列举日常生活中需要使用程序的情况。
- [这里](%= resolve_url('https://code.org/girls') %)是一些能让女孩对计算机科学感兴趣的小技巧。

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. 编程！

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](%= resolve_url('/learn') %) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](%= resolve_url('/learn') %) - Or, ask those who finish early to help others who are having trouble.

## 7. 庆祝

- [Print certificates](%= codeorg_url('/certificates') %) for your students.
- 为你的学生[打印"我学过《编程一小时》!"](%= resolve_url('/promote/resources#stickers') %) 贴纸。
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- 在社交媒体上分享关于您的编程一小时活动的照片或视频。请使用 #HourOfCode 和 @codeorg，这样我们也可以突出显示您活动的成功 ！

## 适用于教育工作者的其他编程一小时的资源

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- 阅读 [编程一小时常见问题](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)。 <% end %>

## 编程一小时之后该做什么？

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](%= codeorg_url('/learn/beyond') %)!

<%= view :signup_button %>