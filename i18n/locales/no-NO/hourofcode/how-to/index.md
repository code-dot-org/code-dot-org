---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### Bli med og introduser en gruppe elever til deres første time i informatikk ved å følge disse stegene. Kodetimen er enkel å organisere, selv for nybegynnere! Hvis du trenger litt hjelp, kan du ta kontakt med en [lokal frivillig](%= resolve_url('https://code.org/volunteer/local') %) som kan hjelpe til med å organisere Kodetimen for klassen din.

### Take a look at our [participation guide if you still have questions](%= localized_file('/files/participation-guide.pdf') %).

* * *

## 1. Se denne veiledningsvideoen <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Velg et undervisningsopplegg

We provide a variety of fun, [student-guided tutorials](%= resolve_url('/learn') %) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Markedsfør Kodetimen din

Promote your Hour of Code [with these tools](%= resolve_url('/promote/resources') %) and encourage others to host their own events.

## 4. Planlegg hva du trenger av utstyr - datamaskin er valgfritt

Best resultater får du om du kjører Kodetimen på Internett-tilkoblede maskiner. Men du trenger **ikke** en datamaskin per elev, og du kan til og med gjennomføre Kodetimen uten datamaskiner.

Husk å teste at alle delene av undervisningsopplegget fungerer med lyd og bilde i nettleseren på elevenes datamaskiner eller enheter. **Har dere dårlig eller treg internettforbindelse?** En løsning er å vise videoene for hele klassen samlet, slik at ikke hver elev trenger å laste ned hver sine. En annen er å bruke de oppgavene og veiledningene som ikke krever nettilgang.

Ta med hodetelefoner til elevene dine, eller be de ta med sine egne, dersom opplegget du har valgt fungerer best med lyd.

**Har du ikke nok enheter?** Bruk [parprogrammering](https://www.youtube.com/watch?v=vgkahOzFH2Q). Når elevene jobber to og to, vil de hjelpe hverandre og være mindre avhengige av læreren. De vil også oppleve at programmering er sosialt og handler om samarbeid.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start Kodetimen med en inspirerende foreleser eller en video

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Vis en inspirerende video:**

- Den opprinnelige lanseringsvideoen fra Code.org med Bill Gates, Mark Zuckerberg og NBA-stjerne Chris Bosh. (Finnes i versjoner på [1 minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutter](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutter](https://www.youtube.com/watch?v=dU1xS07N-FA).)
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Forklar hvordan informasjonsteknologi påvirker livene våre. Bruk gjerne eksempler som både jenter og gutter kan kjenne seg igjen i (snakk om hvordan teknologi kan redde liv, forenkle hverdagen vår, om sosiale medier og kommunikasjon, o. l.).
- Gå sammen i klassen om å lage en liste over ting vi bruker i hverdagen, som inneholder programkode.
- Se tips for å få jenter interessert i dataprogrammering [her](%= codeorg_url('/girls')%).

## 6. Koding!

**Direct students to the activity**

- Skriv adressen til oppgaven på tavlen. Adressen finner du sammen med annen [informasjon om den valgte aktiviteten](%= resolve_url('/learn')%), nedenfor deltagerantaller.

**When your students come across difficulties it's okay to respond:**

- "Jeg vet ikke. La oss finne det ut sammen."
- "Det er ikke alltid teknologien oppfører seg slik vi ønsker."
- "Å lære seg å programmere er som å lære seg et nytt språk; du kan det ikke flytende med en gang."

**What if a student finishes early?**

- Eleven kan prøve seg på en av de [andre Kodetimen-aktivitetene](%= resolve_url('/learn')%).
- Eller du kan be de elevene som blir fort ferdige om å hjelpe de som sliter med å få det til.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Feiring

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Skriv ut diplomer](%= resolve_url('https://code.org/certificates') %) for elevene.
- [Skriv ut "Jeg gjennomførte Kodetimen!"](%= resolve_url('/promote/resources#stickers') %)-klistremerker til elevene.
- [Bestill t-skjorter ](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)til skolen din.
- Del bilder og videoer av Kodetimen-arrangement på sosiale medier. Bruk emneknaggene #kodetimen, #HourOfCode og @codeorg så vi også kan dra nytte av dine erfaringer. Husk å spørre barna om tillatelse til å dele bilder der de er med!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Andre Kodetimen-ressurser for lærere:

- Besøk [Kodetimens lærerforum](http://forum.code.org/c/plc/hour-of-code) for å få råd, innsikt og støtte fra andre lærere. <% if @country == 'us' %>
- Se på [Kodetimens ofte stilte spørsmål](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Hva kommer etter Kodetimen?

Kodetimen er bare første steg på en reise for å lære seg mer om hvordan teknologien fungerer og hvordan du kan lage dine egne programmer. For å fortsette på denne reisen:

- Oppmuntre elevene til å fortsette å [lære på nettet](%= resolve_url('https://code.org/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>