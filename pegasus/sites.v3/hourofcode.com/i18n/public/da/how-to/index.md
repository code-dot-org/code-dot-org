---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Sådan underviser du i en Hour of Code</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps. The Hour of Code is easy to run - even for beginners! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

The best Hour of Code experience includes Internet-connected computers. But you **don’t** need a computer for every child, and you can even do the Hour of Code without a computer at all.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Stil høretelefoner til rådighed i din klasse, eller bed eleverne medbringe deres egne, hvis øvelsen, du vælger, fungerer bedst med lyd.

**Har du ikke nok enheder?** Brug [par programmering](https://www.youtube.com/watch?v=vgkahOzFH2Q). Når eleverne arbejder sammen, hjælper de hinanden og har mindre brug for hjælp fra læreren. De vil også opleve at programmering er en social aktivitet, hvor samarbejde er vigtigt.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Vis en inspirerende video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Lav som klasse en liste over ting i hverdagen, som bruger kode.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Det ved jeg ikke. Lad os se om vi kan finde ud af det sammen."
- "Det er ikke altid teknologien opføre sig helt som vi ønsker."
- "At lærer at programmere er som at lære et nyt sprog. Kun øvelse gør mester."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Eller du kan bede de elever, der er tidligt færdige om, at hjælpe de klassekammerater der har problemer med deres aktivitet.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [Udskriv "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickere til dine elever.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your school.
- Del billeder og video af jeres Hour of Code på sociale medier. Brug #HourOfCode og @codeorg så vi også kan dele jeres succes!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Flere Hour of Code materialer til undervisere:

- Besøg [Hour of Code Teacher Forum](http://forum.code.org/c/plc/hour-of-code) for at få rådgivning, indsigt og hjælp fra andre undervisere. <% if @country == 'us' %>
- Tjek vores [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Hvad er næste skridt efter Hour of Code?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>