---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>1시간짜리 Hour of Code 교육 방법</h1>

이 운동에 참여하신 다음에는, 첫번째 컴퓨터 과학 시간에 이 철차대로 해보세요. Hour of Code는 초보자에게도 사용하기 쉽습니다! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

Hour of Code를 경험하기 위한 최고의 선택은 인터넷이 연결된 컴퓨터입니다. 하지만 모든 아이들이 컴퓨터가 필요한 것은 **아닙니다**, 그리고 Hour of Code는 컴퓨터 없이도 가능합니다.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

소리와 관련된 튜토리얼을 수월하게 하기 위해서 학생들에게 헤드폰을 제공하거나, 그들이 가지고 있는 헤드폰을 가져오도록 요청하셔도 좋습니다.

**충분한 장비가 없습니까?**[페어 프로그래밍 방법을](https://www.youtube.com/watch?v=vgkahOzFH2Q) 활용하세요. 학생들을 짝 지어주면, 선생님보다 서로 서로 도움을 주고 받을 수 있도록 할 수 있습니다. 그렇게 함으로서 컴퓨터과학(정보과학)은 사회적이며 협동적이다라는 것을 알게 될 수 있습니다.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**영감을 주는 동영상을 보여주세요:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- 수업에서, 일상생활 속에서 코드를 사용하는 것들을 나열하세요.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "나도 잘 모른단다. 우리 함께 생각해 보자."
- "컴퓨터과학(정보과학) 기술은 항상 우리가 원하는대로만 동작하지 않는단다."
- "프로그램을 배우는 것은 새로운 언어를 배우는 것과 같아; 곧바로 능숙할 수는 없는 것이란다."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- 또는, 일찍 완료한 학생들에게 어려워서 잘 해결하지 못하고 있는 다른 학생들을 도와달라고 이야기 해보세요.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- 여러분의 학생들을 위한 ["나는 Hour of Code를 해냈다!"라는 스티커를 인쇄하세요.](<%= resolve_url('/promote/resources#stickers') %>)
- [행사 T-셔츠 주문](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) 하기.
- 소셜 미디어에 여러분의 Hour of Code 이벤트 사진이나 동영상을 공유하세요. #HourOfCode 와 @codeorg를 이용하면 우리도 여러분의 성공을 강조할 수 있어요.

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 교육자를 위한 다른 Hour of Code 리소스들

- 다른 교육자들로부터 조언, 통찰력, 지원을 얻을 수 있는 [Hour of Code 교사 포럼](http://forum.code.org/c/plc/hour-of-code)을 방문하세요. <% if @country == 'us' %>
- [Hour of Code의 FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)를 검토해보세요. <% end %>

## Hour of Code 이후에는 어떤 것들이 있나요?

Hour of Code 는 컴퓨터과학기술이 어떻게 동작하고, 응용프로그램(앱) 들을 어떻게 만들어 낼 수 있는지 배울 수 있는 긴 여행의 첫 번째 시작입니다. 이 여행을 계속하려면:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>