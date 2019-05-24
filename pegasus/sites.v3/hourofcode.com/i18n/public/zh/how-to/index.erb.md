---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### 參與活動，并用下面的步驟向學生們介紹他們第一個小時的計算機科學。 編程一小時的課程對初學者來說都非常容易上手的！ 假如你需要額外的幫手，你可以找一個[本地義工](<%= codeorg_url('/volunteer/local') %>)幫忙執行程式。

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 2. 觀看視頻指導 <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2) 為你的這一個小時挑選教程：

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3) 推廣你的一小時玩程式活動

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. 您所需的教學設備——電腦不是必需的

一小時玩程式課程在有網路連線的電腦上會有最佳的體驗。 但你的學生**不見得**都需要一台電腦，你甚至可以舉辦一個完全沒有電腦的一小時玩程式活動。

在學生計算機或機台上測試這些指南，確保它們在播放器上的聲音和視頻能夠正常運作。 **擔心帶寬太低？ ** 可以在全部面前播放視頻，這樣學生就不會自行下載視頻。 或者也可以採用下線/不上網的教學指南。

如果教程需要音效，請提供耳機或要求學員自備。

**設備數量不足？**試試看[結對程式設計](https://www.youtube.com/watch?v=vgkahOzFH2Q)吧！ 當學生們合作時，他們會互相幫忙，並減少對老師的依賴。 他們也將瞭解到電腦科學是需社交與合作的。

<img src="/images/fit-350/group_ipad.jpg" />

## 5）以一段激勵演講或視頻來開始編程一小時活動

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**展示一支激勵人心的影片**

- 正版的 Code.org 推出包括比爾蓋茨、馬克·扎克伯格和 NBA 球星克里斯. 波什的視頻。 (有 [ 1 分鐘 ](HTTPs://www.youtube.com/watch？v=qYZF6oIZtfc)、[ 5 分鐘 ](HTTPs://www.youtube.com/watch？v=nKIu9yen5nc) 和 [ 9 分鐘 ](HTTPs://www.youtube.com/watch？v=dU1xS07N-FA) 版本可用)
- 發掘更多具啟發性的[資源](<%= codeorg_url('/inspire') %>)及[影片](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)。

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- 通過男孩和女孩們都關心的例子，介紹科技如何影響我們的生活（比如拯救生命，幫助人們，連接人們等）
- 全班一起列出在日常生活中用到程式碼的事情。
- 點擊[這裡](<%= codeorg_url('/girls')%>)查看讓女孩子們對計算機科學產生興趣的小貼士。

## 6) 寫程式！

**Direct students to the activity**

- 把教學指南的鏈接寫在白板上。在參加人員數量下面可以找到[你選擇的指南鏈接](<%= resolve_url('/learn')%>)。

**When your students come across difficulties it's okay to respond:**

- 「我也不知道，我們一起找出方法吧。」
- 「科技不見得是以我們想的方式運作。」
- 「學習程式設計就像是學習新的語言；你不會馬上就上手。」

**What if a student finishes early?**

- 學生可以查看所有教程和 [ 嘗試另一個小時的代碼活動 ](<%= resolve_url('/learn')%>)。
- 或者，請提前完成的學生協助那些在活動遇到麻煩與的同學。

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. 慶祝

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- 為你的學生[列印證書](<%= codeorg_url('/certificates')%>)。
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

- 鼓勵學生繼續於[網上學習](<%= codeorg_url('/learn/beyond')%>)。
- [參加](<%= codeorg_url('/professional-development-workshops') %>)一日工作坊，讓經驗豐富的電腦科學主持人親自指導你。（只限美國教育工作者）

<%= view :signup_button %>