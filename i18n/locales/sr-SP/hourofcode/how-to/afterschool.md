---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Како подучавати један час кодирања у ваннаставним активностима и школским клубовима

### Прикључи се покрету и представи групи ученика њихов први час рачунарства са овим корацима. Час кодирања је лако покренути - чак и за почетнике! If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your after-school class or club.

* * *

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Изаберите упутства

We provide a variety of [fun, hour-long tutorials](%= resolve_url('/learn') %) for participants all ages, created by a variety of partners. [Try them out!](%= resolve_url('/learn') %)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](%= resolve_url('/learn') %)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](%= resolve_url('/promote') %) and encourage others to host their own events.

## Планирајте ваше технолошке потребе - рачунари нису обавезни

The best Hour of Code experience includes Internet-connected computers. **Није** потребан рачунар за свако дете а час кодирања можете одржавати и без рачунара.

Свакако тестирајте водиче о ученичким рачунарима или уређајима како би се осигурало да раде исправно у прегледачима са звуком и видео записом. **Имате мали бендвич?** Планирајте да покажете видео записе испред разреда, тако да сваки студент не би морао да преузима своје личне видео записе. Или покушајте с упутствима ван мреже.

Омогућите слушалице за своје ученике или их питајте да донесу своје, ако упутство које сте изабрали ради боље с звуком.

**Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Када ученици раде с партнером, они помажу један другоме и мање се ослањају на наставника. They’ll also see that computer science is social and collaborative.

## Започните свој час кодирања с инспиративним видео записом

Kick off your Hour of Code by inspiring participants and discussing how computer science impacts every part of our lives.

**Show an inspirational video:**

- Оригинални Code.org видео запис у ком учествују Бил Гејтс, Марк Закерберг и НБА звезда Крис Бош - овде су [1 минутна](https://www.youtube.com/watch?v=qYZF6oIZtfc),[5 минутна](https://www.youtube.com/watch?v=nKIu9yen5nc), и [9 минутна](https://www.youtube.com/watch?v=dU1xS07N-FA) верзија.
- [Видео запис светског часа кодирања](https://www.youtube.com/watch?v=KsOIlDT145A)
- [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Пронађите више инспиративних видео записа [овде](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**У реду је ако вам је рачунарство потпуна непознаница. Ево неколико идеја како да спроведете активности везане за Час програмирања:**

- Објасните како технологија утиче на наше животе, с примерима који ће бити занимљиви како дечацима, тако и девојчицама (разговарајте о апликацијама и технологији која се користи за спашавање живота, помоћ људима, повезује људе итд).
- Набројите ствари које користе програм - код у свакодневном животу.
- See tips for getting girls interested in computer science [here](%= resolve_url('https://code.org/girls') %).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Code!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](%= resolve_url('/learn') %) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](%= resolve_url('/learn') %) - Or, ask those who finish early to help others who are having trouble.

## 7. Celebrate

- [Print certificates](%= codeorg_url('/certificates') %) for your students.
- [Print "I did an Hour of Code!"](%= resolve_url('/promote/resources#stickers') %) stickers for your students.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Share photos and videos of your Hour of Code event on social media. Use #HourOfCode and @codeorg so we can highlight your success, too!

## Други извори часа кодирања за наставнике

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## What comes after the Hour of Code?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](%= codeorg_url('/learn/beyond') %)!

<%= view :signup_button %>