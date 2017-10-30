---
title: '<%= hoc_s(:title_how_to) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code in after-school classes and clubs

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial

Vi erbjuder en mängd av [ roliga, timslånga guider](<%= resolve_url('/learn') %>) för deltagare i alla åldrar, skapade av en mängd partners. [Prova dem](<%= resolve_url('/learn') %>)

**Alla övningar i Hour of Code:**

- Require minimal prep-time for organizers
- Är självinstruerande så att alla kan jobba i sin takt på sin nivå

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promote your Hour of Code

Marknadsför din Hour of Code [med dessa verktyg](<%= resolve_url('/promote') %>) och uppmuntra andra att vara hålla egna evenemang.

## 4. Plan your technology needs - computers are optional

<div class="col-66" style="padding-right: 20px;">
  The best Hour of Code experience includes Internet-connected computers. But you **don’t** need a computer for every child, and you can even do the Hour of Code without a computer at all.
</div>

<div class="col-33">
  <img src="/images/fit-400/group_ipad.jpg" />
</div>

<div style="clear: both;"></div>

**Planera!** Gör följande steg innan evenemanget startar:

- **Testa övningarna på elevdatorer eller enheter.** Kontrollera att de fungerar korrekt (med ljud och video).
- **Fixa hörlurar till din klass**, eller be eleverna att ta med sig egna, om de övningar du väljer fungerar bäst med ljud.
- **Inte har tillräckligt många enheter?** Använd [parprogrammering](https://www.youtube.com/watch?v=vgkahOzFH2Q). När elever sitter i par, hjälper de varandra och behöver mindre stöttning av läraren. De ser också att programmering är socialt och bygger på samarbete.
- **Är tillgängligheten till internet för dålig?** Planera att se videor på gemensamt, så att varje elev inte behöver ladda ner sina egna videos. Eller prova unplugged / offline övningar.

## 5. Start your Hour of Code off with an inspiring video

Sparka igång din Hour of Code genom inspirerande deltagare och diskutera hur datavetenskap påverkar alla delar av våra liv.

**Visa en inspirerande video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh - there are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available.
- [Lanseringsvideon från Hour of Code 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) eller <% if @country == 'uk' %> [ videon för Hour of Code 2014](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %>[ Hour of Code 2015 videon](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
- [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Find more inspirational videos [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Det är okej om du är helt helt ny till datavetenskap. Här är några idéer att introducera din Hour of Code aktivitet:**

- Förklara hur teknik påverkar våra liv, med exempel som alla elever i klassrummet kommer att bry sig om och inte endast ett fåtal (berätta om appar och teknik som används för att rädda liv, hjälpa människor, och föra personer närmare, o. s. v.).
- Lista saker som använder kod i vardagslivet.
- Se tips på hur man kan få tjejer intresserade av datavetenskap [här](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Code!

**Visa eleverna till aktiviteten**

- Skriv länken till guiden på en whiteboard. Länken finns på [informationen för din valda handledning](<%= resolve_url('/learn') %>) under antalet deltagare.

**När någon stöter på problem är det okej att svara:**

- "Jag vet inte. Låt oss lista ut detta tillsammans."
- "Tekniken fungerar inte alltid som vi vill."
- "Att lära sig programmera är som att lära sig ett nytt språk: Du blir inte flytande på en gång."

**Vad gör man om en elev blir färdig tidigare?**

- Uppmuntra deltagarna att prova en annan Hour Of Code aktivitet på [hourofcode.com/learn](<%= resolve_url('/learn') %>)
- Eller be dem som slutför tidigt för att hjälpa andra som har problem.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Skriv ut diplom](<%= resolve_url('https://code.org/certificates') %>) för dina elever.
- [Skriva ut "Jag gjorde en timme av kod!"](<%= resolve_url('/promote/resources#stickers') %>) klistermärken för dina elever.
- [Beställ specialgjorda t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) till din skola.
- Dela foton och videoklipp från ditt Hour of Code på sociala medier. Använd #HourOfCode och @codeorg så vi kan se vad du gjort!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Other Hour of Code resources for educators

- Kolla in [bästa tipsen](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) från tidigare Hour of Code arrangörer. 
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Besök [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) för att få råd, insikt och stöd från andra arrangörer. <% if @country == 'us' %>
- Läs igenom [ vanliga frågor och svar](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Vad kan jag göra efter Hour of Code?

Hour of Code är bara första steget på en resa för att lära dig mer om hur teknik fungerar och hur du skapar egna program. För att fortsätta den här resan:

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
- [Delta](<%= resolve_url('https://code.org/professional-development-workshops') %>) i en 1-dags, i-person workshop att få undervisning från en erfaren datavetenskaps facilitator. (Endast för lärare i USA)

<%= view :signup_button %>