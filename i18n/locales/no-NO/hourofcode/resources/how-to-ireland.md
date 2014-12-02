* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Hvordan undervise i kodetimen
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up your event</button></a>
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
  Vi vil holde en rekke morsomme, timelange undervisningsøkter for elever i alle aldre. De er laget av en rekke ulike partnere. Flere tema vil bli tilgjengelig før kodetimen sparkes i gang 8. desember.
</p>

<p>
  <strong>For temaene i Kodetimen gjelder:</strong>
</p>

<ul>
  <li>
    Krever minimalt med tid til forberedelser fra læreren
  </li>
  <li>
    Er tilrettelagt for at studentene skal arbeide på egen hånd i eget tempo og tilpasset deres ferdighetsnivå
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
    <strong>Prøv ut opplæringsøktene på elevenes datamaskiner eller enheter.</strong> Forsikre deg om at de fungerer med lyd og video.
  </li>
  <li>
    <strong>Sjekk gratulasjons-siden</strong> å se hva elevene vil se når de er ferdige.
  </li>
  <li>
    <strong>Skaff hodetelefoner til klassen</strong>, eller spørr elevene om å ta med sine egne. Gjelder hvis du velger å bruke leksjonene med lyd.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Har dere ikke nok maskiner?</strong> Prøv <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">parprogrammering</a>. Når elevene jobber to og to, vil de hjelpe hverandre og være mindre avhengige av læreren. De vil også oppleve at programmering er sosialt og handler om samarbeid.
  </li>
  <li>
    <strong>Har dere dårlig eller treg internettforbindelse?</strong> Planlegg å vise videoene for hele klassen samlet, slik at hver elev ikke trenger å laste ned sine egne videoer. Eller prøv de leksjonene som kan gjøres uten tilkobling til nett.
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
    Bill Gates, Mark Zuckerberg og NBA stjernen Chris Bosh var med i den opprinnelige lanseringsvideoen for Code.org (Det finnes versjoner på <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">ett minutt</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minutter</a> og <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minutter</a>)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Lanseringsvideoen for Kodetimen 2013</a>, eller <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Video for Kodetimen 2014</a> < % else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Video for Kodetimen 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">President Obama oppfordrer alle elever til å lære datavitenskap</a>
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
    Forklar det på en enkel måte med eksempler på bruksområder som både gutter og jenter vil bryr seg om (redde liv, hjelpe folk, knytter mennesker sammen, osv.).
  </li>
  <li>
    Prøv f.eks: "Tenk på tingene som du bruker hver dag: mobiltelefon, mikrobølgeovn, datamaskin, trafikklys... alle disse tingene måtte programmeres av datakyndige."
  </li>
  <li>
    Eller: "datavitenskap er kunsten å smelte sammen mennesklige ideer med digitale verktøy for å øke evnene våre. IT-folk jobber innenfor så mange forskjellige områder: apputvikling, helbreding av sykdommer, skaping av tegnefilmer, arbeid med sosiale medier, bygging av roboter, utforsking av andre planeter og mye mye mer. "
  </li>
  <li>
    Se tips for å få jenter interessert i dataprogrammering <a href="http://<%= codeorg_url() %>/girls">her</a>.
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
    Skriv linken til veiledningen på en tavle. Finn linken som er oppført i <a href="http://<%= codeorg_url() %>/learn">informasjonen for den veiledningen du har valgt</a> under antall deltakere. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Be elevene gå til denne nettadressen og starte veiledningen.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Si dette til elevene: “Spør 3 før du spør meg.” Spør 3 i klassen, og hvis de ikke kan svare, så kan du spørre læreren.
  </li>
  <li>
    Oppmuntre elevene og gi positive tilbakemeldinger: "Du klarer det fint, så bare fortsett"
  </li>
  <li>
    Det er greit å svare: "Jeg vet ikke. La oss prøve å finne det ut sammen." Hvis du ikke får løst et problem, bruk det som en et eksempel: "teknologien fungerer ikke alltid ut slik vi ønsker. men vi kan lærer dette sammen." Og: "Å lære programmering er som å lære et nytt språk, du kan det ikke flytende med en gang."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Elevene kan se alle leksjonene og prøve en av de andre aktivitetene for Kodetimen på <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Eller du kan be de elevene som blir fort ferdige om å hjelpe de som sliter med å få det til.
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