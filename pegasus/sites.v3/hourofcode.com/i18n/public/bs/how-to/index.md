---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Kako podučavati jedan čas Časa Kodiranja</h1>

Priključi se pokretu i predstavi grupi učenika njihov prvi čas računarstva sa ovim koracima. Čas Kodiranja je lako pokrenuti - čak i za početnike! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Izaberite tutorijal za svoj čas

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Učenici rade aktivnosti sami, iako mnoge lekcije uključuju plan lekcije za učitelje (vidjet ćete link kada kliknete aktivnost) da vode raspravu ili produže aktivnost. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promoviši svoj Čas Kodiranja [ sa ovim alatkama](<%= resolve_url('/promote/resources') %>) i ohrabri druge da budu domaćini vlastitim događajima.

## 4. Plan your technology needs - computers are optional

Najbolja Čas Kodiranja iskustva uključuju kompjutere koji su povezani s internetom. But you **don’t** need a computer for every child, and you can even do the Hour of Code without a computer at all.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Provide headphones for your class, or ask students to bring their own, if the tutorial you choose works best with sound.

**Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). When students partner up, they help each other and rely less on the teacher. Oni će također vidjeti da je računarstvo socijalno i kolaborativno.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Pokaži inspiracioni video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Kao razred, napravite popis stvari koje koriste kod u svakodnevom životu.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. Code!

**Direct students to the activity**

- Napiši link tutorijala na tabli. Nađi link naveden na[informacije za odabrani tutorijal](<%= resolve_url('/learn')%>)pod brojem učesnika.

**When your students come across difficulties it's okay to respond:**

- "Ne znam. Hajdemo ovo riješiti zajedno."
- "Tehnologija nije uvijek onakva kavu mi želimo."
- “Learning to program is like learning a new language; you won’t be fluent right away.”

**Šta ako učenik završi ranije?**

- Učenici mogu vidjeti sve tutorijale i [ pokušati novu aktivnost Časa Kodiranja](<%= resolve_url('/learn')%>).
- Ili pitaj učenike koji završe ranije da pomognu kolegama koji imaju problema s aktivnosti.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Slaviti

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers for your students.
- [Naruči prilagođene majice](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) za tvoju školu.
- Share photos and videos of your Hour of Code event on social media. Use #HourOfCode and @codeorg so we can highlight your success, too!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Ostala sredstva Časa Kodiranja za vaspitače:

- Visit the [Hour of Code Teacher Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other educators. <% if @country == 'us' %>
- Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Šta dolazi poslije Časa Kodiranja?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>