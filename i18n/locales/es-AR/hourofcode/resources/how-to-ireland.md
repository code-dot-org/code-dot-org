* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Cómo enseñar una Hora de Código
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Registra tu evento</button></a>
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
  Contamos con una gran variedad de tutoriales muy divertidos de hora de duración, para estudiantes de todas las edades, y pronto agregaremos más.
</p>

<p>
  <strong>Todos los tutoriales:</strong>
</p>

<ul>
  <li>
    Requieren mínima preparación previa de parte de los docentes.
  </li>
  <li>
    Son autoguiados, lo que permite que los estudiantes trabajen a su propio ritmo y según su propio nivel de conocimientos.
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
    <strong>Probá los tutoriales en las computadoras o dispositivos móviles que vayas a usar.</strong> Asegurate de que funcionen bien (chequeá audio y video).
  </li>
  <li>
    <strong>Mirá la página de felicitaciones</strong>, para ver qué van a ver los alumnos cuando terminen.
  </li>
  <li>
    <strong>Chequeá el audio</strong>. Si los tutoriales que vas a usar dependen del audio asegurate de contar con auriculares para cada estudiante o de pedirles que traigan los suyos.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>¿No tenés suficientes dispositivos?</strong> Usá <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">programación entre pares</a>. Cuando los alumnos trabajan junto se ayudan mutuamente y dependen mucho menos del docente. Además van a ver que las Ciencias de la Computación son colaborativas y fomentan la interacción social.
  </li>
  <li>
    <strong>¿No tenés buena conexión a Internet?</strong> Podés mostrar videos desde el frente de la clase, así cada chico no tiene que bajárselo en su propia máquina. También podés probar los tutoriales "desenchufados".
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
    El video de inicio original de Code.org, presentando a Bill Gates, Mark Zuckerberg y la estrella de la NBA, Chris Bosh (Hay versiones de <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 minuto</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minutos</a> y <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minutos</a>)
  </li>
  <li>
    El <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">video de inicio de la Hora del Código 2013</a>, o el <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">video de la Hora del Código 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">video de la Hora del Código 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">El Presidente Obama incentivando a todos los estudiantes a aprender informática</a>
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
    Da explicaciones de manera simple, que incluyan ejemplos de aplicación que interesen tanto a chicos como chicas (salvar vidas, ayudar a la gente, conectar con la gente, etc.).
  </li>
  <li>
    Intentá: "Piensen sobre cosas de su vida diaria que utilicen la informática: un teléfono celular, un microondas, una computadora, la luz del semáforo… todas estas cosas necesitan un especialista en informática que ayude a construirlas."
  </li>
  <li>
    O: "La informática es el arte de mezclar ideas humanas y herramientas digitales para incrementar nuestro poder. Los informáticos trabajan en áreas tan distintas: diseñando aplicaciones para teléfonos, curando enfermedades, creando películas animadas, trabajando en medios de comunicación, construyendo robots que exploran otros planetas, y muchas cosas más."
  </li>
  <li>
    Mirá consejos para conseguir chicas interesadas en informática <a href="http://<%= codeorg_url() %>/girls">acá</a>.
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
    Escribe el enlace al tutorial en el tablero. Encuentra el enlace en la <a href="http://<%= codeorg_url() %>/learn">información para el tutorial seleccionado</a> bajo el número de participantes. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Indica a los estudiantes que visiten la URL e inicien el tutorial.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Indica a los estudiantes, "Pregunta a 3 personas, luego a mi". Pregunta a 3 compañeros y si ellos no conocen la respuesta entonces pregunta al profesor.
  </li>
  <li>
    Alienta a los estudiantes y dales refuerzos positivos: "Lo estás haciendo muy bien, sigue intentando."
  </li>
  <li>
    Está bien responder: "No sé. Encontremos la respuesta juntos." Si no puedes resolver un problema úsalo como una buena lección para toda la clase: "La tecnología no siempre funciona como queremos. Todos juntos somos una comunidad de aprendizaje". Y: "Aprender a programar es como aprender un nuevo idioma, no serás fluido enseguida."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Los estudiantes pueden ver todos los tutoriales e intentar otra actividad de la Hora de Programación en <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    O pide a los estudiantes que terminen primero que ayuden a los que tegan problemas con la actividad.
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