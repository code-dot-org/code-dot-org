* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Korleis arrangere ein Kodetime
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Registrer arrangement ditt</button></a>
  </div>
</div>

<font size="4">On December 8th, as part of the global Hour of Code movement Microsoft is seeking to enable as many people as possible in Ireland to have the opportunity to learn how to code.</p> 

<p>
  On 19th November Microsoft will run a training session for people hosting events at its campus in Sandyford from 6pm - 8pm.
</p>

<p>
  This will run through the curriculum which can be delivered for Hour of Code on 8th December. If you would like to register to attend this event please email cillian@q4pr.ie. Places are on a first come first served basis. </font>
</p>

<h2>
  Details of the curriculum can be found <a href="https://www.touchdevelop.com/hourofcode2">here</a>
</h2>

<h2>
  1) Try the tutorials:
</h2>

<p>
  Vi vil vere vertskap for varierte, timelange leksjonar for elevar i alle aldrar. Leksjonane er laga av ulike samarbeidspartnarar. Fleire tema vil bli tilgjengelege fram til kodetimen blir starta opp den 8. desember.
</p>

<p>
  <strong>For alle leksjonane i Kodetimen gjeld:</strong>
</p>

<ul>
  <li>
    Krev minimalt med tid til førebuing frå læraren
  </li>
  <li>
    Er tilrettelagt for at elevane skal arbeide på eiga hand, i eige tempo og tilpasset eige ferdigheitsnivå
  </li>
</ul>

<p>
  <a href="http://<%=codeorg_url() %>/learn"><img src="http://<%= codeorg_url() %>/images/tutorials.png" /></a>
</p>

<h2>
  2) Plan your hardware needs - computers are optional
</h2>

<p>
  The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.
</p>

<ul>
  <li>
    <strong>Prøv ut leksjonane på elevane sine datamaskiner eller nettbrett.</strong>Ver viss på at dei fungerer sikkeleg med lyd og video.
  </li>
  <li>
    <strong>Sjekk ut gratulasjons-sida</strong> for å sjå kva elevane vil få sjå når dei er ferdige.
  </li>
  <li>
    <strong>Skaff hodetelefonar til klassa</strong>, eller be elevene om å ta med sine eigne, om du leksjonane du vil bruke er med lyd.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Ikkje nok maskiner til alle elevane?</strong> Prøv <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">parprogrammering</a>. Når elevene går saman to og to, vil dei hjelpe kvarandre og kreve mindre av læraren. Dei vil også oppleve at programmering er sosialt og handlar om samarbeid.
  </li>
  <li>
    <strong>Er internettlinja treg?</strong> Planlegg å vise videoane for heile klassa samla, slik at alle elev ikkje lastar ned kvar sin video. Eller prøv dei leksjonene som ikkje treng tilgang til nettet.
  </li>
</ul>

<h2>
  4) Inspire students - show them a video
</h2>

<p>
  Show students an inspirational video to kick off the Hour of Code. Examples:
</p>

<ul>
  <li>
    Bill Gates, Mark Zuckerberg og NBA stjerna Chris Bosh var med i den opprinnelge lanseringsvideoen for Code.org (Det finns versjonar på <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">eit minutt</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minutt</a> og <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minutt</a>)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Lanseringsvideoen for Kodetimen 2013</a>, eller < % if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Videoen for Kodetimen 2014</a> < % else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Videoen for Kodetimen 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">President Obama oppfordrar alle elevar til å lære datavitskap</a>
  </li>
</ul>

<p>
  <strong>Get your students excited - give them a short intro</strong>
</p>

<p>
  Most kids don’t know what computer science is. Here are some ideas:
</p>

<ul>
  <li>
    Forklar det på ein enkel måte med eksempel frå bruksområde som både gutar og jenter vil bryr seg om (redde liv, hjelpe folk, knyte menneske saman, o.s.v.).
  </li>
  <li>
    Prøv f.eks: "Tenk på dei tinga du brukar kvar dag: mobiltelefon, mikrobølgeovn, datamaskin, trafikklys... for å fungere må alle desse programmerast av datakyndige."
  </li>
  <li>
    Eller: "datavitskap er kunsten å smelte saman menneska sine idear med digitale verkty for å auke evnene våre. IT-folk arbeider innanfor så mange ulike område: apputvikling, lekjing av sjkdommar, skaping av tegnefilmer, arbeid med sosiale medier, byggjing av robotar, utforsking av andre planetar og mykje mykje meir. "
  </li>
  <li>
    Sjå tips for å få jenter interesserte i programmering <a
  </li>
</ul>

<h2>
  5) Start your Hour of Code
</h2>

<p>
  <strong>Direct students to the activity</strong>
</p>

<ul>
  <li>
    Skriv lenkjeadressa til leksjonen på tavla! Lenkjeadressa er oppført etter talet på deltakarar i <a href="http://<%= codeorg_url() %>/learn">informasjonen om den leksjonen du har vald</a>. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Be elevene on å skrive inn adressa i nettlesar og starte leksjonen.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Fortell elevene, "Spør 3, så meg." Spør 3 klassekameratar, og dersom dei heller ikkje veit svaret, så spør læraren.
  </li>
  <li>
    Oppmuntre elevane og gi positive tilbakemeldingar: "Du klarer det fint, så berre hald fram"
  </li>
  <li>
    Det er greit å svare: "Eg veit ikkje. Lat oss prøve å finne det ut saman." Dersom du ikkje får løyst eit problem, bruk det som eit eksempel: "Teknologien fungerer ikkje alltid slik vi ynskjer. Vi lærer dette saman." Og: "Å lære programmering er som å lære eit nytt språk, du kan ikkje det flytande med ein gong."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Elevane kan sjå alle leksjonane og prøve ein av dei andre aktivitetane for Kodetimen på <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Eller du kan be dei elevane som blir fort ferdige om å hjelpe dei som slit med å få det til.
  </li>
</ul>

<p>
  <strong>How do I print certificates for my students?</strong>
</p>

<p>
  Each student gets a chance to get a certificate via email when they finish the <a href="http://studio.code.org">Code.org tutorials</a>. You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our <a href="http://<%= codeorg_url() %>/certificates">Certificates</a> page to print as many certificates as you like, in one fell swoop!
</p>

<p>
  <strong>What comes after the Hour of Code?</strong>
</p>

<p>
  The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, <a href="http://uk.code.org/learn/beyond">encourage your children to learn online</a>. <% else %> To continue this journey, find additional resources for educators <a href="http://<%= codeorg_url() %>/educate">here</a>. Or encourage your children to learn <a href="http://<%= codeorg_url() %>/learn/beyond">online</a>. <% end %> <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>
</p>