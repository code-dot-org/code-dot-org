* * *

title: <%= hoc_s(:title_tutorial_guidelines) %> layout: wide

* * *

# 编程一小时和计算机科教周教程指南

Code.org会在code.org， hourofcode.com，CSEDWeek等网站上主办各种编程一小时™活动。当前的列表在 [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %).

我们想要主办各种引人入胜的选择，但是主要的目标是为新学习计算机科学的老师和学生优化体验。 请用本文档来指导你创建活动，有针对性的面向没有计算机编程和计算机科学经验的用户。

  


**读完这个指南后，你可以将你的教程提交到我们的[编程一小时™活动提交页面](https://goo.gl/kNrV3l).**

**更新：**和以前不一样，我们计划介绍一种新的“以教师为主导”的编程一小时活动。 这些会列在面向学生的自学指南活动和电子邮件的下面。 详情如下。

<a id="top"></a>

## 索引：

  * [创建编程一小时活动的通用指导](#guidelines)
  * [教程会被怎样评估并接受](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [Suggestions for designing your activity](#design)
  * [Trademark Guidelines](#tm)
  * [Tracking Pixel](#pixel)
  * [Promoting your tutorials, CSEdWeek, and Hour of Code](#promote)
  * [为残疾学生的注释](#disabilities)

<a id="guidelines"></a>

## 2015新内容：两种形式的活动：自学或者*课程计划*

现在，成千上万的教育工作者已经尝试过编程一小时，许多课堂里准备了更多有创意，而不是通用活动来讲授计算机科学的基础知识。 为了帮助老师找到灵感，我们希望从有编程一小时讲授经验的老师收集1小时的“以教师为主导”的课程和活动计划。 我们也会继续推动“自学”形式的课程。

***（新内容）*提交教师主导的课程计划，最好是跨学科的**：你有吸引人的或是独特的编程一小时课程的想法吗？ 一些教育工作者更愿意按照传统课程的形式来组织编程一小时活动，而不是通过引导性的游戏的体验。 如果正确的推进活动，更开放的活动会更好的展示计算机科学的创造性本质。 我们很愿意收集**为不同科目设计的一小时教案**。 例如，在几何课堂中讲授编程的一小时教案。 或者英语课堂上的疯狂填词练习。 或者历史课上的创造测验题目的活动。 这可以帮助我们招募其它学科的老师来通过他们独特的领域来指导编程一小时活动，同时也展示了计算机科学是如何影响和提升不同的学科。

你可以从[空白模板](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub)开始你的授课计划。

例如：

  * [对称图（为美术老师准备的活动）](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [为物理老师准备的Arduino开发活动](https://csedweek.org/csteacher/arduino.pdf)
  * [为历史老师准备的技术历史活动](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>如何提交我自己的教案？</button>](#submit)

  
  
**学生主导（自学）的形式**：最早的编程一小时课程大部分是基于自学的，老师的帮助不是必需的。 现在已经有很多选择了，但如果你想创建一个新的活动，它应该被设计为能让学生们有兴趣的独立完成，或者在课堂上由没有备课或没有计算机背景的老师来指导。 它们应该为学生提供指导，而不是不确定的一小时长的挑战。 理想情况下，说明和教程都会直接集成到编程平台里，以免在教程和编程平台页面间切换。

注意：我们会在面向学生的页面里的自学教程*下面*列出面向教师的活动。但也会将它们放到给教师的页面或者电子邮件里。

## 创建一个编程一小时活动的一般准则

编程一小时的目标是给初学者第一次尝试计算机科学或编程。基调应该是：

  * 计算机科学不是只给天才的，无论年龄、性别、种族。任何人*都能*学习！
  * 计算机科学和大量的领域和爱好都相关。每个人*都应该*学习！
  * 鼓励学生创造一些能和朋友在线分享的东西。

**技术要求**：因为学校和班级的设备的多样性，最好的活动应该是基于网页的，或是能在智能手机上使用的，或者是不需要设备的讲授计算机概念的课程。(参考<http://csunplugged.com/>). 如果这个活动需要安装应用，桌面软件，或游戏机也可以，但不推荐这样。

[**返回页首**](#top)

<a id="inclusion"></a>

## 教程会被怎样评估并接受

计算机科学教育者委员会将基于定性和定量的指标来给提交的作品排名，其中包括一个从更多教育工作者来的调研结果。

**如下的教程会排名较高：**

  * 高质量
  * 为初学者准备的——包括初学的老师和学生
  * 设计为一小时的活动
  * 不需要注册
  * 不需要付费
  * 不需要安装
  * 跨操作系统/设备平台，包括手机和平板
  * 跨多种语言工作
  * 促进所有人群的学习（特别是代表性不足的人群）
  * 不是纯HTML+CSS的网页设计 —— （我们的目标是计算机科学，不是HTML编程）

**如下的教程会排名较低：**

  * 低质量
  * 更高级的教育（不适合初学者）
  * 只支持有限数量的操作系统/设备平台——基于浏览器平台的应该支持：IE9以上，最新版的Chrome, Firefox和Safari.
  * 只支持英文
  * 包含固有成见，从而会阻碍未被代表的学生群体。
  * 需要付费购买完全版的学习平台

**如下教程不会被考虑：**

  * 没有设计成（大致）一个小时的活动
  * 要求注册 
  * 要求付费
  * 要求安装（移动应用除外）
  * 只集中在HTML+CSS的网页设计
  * 没在提交截止日期前提交，或者信息不完整（见下文）

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

Ultimately, the goal of the Hour of Code campaign is to broaden participation in computer science by students and teachers, and to help show that computer science is accessible to all, and “easier than you think.” In many ways, this goal is better achieved by giving students and teachers fewer and simpler choices, with a focus on the highest quality options for a first-time user. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**返回页首**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**What you’ll need:**

  * Your name, logo (jpg, png, etc.)
  * URL for a screenshot or marketing image of the HoC activity. Images/screenshots should be 446 x 335 resolution exactly. If an appropriate image is not provided, we may take our own screenshot of your tutorial OR we may choose not to list it.
  * URL Link for the logo
  * Name of the activity
  * URL Link to the activity
  * URL Link to teacher notes (optional, see details below)
  * Description of the activity (both desktop-view and mobile-view) 
      * **Max character count for desktop-view:** 384
      * **Max character count for mobile-view:** 74
      * Please include in the description whether it’s mainly student-guided or teacher-facilitated. Additionally, some schools are interested in knowing if Hour of Code activities address Common Core or Next Generation Science Standards. If the activity addresses specific standards, consider including this information.
  * A list of tested/compatible platforms: 
      * Web based: Which platforms have you tested 
          * OS - Mac, Win, and versions
          * Browsers - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobile Safari (mobile-optimized)
          * Android Chrome (mobile-optimized)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Unplugged
  * A list of supported languages and appropriate format: 
      * Tutorials should specify which languages they support using 2-character language codes, e.g. en - English; ja - Japanese
      * If more specificity is necessary, using dashes, e.g. fr-be - French (Belgium) or fr-ca - French (Canada)
      * ***Note: Language-detection is the job of the tutorial provider, we will redirect all users to the single URL provided.*** 
  * If you submit an online tutorial, we need to know whether it is [COPPA compliant](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) or not.
  * Recommended grade level(s) for intended users. You may refer to the [Computer Science Teachers’ Association’s K-12 Standards](http://csta.acm.org/Curriculum/sub/K12Standards.html) for grade-appropriate computer science concepts. Example grade levels include: 
      * Elementary school: grades K-2 or 3-5
      * Middle School: grades 6-8
      * High School: grades 9-12
      * All ages
  * Please also include recommended computer science knowledge within grade level: Beginner, Intermediate, or Advanced. The Hour of Code website will highlight activities for Beginners most prominently. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Technical requirements: 
      * In order to more accurately track participation we want every third party tutorial partners to include 1-pixel tracking images on the first and last page of their Hour of Code tutorials. Place a starting pixel-image on the start page and a final pixel-image on the end page. Do not place pixels on interim pages). See the Tracking Pixel section below for more details. 
      * Upon finishing your activity, users should be directed to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) where they will be able to: 
          * Share on social media that they completed the Hour of Code
          * Receive a certificate that they completed the Hour of Code
          * See leaderboards about which countries/cities have the highest participation rates in Hour of Code activities
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) as well. 
  * *(Optional)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * For online activities (especially smartphone/tablet apps): 
          * Number of users
          * How many completed the task
          * Average time on task
          * Number of total lines of code written over all users
          * How many continued on to further learning (measured as any user who finishes the task and goes onto additional tasks at your site)
      * For offline activities 
          * Number of downloads of paper version of activity (if applicable)

[**返回页首**](#top)

<a id="design"></a>

## Suggestions for designing your activity

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Under no circumstances can the Code.org logo and name be used. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Make sure that the average student can finish comfortably in an hour.** Consider adding an open-ended activity at the end for students who move more quickly through the lesson. Remember that most kids will be absolute beginners to computer science and coding.

**Include teacher notes.** Most activities should be student-directed, but if an activity is facilitated or managed by a teacher, please include clear and simple directions for the teacher in the form of teacher-notes at a separate URL submitted with your activity. Not only are the students novices, some of the teachers are as well. Include info such as:

  * Our tutorial works best on the following platforms and browsers
  * Does it work on smartphones? Tablets?
  * Do you recommend pair programming? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Incorporate feedback at the end of the activity.** (E.g.: “You finished 10 levels and learned about loops! Great job!”)

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode” or “I’ve done an #HourofCode as a part of #CSEdWeek. Have you? @Scratch.” Use the hashtag **#HourOfCode** (with capital letters H, O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**Explain or connect the activity to a socially significant context.** Computer programming becomes a superpower when students see how it can change the world for the better!

**Do not require signup or payment before students can try your tutorial.** Tutorials that require signup or payment will not be listed

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * The driver controls the mouse and keyboard.
  * The Navigator makes suggestions, points out errors, and asks questions. 
  * Students should switch roles at least two times a session.

Benefits of Pair Programming:

  * Students can help one another instead of relying on the teacher
  * Show that coding is not a solo activity, but one involving social interaction
  * Not all classrooms or labs have enough computers for a 1:1 experience

[**返回页首**](#top)

<a id="tm"></a>

## Trademark Guidelines

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

One piece of this is to protect the trademark "Hour of Code" to prevent confusion. Many of our tutorial partners have used "Hour of Code" on your web sites. We don't want to prevent this usage, but we want to make sure it fits within a few limits:

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". 坏例子：“试验ACME公司的编程一小时”。
  2. 用一个“TM”上标放在最显著的提到“编程一小时”的地方。包括网站和应用程序。
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. 不要将“编程一小时”用在应用程序名字中。

[**返回页首**](#top)

<a id="pixel"></a>

## Tracking Pixel

In order to more accurately track participation we ask every third party tutorial partners to include 1-pixel tracking images on the first and last page of their Hour of Code tutorials (A starting pixel-image on the start page and a final pixel-image on the end page. And not on interim pages).

This will allow us to count users who you directly recruit to visit your website to do their Hour of Code, or users who visit when a teacher types your URL directly on their whiteboard. It will lead to more accurate participation counts for your tutorial, which will help you attract users. If you integrate the pixel at the end it will also allow us to measure tutorial completion rates.

If your tutorial is approved and included on the final tutorial page, Code.org will provide you with a unique tracking pixel for you to integrate into your tutorial. See example below.

NOTE: this isn't important to do for installable apps (iOS/Android apps, or desktop-install apps)

Example tracking pixels for AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**返回页首**](#top)

<a id="promote"></a>

## Promoting your tutorials, CSEdWeek, and Hour of Code

We are asking everyone to promote their own 1-hour tutorial to your users. Please direct them to ***your*** Hour of Code page. Your users are much more likely to react to a mailing from you about your tutorial. Use the international Hour of Code campaign for Computer Science Education Week as an excuse to encourage users to invite others to join in, help us reach 100 million total participants.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Promote Hour of Code using social media, traditional media, mailing lists, etc, using hashtag **#HourOfCode** (with capital letters H, O, C)
  * Host a local event or ask your employees to host an event at local schools or community groups.
  * See our resource kit for further information (coming soon).

[**返回页首**](#top)

<a id="disabilities"></a>

## 特别为残疾学生的注释

如果您创建了一个教程，为有视觉障碍的学生设计的，我们非常愿意为使用屏幕阅读器的观看者推荐。 我们还没有收到这类教程，并且热切希望为这样的学生提供一个选项。

[**返回页首**](#top)