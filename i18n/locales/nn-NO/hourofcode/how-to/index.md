---
title: '<%= hoc_s(:title_how_to) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Slik arrangerer du ein Kodetime</h1>

Bli med i bevegelsen og introduser en gruppe elever til deres første time i informatikk med disse stegene. Kodetimen er enkel å organisere, selv for nybegynnere! Hvis du trenger litt hjelp, kan du ta kontakt med en [lokal frivillig](%= resolve_url('https://code.org/volunteer/local') %) som kan hjelpe til med å organisere Kodetimen for klassen din.

## 1. Se denne veiledningsvideoen <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Velg et undervisningsopplegg for din time

We provide a variety of fun, [student-guided tutorials](%= resolve_url('/learn') %) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Markedsfør Kodetimen din

Promote your Hour of Code [with these tools](%= resolve_url('/promote/resources') %) and encourage others to host their own events.

## 4. Planlegg hva du trenger av utstyr - datamaskiner er valgfrie

Den beste Kodetime-opplevinga får du med datamaskiner tilkopla internett. Men du treng **ikkje** ei datamaskin hver for kvart born, og du kan til og med gjennomføre Kodetimen uten datamaskiner i det heile.

Husk å teste undervisningsopplegg på elevenes datamaskiner eller enheter for å sikre at de fungerer riktig i nettlesere med lyd og video. **Har dere dårlig eller treg internettforbindelse?** Planlegg å vise videoene for hele klassen samlet, slik at hver elev ikke trenger å laste ned sine egne videoer. Eller prøv de frakoblede/offline veiledningene.

Tilby hovudtelefonar, eller spør deltakarane om å ta med sine eigne, om oppgåva du vel fungerer best med lyd.

**Manglar du datamaskiner eller einingar?** Bruk [par-programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Når elevane går saman to og to, vil dei hjelpe kvarandre og kreve mindre av læraren. Dei vil også oppleva at programmering er sosialt og handlar om samarbeid.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start Kodetimen med en inspirerende foreleser eller video

**Invite a [local volunteer](%= resolve_url('https://code.org/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Vis ein inspirerande video:**

- Den opprinnelige lanseringsvideoen fra Code.org med Bill Gates, Mark Zuckerberg og NBA stjerne Chris Bosh. (Det finnes versjoner på [1 minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutter](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutter](https://www.youtube.com/watch?v=dU1xS07N-FA))
- Finn fleire inspirerande [ressursar](%= resolve_url('https://code.org/inspire') %) og [videoar](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Forklar hvordan teknologi påvirker livene våre. Bruk gjerne eksempler som både jenter og gutter kan kjenne seg igjen i (Snakk om å redde liv, hjelpe andre, sosiale medier o.l.).
- Lag ei liste over daglegdagse ting som er programmert.
- Se tips for å få jenter interessert i informatikk [her](%= resolve_url('https://code.org/girls')%).

## 6. Koding!

**Direct students to the activity**

- Skriv oppgavelenken på en tavle. Finn lenken på siden med [informasjon om den valgte oppgaven](%= resolve_url('/learn')%) under antall deltakere.

**When your students come across difficulties it's okay to respond:**

- "Eg veit ikkje. Lat oss finne det ut i lag."
- «Det er ikkje alltid teknologien gjer seg slik vi vil.»
- "Å lære seg å kode er som å lære seg eit nytt språk - du snakkar ikkje perfekt med ein gong."

**What if a student finishes early?**

- Elever kan se på alle oppgavene og [prøve en annen aktivitet fra Kodetimen](%= resolve_url('/learn')%).
- Eller du kan be dei elevane som blir fort ferdige om å hjelpe dei som slit med å få det til.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Feire

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Skriv ut diplomer](%= resolve_url('https://code.org/certificates')%) til elevene.
- [Skriv ut "Eg gjennomførte Kodetimen!"](%= resolve_url('/promote/resources#stickers') %)-klistremerke til elevane dine.
- [Bestill t-skjorter](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)til skulen din.
- Del bilete og videoar frå Kodetimen på sosiale medier. Bruk #HourOfCode, #Kodetimen og @codeorg så vi og kan vise fram suksessen din!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Andre ressursar til Kodetimen for for lærarar:

- Besøk [Kodetimen sitt lærarforum](http://forum.code.org/c/plc/hour-of-code) for å få råd, innsikt og støtte frå andre lærarar. <% if @country == 'us' %>
- Sjå på [ofte stilte spørsmål om Kodetimen](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Kva kjem etter Kodetimen?

Kodetimen er berre første steget på ei reise for å lære seg meir om korleis teknologi fungerer og korleis du lagar dine eigne program. For å halde fram på denne reisa:

- Oppmuntre elevene til å fortsette å [lære på nettet](%= resolve_url('https://code.org/learn/beyond')%).
- [Delta på](%= resolve_url('https://code.org/professional-development-workshops') %) en 1-dags seminar der du vil få opplæring fra en erfaren tilretteleggar med kompetanse innan informatikk. (gjeld kun lærarar i USA)

<%= view :signup_button %>