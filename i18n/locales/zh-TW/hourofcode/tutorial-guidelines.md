* * *

title: <%= hoc_s(:title_tutorial_guidelines) %> layout: wide

* * *

<%= view :signup_button %>

# Tutorial guidelines for the Hour of Code™ and Computer Science Education Week

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %).

我們想要主辦各種引人入勝的選項，但主要目標是為學生和教師是對新電腦科學的優化體驗。 請使用本文檔來指導你的活動，有針對性的向使用者編碼、 電腦程式設計和電腦科學在沒有背景的人的創作。

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## 索引:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [教程將如何被列入評估](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [您的活動設計建議](#design)
  * [商標準則](#tm)
  * [跟蹤像素](#pixel)
  * [推廣你的教程，CSEdWeek 和小時的代碼](#promote)
  * [對象為殘疾學生的注意事項](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. Ideally, the instructions and tutorials are integrated directly into the programming platform, to avoid switching tabs or windows between the tutorial and the programming platform.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## 創建代碼小時活動的一般準則

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * 鼓勵學生創造的東西可以與朋友/線上共用。

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**返回頁首**](#top)

<a id="inclusion"></a>

## 教程將如何被列入評估

電腦科學教育工作者委員會將排名提交基於定性和定量的指標，包括廣泛的教育工作者一系列的調查結果。

**如果有教程，將會於上面列出：**

  * 高品質
  * designed for beginners - among students AND teachers
  * 作為 1 小時活動設計
  * require no sign up
  * require no payment
  * require no installation
  * 跨許多 OS/設備平臺，包括手機和平板電腦工作
  * 跨多種語言工作
  * promote learning by all demographic groups (esp. under-represented groups)
  * 不是純 HTML + CSS web 設計焦點-(我們的目標是電腦科學中，不只 HTML 編碼)

**如果他們參與，教程將會被列在下方:**

  * 低品質
  * 更多先進水準的教學 (不適合初學者)
  * 有為數有限的受支援的 OS/設備平臺 — — 為基於 Web 的平臺，你應該旨在支援所有以下: IE9 + 最新 Chrome、 火狐瀏覽器和野生動物園Safarie瀏覽器
  * 只有英語可行
  * reinforce stereotypes that hinder participation by under-represented student groups
  * 作為追加到收取學費的學習平臺

**如果他們這樣做，教程不會列出:**

  * 不是必須的 (大約) 一小時活動
  * 需要登錄了 
  * 要求支付
  * require installation (other than mobile apps)
  * 只專注于 HTML + CSS 網頁設計
  * 提交後提交截止時間，或不完全資訊 (見下文)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

最終，代碼小時運動是要擴大參與的學生和教師，電腦科學，説明顯示電腦科學的目標是對一切人開放，"比你想像的容易"。 在許多方面，這一目標被通過更好地給學生和教師更少、 更簡單的選擇，重點放在第一次使用者的高品質選項。 Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**返回頁首**](#top)

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
          * iOS 移動 Safari (移動優化)
          * Android 的瀏覽器 (移動優化)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * 未插入
  * A list of supported languages and appropriate format: 
      * Tutorials should specify which languages they support using 2-character language codes, e.g. en - English; ja - Japanese
      * If more specificity is necessary, using dashes, e.g. fr-be - French (Belgium) or fr-ca - French (Canada)
      * ***Note: Language-detection is the job of the tutorial provider, we will redirect all users to the single URL provided.*** 
  * If you submit an online tutorial, we need to know whether it is [COPPA compliant](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) or not.
  * Recommended grade level(s) for intended users. You may refer to the [Computer Science Teachers’ Association’s K-12 Standards](http://csta.acm.org/Curriculum/sub/K12Standards.html) for grade-appropriate computer science concepts. Example grade levels include: 
      * 小學: 年級 K 2 或 3-5
      * 中學: 年級 6-8
      * 高中: 年級9-12
      * 所有年齡段
  * Please also include recommended computer science knowledge within grade level: Beginner, Intermediate, or Advanced. The Hour of Code website will highlight activities for Beginners most prominently. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * 技術要求: 
      * In order to more accurately track participation we want every third party tutorial partners to include 1-pixel tracking images on the first and last page of their Hour of Code tutorials. Place a starting pixel-image on the start page and a final pixel-image on the end page. Do not place pixels on interim pages). See the Tracking Pixel section below for more details. 
      * Upon finishing your activity, users should be directed to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) 在那裡他們將能夠: 
          * Share on social media that they completed the Hour of Code
          * Receive a certificate that they completed the Hour of Code
          * See leaderboards about which countries/cities have the highest participation rates in Hour of Code activities
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) as well. 
  * *(可選)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * For online activities (especially smartphone/tablet apps): 
          * 用戶數量
          * 多少人完成這項任務
          * 在任務上的平均時間
          * Number of total lines of code written over all users
          * How many continued on to further learning (measured as any user who finishes the task and goes onto additional tasks at your site)
      * 為離線活動 
          * Number of downloads of paper version of activity (if applicable)

[**返回頁首**](#top)

<a id="design"></a>

## 您的活動設計建議

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

結對程式設計的好處:

  * Students can help one another instead of relying on the teacher
  * Show that coding is not a solo activity, but one involving social interaction
  * Not all classrooms or labs have enough computers for a 1:1 experience

[**返回頁首**](#top)

<a id="tm"></a>

## 商標準則

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

One piece of this is to protect the trademark "Hour of Code" to prevent confusion. Many of our tutorial partners have used "Hour of Code" on your web sites. We don't want to prevent this usage, but we want to make sure it fits within a few limits:

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

[**返回頁首**](#top)

<a id="pixel"></a>

## 跟蹤像素

In order to more accurately track participation we ask every third party tutorial partners to include 1-pixel tracking images on the first and last page of their Hour of Code tutorials (A starting pixel-image on the start page and a final pixel-image on the end page. 和不上臨時頁)。

This will allow us to count users who you directly recruit to visit your website to do their Hour of Code, or users who visit when a teacher types your URL directly on their whiteboard. It will lead to more accurate participation counts for your tutorial, which will help you attract users. If you integrate the pixel at the end it will also allow us to measure tutorial completion rates.

If your tutorial is approved and included on the final tutorial page, Code.org will provide you with a unique tracking pixel for you to integrate into your tutorial. See example below.

NOTE: this isn't important to do for installable apps (iOS/Android apps, or desktop-install apps)

Example tracking pixels for AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**返回頁首**](#top)

<a id="promote"></a>

## 推廣你的教程，CSEdWeek 和小時的代碼

We are asking everyone to promote their own 1-hour tutorial to your users. Please direct them to ***your*** Hour of Code page. Your users are much more likely to react to a mailing from you about your tutorial. Use the international Hour of Code campaign for Computer Science Education Week as an excuse to encourage users to invite others to join in, help us reach 100 million total participants.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Promote Hour of Code using social media, traditional media, mailing lists, etc, using hashtag **#HourOfCode** (with capital letters H, O, C)
  * Host a local event or ask your employees to host an event at local schools or community groups.
  * See our resource kit for further information (coming soon).

[**返回頁首**](#top)

<a id="disabilities"></a>

## A special note for students with disabilities

If you create a tutorial that is designed for the vision-impaired, we’d love to highlight it for viewers with screen-readers. We have not yet received such a tutorial, and would be eager to include one as an option for these students.

[**返回頁首**](#top)

<%= view :signup_button %>