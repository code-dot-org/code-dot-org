---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Cum să predați o Oră de Programare în after-school-uri și cluburi

### Alăturaţi-vă mişcării şi introduceți un grup de elevi la prima lor oră de informatică urmând aceşti paşi. Ora de cod este ușor de rulat - chiar și pentru începători! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your after-school class or club.

---

## 1. Vizionați acest tutorial video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Alegeți un tutorial

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. [Încercați-le!](<%= resolve_url('/learn') %>)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promovați Ora dvs. de Cod

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4. Planificați-vă necesarul de echipamente - computerele sunt opționale

Cea mai buna experienta Hour of Code include calculatoare care au conexiune la Internet. Insa **nu aveti** nevoie de un computer pentru fiecare participant, chiar puteti sa organizati Hour of Code fara niciun calculator.

Testați neapărat tutorialele pe calculatoarele sau dispozitivele elevilor pentru a vă asigura că funcționează corespunzător pe browsere cu sunet și video. **Conexiune lentă la internet?** Planificați să rulați videoclipurile în fața clasei, astfel încât fiecare elev să nu mai descarce propriile videoclipuri. Sau încercaţi tutorialele unplugged / offline.

Oferiti-le casti elevilor din clasa dvs sau spuneti-le sa isi aduca ei propriile casti daca tutorialul pe care l-ati ales merge mai bine cu sunet.

**Nu aveti suficiente aparate?** Utilizaţi [ programarea in pereche](https://www.youtube.com/watch?v=vgkahOzFH2Q). Atunci când elevii au un partener, ei se ajută reciproc şi se bazează mai puţin pe profesor. Ei vor vedea, de asemenea, că programarea este socială şi colaborativă.

## 5. Începeți Ora de Programare cu un videoclip inspirațional

Puteti spori succesul evenimentului vostru Hour of Code inspirandu-i pe participanti sa discute despre care este impactul tehnologiei computerului si programarii asupra vietii noastre.

**Arată-le un filmulet inspirational:**

- Videoclipul original al lansării Hour of Code, care îi înfățișează pe Bill Gates, Mark Zuckerberg și starul NBA Chris Bosh - există version disponibile de [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc) sau [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA).
- [Videoclipul Ora de Cod la nivel mondial](https://www.youtube.com/watch?v=KsOIlDT145A)
- [ Preşedintele Obama invita pe toţi elevii să înveţe ştiinţa calculatoarelor](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Găsiţi mai multe videoclipuri inspiraționale [aici](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explicați modurile în care tehnologia are impact asupra vieților noastre, cu exemple pe care atât băieții cât si fetele le vor înțelege (Vorbiți despre aplicațiile și tehnologiile care sunt folosite în salvarea vieților, ajutarea oamenilor, conectarea lor etc.).
- Faceti o lista cu toate lucrurile ce necesita programare din viata de zi cu zi.
- Vezi sugestii pentru a le stârni fetelor interesul în informatică [aici](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Codați!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>) - Or, ask those who finish early to help others who are having trouble.

## 7. Sărbătoriti

- [Print certificates](<%= codeorg_url('/certificates') %>) for your students.
- [Imprima autocolante cu textul "Am făcut o Ora de Programare!"](<%= resolve_url('/promote/resources#stickers') %>) pentru elevii dumneavoastră.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Distribuiti fotografii şi înregistrări video ale evenimentului dumneavoastra Hour of Code pe social media. Utilizati #HourOfCode şi @codeorg, astfel încât putem evidenţia si noi succesul dumneavoastră!

## Alte resurse de o oră de cod pentru educatori

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Revedeti [ sectiunea Intrebari Frecvente ale site-ului Hour of Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Ce urmeaza dupa Hour of Code?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](<%= codeorg_url('/learn/beyond') %>)!

<%= view :signup_button %>