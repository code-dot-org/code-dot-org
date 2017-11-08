---
title: '<%= hoc_s(:title_how_to) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>如何教授一小時玩程式的課程</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) as well as [teacher-guided tutorials](<%= resolve_url('https://code.org/educate/teacher-led') %>) for participants of all ages, created by a variety of partners.

[![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

一小時玩程式課程在有網路連線的電腦上會有最佳的體驗。 但你的學生**不見得**都需要一台電腦，你甚至可以舉辦一個完全沒有電腦的一小時玩程式活動。

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

如果教程需要音效，請提供耳機或要求學員自備。

**設備數量不足？**試試看[結對程式設計](https://www.youtube.com/watch?v=vgkahOzFH2Q)吧！ 當學生們合作時，他們會互相幫忙，並減少對老師的依賴。 他們也將瞭解到電腦科學是需社交與合作的。

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**展示一支激勵人心的影片**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- 尋找更多有啟發性的[資源](<%= resolve_url('https://code.org/inspire') %>)和[影片](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)

**如果你和你學生都是初入計算機科學領域的新手也沒有關係，這裡有些點子幫助你介紹你的一小時玩程式活動：**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- 全班一起列出在日常生活中用到程式碼的事情。
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls')%>).

## 6. Code!

**引導學生參與活動**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**當您的學生遭遇困難時，這樣回答也沒關係：**

- 「我也不知道，我們一起找出方法吧。」
- 「科技不見得是以我們想的方式運作。」
- 「學習程式設計就像是學習新的語言；你不會馬上就上手。」

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- 或者，請提前完成的學生協助那些在活動遇到麻煩與的同學。

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= resolve_url('https://code.org/certificates')%>) for your students.
- 為你的學生[列印「我完成了一小時玩程式！」](<%= resolve_url('/promote/resources#stickers') %>)貼紙。
- 為你的學校[訂購客製化 T 恤](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)。
- 在社群平台分享一小時玩程式的活動照片及影片，使用 #HourOfCode 和 @codeorg，這樣一來也可以突顯你的成功。

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 給教師的其他一小時玩程式活動資源：

- 造訪[一小時玩程式的教師論壇](http://forum.code.org/c/plc/hour-of-code)，從其他教師身上獲得建議與支援。 <% if @country == 'us' %>
- 觀看[一小時玩程式的常見問答](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)。 <% end %>

## Hour of Code之後有什麼？

一小時玩程式只是入門，是瞭解科技如何運作、軟體如何創造的一小步，要繼續這段旅程，你可以：

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond')%>).
- [參加](<%= resolve_url('https://code.org/professional-development-workshops') %>) 一場整天的在職進修工作坊，以接受有經驗的電腦科學引導者的指導。 （僅適於美國地區教師）

<%= view :signup_button %>