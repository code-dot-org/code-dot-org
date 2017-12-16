---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Hoe begeleid je een CodeUur</h1>

Word lid van de beweging en laat een groep studenten kennismaken met hun eerste 'Hour of Code' met deze stappen. Het 'Hour of Code' is makkelijk te geven - zelfs voor beginners! Wilt u een extra set handen om te helpen, dan kunt u een [ lokale vrijwilliger](<%= resolve_url('https://code.org/volunteer/local') %>) vragen om te helpen een 'Hour of Code' te geven in uw klas.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Bereid de techniek voor - computers zijn optioneel

De beste CodeUur ervaring beleef je met computers die met internet verbonden zijn. Maar je **hebt geen** computer nodig voor elk kind apart, en je kunt zelfs het CodeUur zonder een computer doen.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Voorzie koptelefoons voor uw klas, of vraag de leerlingen om ze zelf mee te nemen, als de tutorial het beste met geluid werkt.

**Heeft u niet genoeg apparatuur?** Maak dan [tweetallen](https://www.youtube.com/watch?v=vgkahOzFH2Q). Als leerlingen in paren werken helpen ze elkaar en zijn ze minder afhankelijk van de leerkracht. Ze zullen ook inzien dat programmeren sociaal is en samenwerking vereist.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Laat een inspirerende video zien:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Vind meer inspirerende [middelen](<%= resolve_url('https://code.org/inspire') %>) en [video 's](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Noem dingen op waarmee codering wordt gebruikt.
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls')%>).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Ik weet het niet. Laten we het samen oplossen."
- "Technologie werkt niet altijd op de manier waarop we dat willen."
- "Leren programma is als het leren van een nieuwe taal; je zal het niet gelijk onder de knie hebben."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Of, vraag de leerlingen die snel klaar zijn om klasgenoten te helpen die meer moeite hebben met de activiteit.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= resolve_url('https://code.org/certificates')%>) for your students.
- [Print de "Ik heb meegedaan met CodeUur!"](<%= resolve_url('/promote/resources#stickers') %>) stickers voor uw leerlingen.
- [Bestel custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) voor uw school.
- Deel foto's en video's van uw CodeUur evenement op sociale media. Gebruik de hashtag #HourOfCode en @codeorg zodat wij ook uw succes kunnen zien!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Andere CodeUur bronnen voor docenten:

- Bezoek het [CodeUur leraren Forum](http://forum.code.org/c/plc/hour-of-code) om advies, inzicht en steun van andere docenten te krijgen. <% if @country == 'us' %>
- Bekijk het [CodeUur FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Wat komt er na het CodeUur?

Het CodeUur is slechts de eerste stap op een reis naar meer informatie over hoe technologie werkt en hoe softwaretoepassingen kunt maken. Zet deze reis voort:

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond')%>).
- [Woon](<%= resolve_url('https://code.org/professional-development-workshops') %>) een 1-dag in-persoon workshop bij, om instructie te krijgen over programmeren van een ervaren programmeur. (Alleen VS leraren)

<%= view :signup_button %>