---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Cum sa sustii o Ora de Programare</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps.

## 1. Priveşte acest video indrumator <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) as well as [teacher-guided tutorials](<%= resolve_url('https://code.org/educate/teacher-led') %>) for participants of all ages, created by a variety of partners.

[![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promoveaza ora ta de cod

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Planificați-vă necesarul de echipamente - computerele sunt opționale

Cea mai buna experienta Hour of Code include calculatoare care au conexiune la Internet. Insa **nu aveti** nevoie de un computer pentru fiecare participant, chiar puteti sa organizati Hour of Code fara niciun calculator.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Oferiti-le casti elevilor din clasa dvs sau spuneti-le sa isi aduca ei propriile casti daca tutorialul pe care l-ati ales merge mai bine cu sunet.

**Nu aveti suficiente aparate?** Utilizaţi [ programarea in pereche](https://www.youtube.com/watch?v=vgkahOzFH2Q). Atunci când elevii au un partener, ei se ajută reciproc şi se bazează mai puţin pe profesor. Ei vor vedea, de asemenea, că programarea este socială şi colaborativă.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Arată-le un filmulet inspirational:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Găseşte mai multe [resurse inspirationale](<%= resolve_url('https://code.org/inspire') %>) şi [clipuri video](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Este in regula dacă atât tu cât şi elevii sunteti incepatori in domeniul tehnologiei computerului si programarii. Aici sunt unele idei ce te vor ajuta in activitatea ta Hour of Code:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Faceti o lista cu lucrurile la care folositi programarea in fiecare zi.
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls')%>).

## 6. Codeaza!

**Indruma elevii catre activitate**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**Când elevii intampina dificultăţi este bine să le răspundeti:**

- "Nu ştiu. Dar haideţi să ne dam seama de asta împreună."
- "Tehnologia nu funcţionează întotdeauna în modul în care vrem noi."
- "Învăţarea programarii este ca învăţarea unei limbi noi; nu veţi fi fluent imediat."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Sau îi puteți îndemna pe elevii ce au terminat prea devreme să îi ajute pe cei ce întâmpină probleme cu activitatea.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Sărbătoriti

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= resolve_url('https://code.org/certificates')%>) for your students.
- [Imprima autocolante cu textul "Am făcut o Ora de Programare!"](<%= resolve_url('/promote/resources#stickers') %>) pentru elevii dumneavoastră.
- [Comandă tricouri personalizate](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) pentru angajații tăi.
- Distribuiti fotografii şi înregistrări video ale evenimentului dumneavoastra Hour of Code pe social media. Utilizati #HourOfCode şi @codeorg, astfel încât putem evidenţia si noi succesul dumneavoastră!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Alte resurse Hour of Code pentru cadrele didactice:

- Vizitaţi [forum-ul pentru profesori Hour of Code](http://forum.code.org/c/plc/hour-of-code) pentru a obţine sfaturi, înţelegere şi sprijin din partea altor cadre didactice. <% if @country == 'us' %>
- Revedeti [ sectiunea Intrebari Frecvente ale site-ului Hour of Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Ce urmeaza dupa Hour of Code?

Hour of Code este doar primul pas într-o călătorie pentru a afla mai multe despre modul în care tehnologia funcționează şi cum se creează aplicațiile software. Pentru a continua această călătorie:

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond')%>).
- [Participați](<%= resolve_url('https://code.org/professional-development-workshops') %>) la un atelier de lucru de o zi, în persoană, pentru a primi instrucțiuni de la un facilitator experimentat în informatică. (Numai pentru educatori din SUA)

<%= view :signup_button %>
