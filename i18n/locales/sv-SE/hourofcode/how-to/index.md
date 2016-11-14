* * *

title: <%= hoc_s(:title_how_to) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# Hur man undervisar en timme av kod

Gå med i rörelsen och introducera en grupp studenter till deras första timmen av datavetenskap med dessa steg:

## 1) Titta på den här videon <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Välj en övning för din timme:

Vi erbjuder en mängd [roliga, timslånga guider](%= resolve_url('https://code.org/learn') %) för deltagare i alla åldrar, skapade av en mängd partners.

**[Elevledda Hour of Code guider:](%= resolve_url("https://code.org/learn") %)**

  * Kräver minimal förberedelse för lärare
  * Är självinstruerande så att alla kan jobba i sin takt på sin nivå

**[Lärarledda Hour of Code guider:](%= resolve_url("https://code.org/educate/teacher-led") %)**

  * Är lektionsplaneringar som kräver vissa förberedelser av lärare
  * Är kategoriserade efter årskurs *och* av ämnesområde (t. ex matematik, engelska, etc)

[![](/images/fit-700/tutorials.png)](%= resolve_url('https://code.org/learn') %)

## 3) Marknadsför din Hour of Code

Marknadsför din Hour of Code [med dessa verktyg](%= resolve_url('/promote') %) och uppmuntra andra att vara hålla egna evenemang.

## 2) Vad behöver du för teknik? Datorer är inte nödvändiga

Den bästa Hour of Code erfarenheten fås med datorer med internet. Men du behöver **inte** en dator för varje barn, och du kan även göra Hour of Coode utan datorer.

**Planera!** Gör följande steg innan evenemanget startar:

  * **Testa övningarna på elevdatorer eller enheter.** Kontrollera att de fungerar korrekt (med ljud och video).
  * **Fixa hörlurar till din klass**, eller be eleverna att ta med sig egna, om de övningar du väljer fungerar bäst med ljud.
  * **Inte har tillräckligt många enheter?** Använd [parprogrammering](https://www.youtube.com/watch?v=vgkahOzFH2Q). När elever sitter i par, hjälper de varandra och behöver mindre stöttning av läraren. De ser också att programmering är socialt och bygger på samarbete.
  * **Är tillgängligheten till internet för dålig?** Planera att se videor på gemensamt, så att varje elev inte behöver ladda ner sina egna videos. Eller prova unplugged / offline övningar.

![](/images/fit-350/group_ipad.jpg)

## 5) Starta din Hour of Code med en inspirerande talare eller video

**Bjud in [lokala volontärer](https://code.org/volunteer/local) att inspirera dina elever genom att tala om bredden av möjligheter inom datavetenskap.** Det finns tusentals volontärer runt om i världen som är redo att hjälpa med din Hour of Code. [Använd denna karta](https://code.org/volunteer/local) för att hitta lokala volontärer som kan besöka ditt klassrum eller ansluta till en videochatt med dina elever.

[![](/images/fit-300/volunteer-map.png)](%= resolve_url('https://code.org/volunteer/local') %)

**Visa en inspirerande video:**

  * Originalvideon från lanseringen av Code.org, där bland annat Bill Gates, Mark Zuckerberg och basketstjärnan Chris Bosh är med (det finns olika versioner som är [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuter](https://www.youtube.com/watch?v=nKIu9yen5nc) och [9 minuter](https://www.youtube.com/watch?v=dU1xS07N-FA) långa)
  * [Lanseringsvideon från Hour of Code 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) eller <% if @country == 'uk' %> [ videon för Hour of Code 2014](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %>[ Hour of Code 2015 videon](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama uppmanar alla elever att lära sig datavetenskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Find more inspirational [resources](%= resolve_url('https://code.org/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Det är okej om du är alla helt ny med datavetenskap. Här är några idéer för hur du introducerar din Hour of Code aktivitet:**

  * Förklara hur teknik påverkar våra liv, med exempel som alla elever i klassrummet kommer att bry sig om och inte endast ett fåtal (berätta om appar och teknik som används för att rädda liv, hjälpa människor, och föra personer närmare, o.s.v.).
  * Gör en lista med vardagsprylar som använder kod tillsammans med dina elever.
  * Se tips för att få tjejer intresserade av datavetenskap [här](%= resolve_url('https://code.org/girls') %).

**Behöver du mer vägledning?** Ladda ner [mall för lektionsplanering](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Vill ha mer undervisning idéer?** Kolla in [bästa tipsen ](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) från erfarna utbildare.

## 6) Koda!

**Visa eleverna till aktiviteten**

  * Skriv länken till guiden på en whiteboard. Länken listas på [informationen för din valda handledning](%= resolve_url('https://code.org/learn') %) under antalet deltagare.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**När någon stöter på problem är det okej att svara:**

  * "Jag vet inte. Låt oss lista ut detta tillsammans."
  * "Tekniken inte alltid fungerar som vi vill."
  * "Att lära sig programmera är som att lära sig ett nytt språk: Du blir inte flytande på en gång."

**[Kolla in dessa undervisning tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Vad gör man om en elev blir färdig tidigare?**

  * Studenter kan se alla guider och prova en annan Hour of Code aktivitet på [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %)
  * Eller, be elever som blir snabbt färdiga att hjälpa klasskamrater som behöver hjälp.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Fira

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [Skriv ut diplom](%= resolve_url('https://code.org/certificates') %) för dina elever.
  * [Skriva ut "Jag gjorde en timme av kod!"](%= resolve_url('/promote/resources#stickers') %) klistermärken för dina elever.
  * [Beställ t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) för din skola.
  * Dela foton och videoklipp från ditt Hour of Code på sociala medier. Använd #HourOfCode och @codeorg så vi kan se vad du gjort!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Andra Hour of Code resurser för lärare:

  * Använd denna [mall för lektionsplanering](/files/EducatorHourofCodeLessonPlanOutline.docx) för att organisera din Hour of Code.
  * Kolla in [bästa tipsen](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) från tidigare Hour of Code arrangörer. 
  * Titta på inspelningen av vår [Utbildarhandledning till Hour of Code](https://youtu.be/EJeMeSW2-Mw).
  * [Delta på en Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) med vår grundare, Hadi Partovi att förbereda dig inför Hour of Code.
  * Besök [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) för att få råd, insikt och stöd från andra arrangörer. <% if @country == 'us' %>
  * Läs igenom [ vanliga frågor och svar](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Vad kommer efter kodtimmen?

Hour of Code är bara första steget på en resa för att lära dig mer om hur teknik fungerar och hur du skapar egna program. För att fortsätta den här resan:

  * Uppmuntra eleverna att fortsätta att [lära sig på nätet](%= resolve_url('https://code.org/learn/beyond') %).
  * [Delta](%= resolve_url('https://code.org/professional-development-workshops') %) i en 1-dags, i-person workshop att få undervisning från en erfaren datavetenskaps facilitator. (Endast för lärare i USA)

<%= view :signup_button %>