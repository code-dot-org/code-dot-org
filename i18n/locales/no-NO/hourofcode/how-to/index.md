* * *

title: <%= hoc_s(:title_how_to) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# Hvordan undervise i kodetimen 

Join the movement and introduce a group of students to their first hour of computer science with these steps:

## 1) Se denne videoen <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Choose a tutorial for your hour:

I samarbeid med våre partnere har vi laget flere [morsomme entimes oppgaver](%= resolve_url('https://code.org/learn') %) tilpasset alderstrinn.

**[Elevstyrte kodetimeoppgaver:](%= resolve_url("https://code.org/learn") %)**

  * Krever minimalt med tid til forberedelser fra læreren
  * Er tilrettelagt for at studentene skal arbeide på egen hånd i eget tempo og tilpasset deres ferdighetsnivå

**[Lærerstyrte kodetimeoppgaver:](%= resolve_url("https://code.org/educate/teacher-led") %)**

  * Er oppgaver som krever at læreren gjør noen forberedelser
  * Er kategorisert etter klassetrinn *og*fag (f. eks. matte, engelsk etc.)

[![](/images/fit-700/tutorials.png)](%= resolve_url('https://code.org/learn') %)

## 3) Spre ordet om Kodetimen

Spre ordet om Kodetimen [med disse verktøyene](%= resolve_url('/promote') %) og oppmuntre andre å arrangere sine egne kodetimer.

## 4) Planlegg hva du har bruk for av utstyr - datamaskiner er valgfrie

Den beste Kodetimen opplevelsen inkluderer Internett-tilkoblede datamaskiner. Men du trenger **ikke** en datamaskin hver for alle barn, og du kan til og med gjennomføre Kodetimen uten en datamaskin i det hele tatt.

**Planlegg!** Gjør følgende før arrangementet starter:

  * Prøv å gå igjennom et av undervisningsoppleggene fra elevenes pc-er på forhånd. Sjekk at både lyd og video fungerer optimalt.
  * Ta med hodetelefoner til elevene dine, eller be de ta med sine egne, dersom opplegget du har valgt fungerer best med lyd.
  * **Har du ikke nok enheter?** Bruk [parprogrammering](https://www.youtube.com/watch?v=vgkahOzFH2Q). Når elevene jobber to og to, vil de hjelpe hverandre og være mindre avhengige av læreren. De vil også oppleve at programmering er sosialt og handler om samarbeid.
  * **Har dere dårlig eller treg internettforbindelse?** Planlegg å vise videoene for hele klassen samlet, slik at hver elev ikke trenger å laste ned sine egne videoer. Eller prøv de leksjonene som kan gjøres uten tilkobling til nett.

![](/images/fit-350/group_ipad.jpg)

## 5) Start Kodetimen med en inspirerende foreleser eller video

**Inviter en[lokal frivillig](https://code.org/volunteer/local)til å inspirere elevene med å fortelle om bredden og mulighetene innen informatikk.**Det er tusenvis av frivillge verden over som er klare for å hjelpe til med Kodetimen deres. [Bruk dette kartet ](https://code.org/volunteer/local)for å finne lokale frivillige som kan besøke klasserommet deres eller bli med på en video-chat med deres elever.

[![](/images/fit-300/volunteer-map.png)](%= resolve_url('https://code.org/volunteer/local') %)

**Vis en inspirerende video:**

  * Bill Gates, Mark Zuckerberg og NBA stjernen Chris Bosh var med i den opprinnelige lanseringsvideoen for Code.org (Det finnes versjoner på [ett minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutter](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutter](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama oppfordrer alle elever til å lære datavitenskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Find more inspirational [resources](%= resolve_url('https://code.org/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Det er helt greit om du og elevene dine ikke er kjent med datavitenskap fra før. Her er noen ideer til hvordan du kan introdusere kodetimen din:**

  * Forklar hvordan teknologi påvirker livene våre. Bruk gjerne eksempler somo både jenter og gutter kan kjenne seg igjen i. (Snakk om å redde liv, hjelpe andre eller om sosiale medier f. eks.).
  * Lag en liste over dagligdagse ting som er laget gjennom koding.
  * Se tips for å få jenter interessert i informatikk [her](%= resolve_url('https://code.org/girls') %).

**Trenger du mer veiledning?**Last ned en [undervisningsmal](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Ønsker du flere undervisning ideer?** Sjekk ut de [beste tipsene](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) fra erfarne lærere.

## 6) Koding!

**Sett i gang elevene med aktiviteten**

  * Skriv oppgavelenken på en tavle. Finn lenken under [informasjon for den valgte oppgaven](%= resolve_url('https://code.org/learn') %) under antall deltakere.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**Når elevene har spørsmål eller synes noe er vanskelig, er det greit å svare:**

  * "Jeg vet ikke. La oss finne ut sammen."
  * «Det er ikke alltid teknologien oppfører seg slik vi ønsker.»
  * "Å lære seg å programmere er som å lære seg et nytt språk; Du kan ikke være flytende med en gang."

**[Undervisningstips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Hva kan jeg gjøre hvis en elev blir tidlig ferdig?**

  * Elevene kan gå finne flere aktiviteter her: <%= resolve_url('code.org/learn') %>[<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %)
  * Eller du kan be de elevene som blir fort ferdige om å hjelpe de som sliter med å få det til.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Feir deres suksess

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [Skriv ut diplomer](%= resolve_url('https://code.org/certificates') %) for elevene.
  * [Print ut "Jeg gjennomførte Kodetimen!"](%= resolve_url('/promote/resources#stickers') %) klistremerker til elevene dine.
  * [Bestill t-skjorter ](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)til skolen din.
  * Del bilder og videoer av Kodetimen arrangement på sosiale medier. Bruk #HourOfCode og @codeorg så vi kan fremheve din suksess også!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Andre Kodetimen ressurser for lærere:

  * Bruk [denne](/files/EducatorHourofCodeLessonPlanOutline.docx) malen for å organisere din Kodetime.
  * Se hva andre lærere har [lykkes med](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) i tidligere kodetimer. 
  * Se på innspillingen av vår [Lærerens Guide til Kodetimen webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Besøk [Kodetimens lærerforum](http://forum.code.org/c/plc/hour-of-code) for å få råd, innsikt og støtte fra andre lærere. <% if @country == 'us' %>
  * Se på [Kodetimens ofte stilte spørsmål](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Hva kommer etter Kodetimen?

Kodetimen er bare første steget på en reise for å lære seg mer om hvordan teknologi fungerer og hvordan du lager dine egne programmer. For å fortsette på denne reisen:

  * Oppmuntre elevene til å fortsette å [lære på nettet](%= resolve_url('https://code.org/learn/beyond') %).
  * [Møt opp på](%= resolve_url('https://code.org/professional-development-workshops') %) en 1-dags workshop for å lære av en erfaren instruktør i datavitenskap. Context | Request Context. (Bare USAs lærere)

<%= view :signup_button %>