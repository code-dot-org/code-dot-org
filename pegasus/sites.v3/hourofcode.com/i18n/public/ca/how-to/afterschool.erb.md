---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Com ensenyar una Hora del Codi en extraescolars i entitats

### Uneix-te al moviment i introdueix a un grup d'estudiants en la seva primera hora d'informàtica amb aquests passos. L'Hora del Codi és fàcil d'utilitzar - fins i tot per a principiants! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your after-school class or club.

---

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Escull un tutorial

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. Prova'ls!

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

The best Hour of Code experience includes Internet-connected computers. Però **no** necessites un ordinador per a cada nen, i fins i tot pots fer l'Hora del Codi sense cap ordinador.

Assegura't de provar els tutorials en els ordinadors o dispositius dels estudiants per garantir que funcionen correctament en navegadors amb so i vídeo. **Tens poc ample de banda?** Planeja mostrar els vídeos des de davant de la classe per tal d'evitar que cada estudiant es descarregui els seus propis vídeos. O prova els tutorials desconnectats / fora de línia.

Proporciona auriculars a la teva classe, o demana als estudiants que se'n portin de propis, si el tutorial que esculls funciona millor amb so.

**Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quan els estudiants s'associen, s'ajuden mútuament i depenen menys del professor. Ells veuen també que la informàtica és social i col·laborativa.

## 5. Comença la teva Hora del Codi amb un vídeo inspirador

Kick off your Hour of Code by inspiring participants and discussing how computer science impacts every part of our lives.

**Show an inspirational video:**

- El vídeo original de llançament de Code.org, amb en Bill Gates, en Mark Zuckerber i l'estrella de la NBA Chris Bosh - hi ha versions [d'1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuts](https://www.youtube.com/watch?v=nKIu9yen5nc) i [9 minuts](https://www.youtube.com/watch?v=dU1xS07N-FA) disponibles.
- El [vídeo de l'Hora del Codi arreu del món](https://www.youtube.com/watch?v=KsOIlDT145A)
- [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Troba més vídeos inspiracionals [aquí](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explica la manera en que la tecnologia impacta en les nostres vides, amb exemples que interessin tant a nens com a nenes (parla sobre aplicacions i tecnologia que s'utilitzen per a salvar vides, ajudar les persones, connectar-les, etc.).
- Faci una llista sobre els aparells de la vida quotidiana que utilitzen codi.
- Mira alguns consells per aconseguir que les noies s'interessin per la informàtica [aquí](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Code!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>) - Or, ask those who finish early to help others who are having trouble.

## 7. Celebrate

- [Print certificates](<%= codeorg_url('/certificates') %>) for your students.
- [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers for your students.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Comparteixi fotos i vídeos del seu esdeveniment de l'Hora del Codi a les xarxes socials utilitzant les etiquetes #HourOfCode i @codeorg per poder destacar el seu èxit!

## Altres recursos de l'Hora del Codi per a educadors

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Què ve després de l'Hora del Codi?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](<%= codeorg_url('/learn/beyond') %>)!

<%= view :signup_button %>