

<div class="row">
  <h1 class="col-sm-6">
    Korleis arrangere ein Kodetime
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Registrer arrangement ditt</button></a>
  </div>
</div>

## 1) Watch this how-to video <iframe width="560" height="315" src="//www.youtube.com/embed/tQeSke4hIds" frameborder="0" allowfullscreen></iframe>
## 2) Try the tutorials:

Vi vil vere vertskap for varierte, timelange leksjonar for elevar i alle aldrar. Leksjonane er laga av ulike samarbeidspartnarar. Fleire tema vil bli tilgjengelege fram til kodetimen blir starta opp den 8. desember.

**For alle leksjonane i Kodetimen gjeld:**

  * Krev minimalt med tid til førebuing frå læraren
  * Er tilrettelagt for at elevane skal arbeide på eiga hand, i eige tempo og tilpasset eige ferdigheitsnivå

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 3) Register your Hour on the map

[Make sure to sign up](<%= hoc_uri('/') %>). We'll send you helpful info as the Hour of Code nears, and you'll see your Hour of Code on our map of worldwide events.

## 4) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.

  * **Prøv ut leksjonane på elevane sine datamaskiner eller nettbrett.**Ver viss på at dei fungerer sikkeleg med lyd og video.
  * **Sjekk ut gratulasjons-sida** for å sjå kva elevane vil få sjå når dei er ferdige. 
  * **Skaff hodetelefonar til klassa**, eller be elevene om å ta med sine eigne, om du leksjonane du vil bruke er med lyd.

## 5) Plan ahead based on your technology available

  * **Ikkje nok maskiner til alle elevane?** Prøv [parprogrammering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Når elevene går saman to og to, vil dei hjelpe kvarandre og kreve mindre av læraren. Dei vil også oppleve at programmering er sosialt og handlar om samarbeid.
  * **Er internettlinja treg?** Planlegg å vise videoane for heile klassa samla, slik at alle elev ikkje lastar ned kvar sin video. Eller prøv dei leksjonene som ikkje treng tilgang til nettet.

## 6) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * Bill Gates, Mark Zuckerberg og NBA stjerna Chris Bosh var med i den opprinnelge lanseringsvideoen for Code.org (Det finns versjonar på [eit minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutt](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutt](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * [Lanseringsvideoen for Kodetimen 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), eller <% if @country == 'uk' %> [Videoen for Kodetimen 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [Videoen for Kodetimen 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [President Obama oppfordrar alle elevar til å lære datavitskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

Most kids don’t know what computer science is. Here are some ideas:

  * Forklar det på ein enkel måte med eksempel frå bruksområde som både gutar og jenter vil bryr seg om (redde liv, hjelpe folk, knyte menneske saman, o.s.v.).
  * Prøv f.eks: "Tenk på dei tinga du brukar kvar dag: mobiltelefon, mikrobølgeovn, datamaskin, trafikklys... for å fungere må alle desse programmerast av datakyndige."
  * Eller: "datavitskap er kunsten å smelte saman menneska sine idear med digitale verkty for å auke evnene våre. IT-folk arbeider innanfor så mange ulike område: apputvikling, lekjing av sjkdommar, skaping av tegnefilmer, arbeid med sosiale medier, byggjing av robotar, utforsking av andre planetar og mykje mykje meir. "
  * Sjå tips for å få jenter interesserte i programmering <a

## 6) Start your Hour of Code

**Direct students to the activity**

  * Skriv lenkjeadressa til leksjonen på tavla! Lenkjeadressa er oppført etter talet på deltakarar i [informasjonen om den leksjonen du har vald](http://<%= codeorg_url() %>/learn). [hourofcode.com/co](http://hourofcode.com/co)
  * Be elevene on å skrive inn adressa i nettlesar og starte leksjonen.

**When your students come across difficulties**

  * Fortell elevene, "Spør 3, så meg." Spør 3 klassekameratar, og dersom dei heller ikkje veit svaret, så spør læraren.
  * Oppmuntre elevane og gi positive tilbakemeldingar: "Du klarer det fint, så berre hald fram"
  * Det er greit å svare: "Eg veit ikkje. Lat oss prøve å finne det ut saman." Dersom du ikkje får løyst eit problem, bruk det som eit eksempel: "Teknologien fungerer ikkje alltid slik vi ynskjer. Vi lærer dette saman." Og: "Å lære programmering er som å lære eit nytt språk, du kan ikkje det flytande med ein gong."

**What to do if a student finishes early?**

  * Elevane kan sjå alle leksjonane og prøve ein av dei andre aktivitetane for Kodetimen på [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * Eller du kan be dei elevane som blir fort ferdige om å hjelpe dei som slit med å få det til.

**How do I print certificates for my students?**

Each student gets a chance to get a certificate via email when they finish the [Code.org tutorials](http://studio.code.org). You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our [Certificates](http://<%= codeorg_url() %>/certificates) page to print as many certificates as you like, in one fell swoop!

**What comes after the Hour of Code?**

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your children to learn online](http://uk.code.org/learn/beyond). <% else %> To continue this journey, find additional resources for educators [here](http://<%= codeorg_url() %>/educate). Or encourage your children to learn [online](http://<%= codeorg_url() %>/learn/beyond). <% end %> 