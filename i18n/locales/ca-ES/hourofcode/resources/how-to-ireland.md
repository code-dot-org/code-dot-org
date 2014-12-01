* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Com ensenyar una Hora del Codi
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
  Posarem una varietat de tutorials divertits, d'una hora de durada per a estudiants de totes les edats, creats per una varietat de col·laboradors. Noves classes arribaran abans de desembre 8-14 per donar inici a l'Hora de Codi .
</p>

<p>
  <strong>Tots els tutorials d'Hora de Codi:</strong>
</p>

<ul>
  <li>
    Requereixen un mínim temps de preparació per als professors
  </li>
  <li>
    Són autoguiades - permetent que els alumnes treballin al seu propi ritme i nivell d'habilitat
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
    <strong>Prova els tutorials als ordinadors o dispositius dels estudiants.</strong> Assegura't que funcionin correctament (amb so i vídeo).
  </li>
  <li>
    <strong>Revisa la pàgina de felicitació</strong> per comprovar que veuran els alumnes quan finalitzin.
  </li>
  <li>
    <strong>Proporciona auriculars per a la classe</strong>, o demana als estudiants que portin els seus, si el tutorial que has escollit funciona millor amb so.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>No tens dispositius suficients?</strong> Utilitza <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">parelles de programació</a>. Quan els estudiants s'associen, s'ajuden mútuament i consulten menys al professor. Ells veuen també que la informàtica és social i col·laborativa.
  </li>
  <li>
    <strong>Tens poc ampla de banda?</strong> Plantejat mostrar els vídeos a la pantalla de classe, evitaràs que cada estudiant se'ls descarregui. O prova els tutorials sense connexió / offline.
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
    El vídeo original de promoció de Code.org, protagonitzat per Bill Gates, Mark Zuckerberg, i l'estrella de la NBA Chris Bosh (Hi ha versions de <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 minut</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minuts</a> i<a href="https://www.youtube.com/watch?v=dU1xS07N-FA"> 9 minuts)</a>
  </li>
  <li>
    El <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">vídeo promocional del 2013 de l'Hora del Codi</a>, o el <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ"> vídeo de l'Hora del Codi 2014</a><% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q"> vídeo de l'Hora del Codi de 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">El president Obama fent una crida a tots els alumnes a aprendre informàtica</a>
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
    Explica'ls de forma senzilla exemples d'aplicacions que cridin l'atenció tant dels nens com de les nenes sobre (salvar vides, ajudar a la gent, connectar persones, etc.).
  </li>
  <li>
    Prova: "Pensa en les coses de la teva vida quotidiana que utilitzin la informàtica: un telèfon mòbil, un microones, un ordinador, un semàfor... totes aquestes coses necessiten un científic de la computació per ajudar a construir-los."
  </li>
  <li>
    O: " La informàtica és l'art de barrejar les idees humanes i les eines digitals per tal d'augmentar el nostre poder. Els especialistes informàtics treballen en moltes àrees diferents: escrivint aplicacions per telèfons, curant malalties, creant pel·lícules animades, treballant en mitjans de comunicació, construint robots que explorin altres planetes i moltes més coses."
  </li>
  <li>
    Veure consells per aconseguir que les noies s'interessin per la informàtica <a href="http://<%= codeorg_url() %>/girls">aquí</a>.
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
    Escriu l'enllaç del tutorial en una pissarra blanca. Trobar l'enllaç que apareix a la<a href="http://<%= codeorg_url() %>/learn">informació per el teu tutorial escollit</a>sota el nombre de participants. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Digues als alumnes que visitin la pàgina web i comencin el tutorial.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Digues als estudiants, "Pregunta a 3, després a mi." Pregunta a 3 companys de classe, i si no tenen la resposta, llavors pregunta al mestre.
  </li>
  <li>
    Animar els alumnes i oferir reforç positiu: "Ho estàs fent molt bé, així que segueix intentant-ho."
  </li>
  <li>
    És correcte respondre: "No ho sé. Anem a resoldre això junts." Si no pot esbrinar un problema, utilitza-ho com una lliçó de bon aprenentatge per a la classe: "La tecnologia no sempre funciona de la manera que volem. Junts, som una comunitat d'aprenents." I: "Aprendre a programar és com aprendre una nova llengua; no serà fluid de seguida."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Els estudiants poden veure totes les classes i provar una altra activitat de l'Hora del Codi a <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    O bé, demaneu als estudiants que acaben aviat que ajudin els companys que estan tenint problemes amb l'activitat.
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