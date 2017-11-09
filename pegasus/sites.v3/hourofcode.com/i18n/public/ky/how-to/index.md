---
title: '<%= hoc_s(:title_how_to) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Код саатын кантип үйрөтүү керек</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps.

## 1. Кандай кылуу видеосун көрүңүз <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) as well as [teacher-guided tutorials](<%= resolve_url('https://code.org/educate/teacher-led') %>) for participants of all ages, created by a variety of partners.

[![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Код саатыңызды жарнамалаңыз

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Керектүү техниканы пландаштыруу - компүтерлер, бар болсо

Код саатты интернетке туташкан компүтер менен мыкты натыйжа берет. Бирок ар бир балага компүтер болушу **керек эмес**, Код саатын компүтерсиз өткөзсө деле болот.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Үнү бар жетектеме тандасаңыз, классты кулакчындар менен камсыздагыла же окуучуларга өздөрүнүкүн ала келүүсүн айткыла.

**Түзмөктөр жетишпейби?**[Жупташып](https://www.youtube.com/watch?v=vgkahOzFH2Q) иштегиле. Катышуучулар өнөктөшкөндө, бири-бирине жардамдашып, мугалимге азыраак кайрылышат. Ошондой эле компүтерде биргелешип кызматташса болоорун көрүшөт.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Шыктандыруучу видео көрсөткүлө:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Дагы башка шыктандыруучу [ресурстар](<%= resolve_url('https://code.org/inspire') %>) жана [виделор](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Өзүңүз жана окуучуларыңыз дагы компүтер менен тааныш болбосо - эч нерсе эмес. Код сааты иш-чараңызды тааныштыруунун айрым идеялары:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Класс катары, турмуштагы код колдонгон нерселердин тизмеси.
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls')%>).

## 6. Код жазгыла!

**Катышуучуларды ишке багыттагыла**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**Окуучулар кыйынчылыкка дуушар болгондо мындай жооп берсе болот:**

- "Мен билбейм. Келгиле, чогуу карап көрөлү."
- "Технологиялар дайым эле биз каалагандай иштей бербейт."
- "Програмдык тилди үйрөнүү жаңы тил үйрөнгөндөй; шыр эле эркин сүйлөп кете албайсың."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Же эрте бүткөн окуучулардан кыйналып жаткан досторуна жардам берүүсүн сурангыла.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Майрамдагыла

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= resolve_url('https://code.org/certificates')%>) for your students.
- Окуучуларга [Мен "Код саатын өттүм"](<%= resolve_url('/promote/resources#stickers') %>) деген чаптама бастыргыла.
- Мектебиңизге [ логосу бар футболкаларды](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) жасатыңыз.
- Код саатыңыздын фото жана видеолорун социалдык желелерде бөлүшкүлө. #HourOfCode ж-а @codeorg хештег колдонуп, ийгилигиңизди бизге дагы билдиргиле!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Код саатынын үйрөтүүчүлөр үчүн дагы ресурсттар:

- [Код сааты форумуна](http://forum.code.org/c/plc/hour-of-code) кирип, башка үйрөтүүчүлөрдөн кеңеш жана колдоо алыңыз. <% if @country == 'us' %>
- [Код саатынын КБСин](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code) карагыла. <% end %>

## Код саатынан кийин эмне болот?

Код сааты технологиялардын иштешин терең изилдөөдө саякатындагы жана програмдык жабдууларды өндүрүүдөгү биринчи эле кадам. Бул саякатты улантуу үчүн:

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond')%>).
- Компүтердик технологиялар боюнча тажрыйбалуу адистер өткөзгөн 1 күндүк семинар-практикумга [катышкыла](<%= resolve_url('https://code.org/professional-development-workshops') %>). (АКШ үчүн гана)

<%= view :signup_button %>