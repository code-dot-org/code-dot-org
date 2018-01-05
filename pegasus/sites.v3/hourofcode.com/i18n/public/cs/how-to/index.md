---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Jak vyučovat jednu Hodinu kódu</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps. The Hour of Code is easy to run - even for beginners! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

Nejlepší zkušenost s Hodinou kódu je na počítačích připojených na Internet. Ale **nepotřebujete** počítač pro každé dítě a Hodinu Kódu můžete provozovat i bez počítače.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Poskytněte sluchátka pro třídu, nebo požádejte studenty, aby si přinesli své vlastní, když kurz pracuje nejlépe se zvukem.

**Nemáte dostatek zařízení?** Využij[programování ve dvojicích](https://www.youtube.com/watch?v=vgkahOzFH2Q). Pokud se studenti spojí do dvojic, budou si vzájemně pomáhat a budou méně závislí na vyučujícím. Uvidí také, že informatika je záležitost společenská a spolupráce.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Ukaž inspirující video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= resolve_url('https://code.org/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Třída uvede seznam věcí každodenního života používající kód.
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls')%>).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Já nevím. Vyřešme to společně."
- "Technologie nefunguje vždy tak, jak chceme."
- "Učit se programovat je jako učit se nový jazyk; nejde hned mluvit plynule."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Nebo požádejte studenty, kteří jsou brzy hotoví, aby pomohli spolužákům, kteří mají s aktivitou potíže.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= resolve_url('https://code.org/certificates')%>) for your students.
- [Tisk "Udělal jsem Hodinu kódu!"](<%= resolve_url('/promote/resources#stickers') %>) nálepek pro vaše studenty.
- [Objednejte si volitelné trička](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) pro vaší školu.
- Sdílejte fotografie a videa události Hodiny kódu na sociálních médií. Použijte #HourOfCode a @codeorg, umíme též zvýraznit váš úspěch!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Jiné zdroje Hodiny kódu pro pedagogy:

- Navštivte [fórum učitelů Hodiny kódu ](http://forum.code.org/c/plc/hour-of-code) získat radu, pochopení a podporu od ostatních pedagogů. <% if @country == 'us' %>
- Zkontrolujte si [FAQ Hodiny kódu ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Co následuje po Hodině kódu?

Hodina kódu je pouze první krok, na cestě k poučení o tom, jak technologie funguje, a jak vytvářet softwarové aplikace. K pokračování této cesty:

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond')%>).
- [Nvštivte](<%= resolve_url('https://code.org/professional-development-workshops') %>) jednodenní workshop, abyste získali instrukce od zkušeného moderátora informatiky. (Pouze USA pedagogové)

<%= view :signup_button %>