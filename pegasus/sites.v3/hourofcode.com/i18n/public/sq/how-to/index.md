---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Si të shpjegosh një Orë të Kodimit</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps. The Hour of Code is easy to run - even for beginners! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

Përvoja më e mirë e Orës së Kodimit përfshin kompjutera të lidhur me internet. Por ju **nuk** keni nevojë për një kompjuter për çdo pjesmarrës, madje ju mund të realizoni Orën e Kodimit edhe pa asnjë kompjuter.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Në rast se tutoriali juaj funksionon më mirë me zë, vini në dizpozicion kufje për klasën tuaj, ose kërkoni nga studentët t'i kenë me vete kufjet e tyre.

**Nuk ke pajisje sa duhet?** Përdor [ programimin cift](https://www.youtube.com/watch?v=vgkahOzFH2Q). Kur pjesëmarrësit bashkëpunojnë, ata ndihmojnë njëri-tjetrin dhe mbështeten më pak tek mësuesi. Ata gjithashtu do ta kuptojnë që shkencat kompjuterike janë sociale dhe bashkëpunuese.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Trego një video frymëzuese:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Si klasë, listoni gjëra që përdorin kod në jetë e përditshme.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Nuk e di. Le ta zgjidhim së bashku."
- "Teknologjia nuk punon gjithmon ashtu siç duam ne."
- "Të mësuarit se si të programosh është si të mësosh një gjuhë të re; nuk do të jesh i rrjedhshëm menjëherë"

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Ose, kërkoni nga studentët që mbarojnë më herët të ndihmojnë shokët e klasës që hasin vështirësi me punën.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [Printo "Unë bëra një Orë Kodim!"](<%= resolve_url('/promote/resources#stickers') %>) afishe për studentët e tu.
- [Porosit bluza ](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)për shkollën tënde.
- Shpërndaj fotot dhe videot e Orës tënde të Kodimit në mediat sociale. Përdorni #HourOfCode dhe @codeorg kështu që ne mund të nxjerrim në pah suksesin tuaj!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Burime të tjera për Orën e Kodimit për mësuesit:

- Vizitoni [Forumin e orës së Kodimit](http://forum.code.org/c/plc/hour-of-code) për të marrë këshilla, njohuri dhe mbështetje nga organizatorët e tjerë. <% if @country == 'us' %>
- Shiko [FAQ e Orës së Kodimit](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Çfarë vjen pas Orës së Kodimit?

Ora e Kodimit është thjesht hapi i parë i një udhëtimi për të mësuar më shumë se si teknologjia funksionon dhe se si të krijojmë një aplikacion software-ik. Për të vazhduar këtë udhëtim:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>