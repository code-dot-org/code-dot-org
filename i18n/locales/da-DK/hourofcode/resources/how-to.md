* * *

title: How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Sådan kan du bruge Hour of Code i undervisningen
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

## 1) Watch this how-to video <iframe width="560" height="315" src="//www.youtube.com/embed/tQeSke4hIds" frameborder="0" allowfullscreen></iframe>
## 2) Try the tutorials:

Vi har en række sjove, timelange øvelser til elever i alle aldre, lavet af en række partnere. Nye øvelser er på vej til at sætte gang i Hour of Code fra den 8. til 14. december.

**Alle Hour of Code øvelser:**

  * Kræver minimal forberedelsestid for lærere
  * Er selvinstruerende og giver elever lov til at arbejde i deres eget tempo og et passende færdighedsniveau

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 3) Register your Hour on the map

[Make sure to sign up](<%= hoc_uri('/') %>). We'll send you helpful info as the Hour of Code nears, and you'll see your Hour of Code on our map of worldwide events.

## 4) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.

  * **Test tutorials på elevernes computere eller tablets.** Sørg for, at de fungerer korrekt (med lyd og video).
  * **Tjek afslutningssiden** for at se hvad eleverne vil se, når de er færdige. 
  * **Sørg for hovedtelefoner til din klasse**, eller bed eleverne om at medbringe deres egne, hvis den tutorial du vælger fungerer bedst med lyd.

## 5) Plan ahead based on your technology available

  * **Har ikke nok computere og tablets?** Så bruge [parvis programmering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Når eleverne arbejder sammen, hjælper de hinanden og har mindre brug for hjælp fra læreren. De vil også opleve, at kodning også kan være social og kollaborative.
  * **Har du lav båndbredde?** Planlæg at vise videoerne i klassen først, så hver elev ikke behøver at downloade deres egne videoer. Eller prøv de unplugged / offline tutorials.

## 6) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * Den oprindelige Code.org indlednings video med Bill Gates, Mark Zuckerberg og NBA stjerne Chris Bosh (der er [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutters](https://www.youtube.com/watch?v=nKIu9yen5nc), og [9 minutters](https://www.youtube.com/watch?v=dU1xS07N-FA) versioner)
  * [The Hour of Code 2013 lanceringsvideoen](https://www.youtube.com/watch?v=FC5FbmsH4fw), eller den < % hvis @country == 'uk' %> [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ) < % eller %> [Hour of Code 2014 video](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [Præsident Obama opfordring til alle elever om til at lære at kode](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

Most kids don’t know what computer science is. Here are some ideas:

  * Forklare det på en enkel måde, der indeholder eksempler på programmer, som både drenge og piger vil er glad for (redde liv, at hjælpe folk, forbinder mennesker, osv.).
  * Prøv at sige: "Tænke på ting i din hverdag, der bruger kodning: en mobilphone, mikroovn, en computer, et lyskryds... alle disse ting har brug for en programmør for at bygge dem."
  * Eller: "Programmering er kunsten at blande menneskers idéer og digitale værktøjer for at øge vores magt. Programmører arbejde på mange forskellige områder: koder apps til telefoner, kurere sygdomme, oprette animerede film, arbejder på sociale medier, bygge robotter til at udforske andre planeter og så meget, meget andet. "
  * Se specielle tips til at få piger interesseret i kodning [ her](http://<%= codeorg_url() %>/ piger). 

## 6) Start your Hour of Code

**Direct students to the activity**

  * Skrive linket til tutorialen på tavlen. Find linket som står på [ oplysninger for din valgte tutorial](http://<%= codeorg_url() %>/ lære) under antallet af deltagere. [hourofcode.com/Co](http://hourofcode.com/co)
  * Sig til eleverne at de skal besøge webadressen og starte tutorialen.

**When your students come across difficulties**

  * Sig til eleverne, "Spørg først andre 3, så spørg mig." Spørger 3 klassekammerater, og hvis de ikke har svaret, så spørger læreren.
  * Tilskynd eleverne og giv positive opmuntringer: "Du er dygtig, så fortsæt!"
  * Det er okay at svare: "Det ved jeg ikke. Lad os finde ud af det sammen." Hvis du ikke kan finde ud af problemet, så kan du bruge det som en god og lærerig lektion for klassen: "teknologi virker ikke altid på den måde vi ønsker. Sammen er vi et fællesskab af lærende." Og: "At lære at kode er som at lære et nyt sprog. Du bliver ikke være flydende til det lige med det samme."

**What to do if a student finishes early?**

  * Eleven kan gennemse alle tutorials og prøve en anden Hour of Code aktivitet på [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * Eller du kan bede de elever, der er tidligt færdige om, at hjælpe de klassekammerater der har problemer med deres aktivitet.

**How do I print certificates for my students?**

Each student gets a chance to get a certificate via email when they finish the [Code.org tutorials](http://studio.code.org). You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our [Certificates](http://<%= codeorg_url() %>/certificates) page to print as many certificates as you like, in one fell swoop!

**What comes after the Hour of Code?**

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your children to learn online](http://uk.code.org/learn/beyond). <% else %> To continue this journey, find additional resources for educators [here](http://<%= codeorg_url() %>/educate). Or encourage your children to learn [online](http://<%= codeorg_url() %>/learn/beyond). <% end %> <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>