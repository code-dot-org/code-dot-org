---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### Присъединете се към движението и въведете група от ученици в първия им час по компютърни науки с тези стъпки. Часът на кода е лесен за изпълнение - дори и за начинаещи! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/Fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

Най-добрият Hour of Code се провежда с Интернет свързани компютри. Но вие **не** се нуждаете от компютър за всяко дете, и можете дори да проведете часът на кода без компютър за всички.

Тестирайте уроците на компютри или устройства. Уверете се, че те работят правилно на браузъри със звук и видео. **Имат ниска скорост?** Планирайте да покажете видеото на дъската. Или опитайте офлайн уроци.

Предоставете слушалки за класа си, или помолете учениците да си донесат, ако изберете уроци за начинаещи -най-добре е със звук.

**Няма достатъчно устройства?** Използвайте [ програмиране по двойки](https://www.youtube.com/watch?v=vgkahOzFH2Q). Когато учениците си партнират, те си помагат един на друг и разчитат по-малко на учителя. Те ще се убедят, че компютърните науки се нуждаят от социално сътрудничество.

<img src="/images/Fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Покажи вдъхновяващо видео:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- В клас направете списък на нещата, които използват код в ежедневния живот.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Аз не знам. Нека да разберем това заедно."
- "Технологията не винаги работи по начина, по който ние искаме."
- "Да се научиш да програмираш е като изучаването на нов език; няма да го овладееш веднага."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Или помолете учениците, които са завършили по- рано да помогнат на съучениците си, които имат проблеми с дейността.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [ Разпечатайте "Направих Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) стикери за вашите ученици.
- [ поръчайте тениски](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) за вашето училище.
- Споделете снимки и видео на събитието си в социалните медии. Използвайте #HourOfCode и @codeorg,, така ще можем да научим за Вашия успех!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Други ресурси за педагози:

- Посетете [ Hour of Code Форума](http://forum.code.org/c/plc/hour-of-code), за да получите съвети и подкрепа от други преподаватели. <% if @country == 'us' %>
- Прегледайте [ часът на кода често задавани въпроси](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Какво идва след Hour of Code?

Hour of Code е само първата стъпка в пътешествието в изучаването на това, как технологията работи и как да създавате софтуерни приложения. За да продължите това пътуване:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>