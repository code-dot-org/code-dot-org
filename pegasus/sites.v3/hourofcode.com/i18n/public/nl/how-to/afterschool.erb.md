---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Zo kunt u een 'Hour of 'Code' onderwijzen op de na-schoolse opvang of in een club

### Word lid van de beweging en laat een groep studenten kennismaken met hun eerste 'Hour of Code' met deze stappen. Het 'Hour of Code' is makkelijk te geven - zelfs voor beginners! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your after-school class or club.

---

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Kies een tutorial

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. [Probeer ze uit](<%= resolve_url('/learn') %>)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4. Bereid de techniek voor - computers zijn optioneel

De beste CodeUur ervaring beleef je met computers die met internet verbonden zijn. Maar je **hebt geen** computer nodig voor elk kind apart, en je kunt zelfs het CodeUur zonder een computer doen.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Voorzie koptelefoons voor uw klas, of vraag de leerlingen om ze zelf mee te nemen, als de tutorial het beste met geluid werkt.

**Heeft u niet genoeg apparatuur?** Maak dan [tweetallen](https://www.youtube.com/watch?v=vgkahOzFH2Q). Als leerlingen in paren werken helpen ze elkaar en zijn ze minder afhankelijk van de leerkracht. Ze zullen ook inzien dat programmeren sociaal is en samenwerking vereist.

## 5. Start your Hour of Code off with an inspiring video

Begin uw CodeUur door de deelnemers te inspireren en bespreek hoe groot de invloed van programmeren is in ons leven.

**Laat een inspirerende video zien:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh - there are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available.
- The [Hour of Code Worldwide video](https://www.youtube.com/watch?v=KsOIlDT145A)
- [President Obama roept alle leerlingen op om zich te verdiepen in computerwetenschappen](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Find more inspirational videos [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways technology impacts our lives, with examples both boys and girls will care about (Talk about apps and technology that is used to save lives, help people, connect people etc).
- Maak een lijst van dingen die gebruik maken van codes in het dagelijks leven.
- Zie [hier](<%= resolve_url('https://code.org/girls') %>) tips om meisjes ook geïnteresseerd te krijgen in programmeren.

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Code!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>) - Or, ask those who finish early to help others who are having trouble.

## 7. Celebrate

- [Print certificates](<%= codeorg_url('/certificates') %>) for your students.
- [Print de "Ik heb meegedaan met CodeUur!"](<%= resolve_url('/promote/resources#stickers') %>) stickers voor uw leerlingen.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Deel foto's en video's van uw CodeUur evenement op sociale media. Gebruik de hashtag #HourOfCode en @codeorg zodat wij ook uw succes kunnen zien!

## Other Hour of Code resources for educators

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Bekijk het [CodeUur FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Wat komt er na het CodeUur?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](<%= codeorg_url('/learn/beyond') %>)!

<%= view :signup_button %>