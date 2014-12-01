* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Så använder du Hour of Code
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
  Vi har en stor variation på roliga entimmeslektioner för alla åldrar, gjorda av olika samarbetspartners. Nya övningar kommer lagom till nästa Hour of Code 8-14 december.
</p>

<p>
  <strong>Alla övningar i Hour of Code:</strong>
</p>

<ul>
  <li>
    Kräver minimal förberedelse för lärare
  </li>
  <li>
    Är självinstruerande så att alla kan jobba i sin takt på sin nivå
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
    <strong>Testa övningarna på elevdatorer eller enheter.</strong> Kontrollera att de fungerar korrekt (med ljud och video).
  </li>
  <li>
    <strong>Förhandsgranska Diplomsidan</strong> för att se vad eleverna kommer att se när de är klara.
  </li>
  <li>
    <strong>Fixa hörlurar till din klass</strong>, eller be eleverna att ta med sig egna, om de övningar du väljer fungerar bäst med ljud.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Finns inte tillräckligt många enheter?</strong> Använd <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">parprogrammering</a>. När elever samarbetar, hjälper de varandra och vänder sig mindre till läraren. De ser också att programmering är socialt och bygger på samarbete.
  </li>
  <li>
    <strong>Är tillgängligheten till internet för dålig?</strong> Planera att se videor på gemensamt, så att varje elev inte behöver ladda ner sina egna videos. Eller prova unplugged / offline övningar.
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
    Originalvideon från lanseringen av Code.org, där bland annat Bill Gates, Mark Zuckerberg och basketstjärnan Chris Bosh är med (det finns olika versioner som är <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 minut</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minuter</a> och <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minuter</a> långa)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Lanseringsvideon från Hour of Code 2013</a> eller <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">videon för Hour of Code 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">videon för Hour of Code 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">President Obama uppmanar alla elever att lära sig datavetenskap</a>
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
    Förklara på ett enkelt sätt och använd olika slags tillämpningar som tilltalar många (rädda liv, hjälpa människor, kommunicera, osv.).
  </li>
  <li>
    Till exempel: "Tänk vad många av våra saker som är byggda med hjälp av datavetenskap: mobiler, microvågsugnar, trafikljus.... inget av det skulle fungera utan att en datavetare var med när de byggdes."
  </li>
  <li>
    Eller: "Datavetenskap är konsten att kombinera människors idéer och digitala verktyg för att öka vår makt. Datavetare arbetar inom många olika områden: bygger appar för telefoner, botar sjukdomar, skapar animerade filmer, jobbar med sociala medier, bygger robotar för att utforska andra planeter och mycket mer. "
  </li>
  <li>
    Tips för att få tjejer intresserade av datavetenskap hittar du <a href="http://<%= codeorg_url() %>/girls">här</a>.
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
    Skriv länken till introduktionen på whiteboarden. Länken finns på <a href="http://<%= codeorg_url() %>/learn">information om din valda tutorial</a> under antalet deltagare. <a href="http://hourofcode.com/co">hourofcode.com</a>
  </li>
  <li>
    Be eleverna att gå till den uppskrivna webbadressen och börja introduktionen.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Inför regeln "Fråga 3 innan mig." Fråga 3 klasskamrater, och om de inte har svaret, då frågar man läraren.
  </li>
  <li>
    Uppmuntra elever och ge positiv förstärkning: "Du gör ett bra jobb, fortsätt försöka."
  </li>
  <li>
    Det är okej att svara: "Jag vet inte. Låt oss lista ut tillsammans." Om du inte kan lösa ett problem, använd det som en diskussionmöjlighet med klassen: "teknik fungerar inte alltid så som vi vill. Vi lär oss tillsammans. Och: "Att lära sig programmera är som att lära sig ett nytt språk; du kommer inte att vara flytande direkt."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Eleverna kan se alla övningar och prova en annan Hour of Code aktivitet på <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Eller, be elever som blir snabbt färdiga att hjälpa klasskamrater som behöver hjälp.
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