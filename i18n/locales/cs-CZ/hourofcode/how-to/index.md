---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Jak vyučovat jednu Hodinu kódu</h1>

Přidejte se k hnutí a absolvujte se skupinou studentů jejich první hodinu informatiky podle těchto kroků. Hodina kódu je jednoduchá i pro začátečníky! If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your class.

## 1. Pusťte si toto video "jak na to" <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Zvolte kurz pro vaše hodiny

We provide a variety of fun, [student-guided tutorials](%= resolve_url('/learn') %) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](%= resolve_url('/promote/resources') %) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

Nejlepší zkušenost s Hodinou kódu je na počítačích připojených na Internet. Ale **nepotřebujete** počítač pro každé dítě a Hodinu Kódu můžete provozovat i bez počítače.

Otestujte si návody na počítačích nebo zařízení studentů a skontrolujte, že fungují správně v prohlížečích se zvukem a videem. **Nízká rychlost internetu?** Pusťte videa hromadně pro celou třídu, aby nemuseli studenti stahovat videa osobně. Nebo zkuste offline návody.

Rozdejte sluchátka studentům, nebo požádejte studenty, aby si přinesli své vlastní, když kurz pracuje nejlépe se zvukem.

**Nemáte dostatek zařízení?** Využijte [párové programování](https://www.youtube.com/watch?v=vgkahOzFH2Q) (video je v angličtině). Pokud se studenti spojí do dvojic, budou si vzájemně pomáhat a budou méně závislí na vyučujícím. Uvidí také, že informatika je společenská a týmová záležitost.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Ukaž inspirativní video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Třída uvede seznam věcí každodenního života používající kód.
- See tips for getting girls interested in computer science [here](%= codeorg_url('/girls')%).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](%= resolve_url('/learn')%) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Já nevím. Vyřešme to společně."
- "Technologie nefunguje vždy tak, jak chceme."
- "Učit se programovat je jako učit se nový jazyk; nejde hned mluvit plynule."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](%= resolve_url('/learn')%).
- Nebo požádejte studenty, kteří jsou brzy hotoví, aby pomohli spolužákům, kteří mají s aktivitou potíže.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](%= codeorg_url('/certificates')%) for your students.
- [Tisk "Udělal jsem Hodinu kódu!"](%= resolve_url('/promote/resources#stickers') %) nálepek pro vaše studenty.
- [Objednejte si volitelné trička](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) pro vaší školu.
- Sdílejte fotografie a videa události Hodiny kódu na sociálních médií. Použijte #HourOfCode a @codeorg, umíme též zvýraznit váš úspěch!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Jiné zdroje Hodiny kódu pro pedagogy:

- Navštivte [fórum učitelů Hodiny kódu ](http://forum.code.org/c/plc/hour-of-code) získat radu, pochopení a podporu od ostatních pedagogů. <% if @country == 'us' %>
- Projděte si [Nejčastěji kladené otázky (FAQ) Hodiny Kódu ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Co následuje po Hodině kódu?

Hodina kódu je pouze první krok, na cestě k poučení o tom, jak technologie funguje, a jak vytvářet softwarové aplikace. K pokračování této cesty:

- Encourage students to continue to [learn online](%= codeorg_url('/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>