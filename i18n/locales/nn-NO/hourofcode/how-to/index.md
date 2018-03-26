---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Slik arrangerer du ein Kodetime</h1>

Bli med i rørsla og introdusér ei gruppe elevar til deira fyrste time i koding med desse trinna. Kodetimen er enkel å organisere, sjølv for nybyrjarar! If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your class.

## 1. Sjå denne rettleiingsvideoen <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Vel ei oppgåve for timen din

Vi byr på eit utval av morosame [opplæringsguidar for elevar](%= resolve_url('/learn') %) i alle aldersgrupper og erfaringsnivå. Elevane gjer aktiviteten på eiga hand, sjølv om mange aktivitetar inkluderer oppgåver for lærarar (du ser lenka når du trykker på aktiviteten) som gir ein guide på korleis du kan ha diskusjonar eller utvide aktiviteten. [![](/images/Fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Marknadsfør Kodetimen din

Sprei ordet om Kodetimen [med desse verktya](%= resolve_url('/promote/resources') %) og oppmuntre andre til å arrangere eigne kodetimar.

## 4. Planlegg kva du har bruk for av utstyr - datamaskiner er valfrie

Den beste Kodetime-opplevinga får du med datamaskiner tilkopla internett. Men du treng **ikkje** ei datamaskin hver for kvart born, og du kan til og med gjennomføre Kodetimen uten datamaskiner i det heile.

Prøv ut øvingane på elevane sine datamaskiner eller nettbrett. Ver viss på at dei fungerer skikkeleg med på nettlesaren med både lyd og video. **Er internettlinja treg?** Planlegg å vise videoane for heile klassa samla, slik at alle elev ikkje lastar ned kvar sin video. Eller prøv oppgåver utan datamaskin.

Tilby hovudtelefonar, eller spør deltakarane om å ta med sine eigne, om oppgåva du vel fungerer best med lyd.

**Manglar du datamaskiner eller einingar?** Gjer [par-programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Når elevane går saman to og to, vil dei hjelpe kvarandre og kreve mindre av læraren. Dei vil også oppleva at programmering er sosialt og handlar om samarbeid.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start Kodetimen med ein inspirerande førelesar eller video

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Vis ein inspirerande video:**

- Den opprinnelege lanseringsvideoen fra Code.org med Bill Gates, Mark Zuckerberg og NBA-stjerna Chris Bosh. (Det finst versjonar på [1 minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutt](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutt](https://www.youtube.com/watch?v=dU1xS07N-FA))
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Det er heilt greit om du og elevane dine ikkje er kjend med datavitskap frå før. Her er nokre idear til korleis du kan introdusere kodetimen din:**

- Forklar korleis teknologi påverkar liva våre. Bruk gjerne døme som både jenter og gutar kan kjenne seg att i (snakk om å redde liv, hjelpe andre eller om sosiale medier).
- Lag ei liste over daglegdagse ting som er programmert.
- See tips for getting girls interested in computer science [here](%= codeorg_url('/girls')%).

## 6. Start å kode!

**Sett elevane i gong med aktiviteten**

- Skriv oppgåvelenka på ei tavle. Finn lenka under [informasjonen for den valde oppgåva](%= resolve_url('/learn')%) under talet på deltakarar.

**Når elevane har spørsmål eller meiner noko er vanskeleg, er det greit å svare:**

- "Eg veit ikkje. La oss finne ut av det i lag."
- «Det er ikkje alltid teknologien gjer seg slik vi vil.»
- "Å lære seg å kode er som å lære seg eit nytt språk - du snakkar ikkje perfekt med ein gong."

**Kva kan eg gjere om ein elev blir tidleg ferdig?**

- Elevar kan sjå på alle oppgavene og [prøve ei anna oppgåve frå Kodetimen](%= resolve_url('/learn')%).
- Eller du kan be dei elevane som blir fort ferdige om å hjelpe dei som slit med å få det til.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Gjer stas på deltakarane

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](%= codeorg_url('/certificates')%) for your students.
- [Skriv ut "Eg gjennomførte Kodetimen!"](%= resolve_url('/promote/resources#stickers') %)-klistremerke til elevane dine.
- [Bestill t-skjorter](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) til skulen din.
- Del bilete og videoar frå Kodetimen på sosiale medier. Bruk #HourOfCode, #Kodetimen og @codeorg så vi og kan vise fram suksessen din!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Andre ressursar til Kodetimen for lærarar:

- Besøk [Kodetimen sitt lærarforum](http://forum.code.org/c/plc/hour-of-code) for å få råd, innsikt og støtte frå andre lærarar. <% if @country == 'us' %>
- Sjå på [ofte stilte spørsmål om Kodetimen](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Kva kjem etter Kodetimen?

Kodetimen er berre første steget på ei reise for å lære seg meir om korleis teknologi fungerer og korleis du lagar dine eigne program. For å halde fram på denne reisa:

- Encourage students to continue to [learn online](%= codeorg_url('/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>