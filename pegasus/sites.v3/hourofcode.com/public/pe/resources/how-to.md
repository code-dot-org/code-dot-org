

<div class="row">
  <h1 class="col-sm-6">
    Cómo enseñar una Hora de Programación
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Registra tu evento</button></a>
  </div>
</div>

## 1) Watch this how-to video <iframe width="560" height="315" src="//www.youtube.com/embed/tQeSke4hIds" frameborder="0" allowfullscreen></iframe>
## 2) Try the tutorials:

Ofreceremos variados tutoriales divertidos de una hora de duración, para estudiantes de todas las edades y creados por una variedad de asociados. Nuevos tutoriales estarán disponibles antes del 8 de Diciembre para lanzar la Hora de Programación.

**Todos los tutoriales de la Hora de Programación:**

  * Requieren un tiempo de preparación mínimo para los profesores
  * Son de auto aprendizaje, lo que permite a los estudiantes trabajar a su propio ritmo y habilidad

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 3) Register your Hour on the map

[Make sure to sign up](<%= hoc_uri('/') %>). We'll send you helpful info as the Hour of Code nears, and you'll see your Hour of Code on our map of worldwide events.

## 4) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.

  * **Pruebe los tutoriales en las computadoras o dispositivos de los estudiantes.** Cerciórese que los tutoriales funcionen correctamente (con audio y video).
  * **Previsualice la página de felicitaciones** para ver lo que los estudiantes verán al terminar. 
  * **Proporcione audífonos para su clase**, o pida a los alumnos que lleven los suyos; si el tutorial que selecciones funciona mejor con sonido.

## 5) Plan ahead based on your technology available

  * **¿No tiene dispositivos suficientes?** use [programación en parejas](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Cuando los estudiantes trabajan en pares, se ayudan el uno al otro y dependen menos del profesor. Además se dan cuenta que en las ciencias computacionales se puede ser sociable y trabajar en equipo.
  * **¿Tiene un ancho de banda limitado?** Muestre los videos al frente del salón de clase, para evitar que cada estudiante descargue el video. O pruebe con los tutoriales desconectados/fuera de línea.

## 6) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * El vídeo original de lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh (Hay versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * El vídeo de lanzamiento de [la Hora de Programación 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), o de <% if @country == 'uk' %> [la Hora de Programación 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [la Hora de Programación 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [El llamado del presidente Obama a que todos los estudiantes aprendan Ciencias de la Computación](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

Most kids don’t know what computer science is. Here are some ideas:

  * Explica en una forma sencilla que incluya ejemplos de aplicaciones que les interesen tanto a niños como a niñas (salvar vidas, ayudar a la gente, conectar personas, etc).
  * Prueba decir: "Piensen acerca de cosas en la vida diaria que usan Ciencias de la Computación: un teléfono celular, un microondas, una computadora, un semáforo... Todas esas cosas necesitan un profesinal en Ciencias de la Computación para ayudar a construirlas."
  * O: "Las Ciencias de la Computación son el arte de combinar ideas humanas y herramientas digitales para incrementar nuestro poder. Los expertos en informática trabajan en muchas áreas diferentes: escriben aplicaciones para teléfonos, curan enfermedades, crean películas animadas, trabajan en redes sociales, construyen robots que exploran otros planetas y muchas cosas más."
  * [Aquí](http://<%= codeorg_url() %>/girls) puedes ver consejos para interesar a las chicas en Ciencias de la Computación. 

## 6) Start your Hour of Code

**Direct students to the activity**

  * Escribe el enlace al tutorial en el tablero. Encuentra el enlace en la [información para el tutorial seleccionado](http://<%= codeorg_url() %>/learn) bajo el número de participantes. [hourofcode.com/co](http://hourofcode.com/co)
  * Indica a los estudiantes que visiten la URL e inicien el tutorial.

**When your students come across difficulties**

  * Indica a los estudiantes, "Pregunta a 3 personas, luego a mi". Pregunta a 3 compañeros y si ellos no conocen la respuesta entonces pregunta al profesor.
  * Alienta a los estudiantes y dales refuerzos positivos: "Lo estás haciendo muy bien, sigue intentando."
  * Está bien responder: "No sé. Encontremos la respuesta juntos." Si no puedes resolver un problema úsalo como una buena lección para toda la clase: "La tecnología no siempre funciona como queremos. Todos juntos somos una comunidad de aprendizaje". Y: "Aprender a programar es como aprender un nuevo idioma, no serás fluido enseguida."

**What to do if a student finishes early?**

  * Los estudiantes pueden ver todos los tutoriales e intentar otra actividad de la Hora de Programación en [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * O pide a los estudiantes que terminen primero que ayuden a los que tegan problemas con la actividad.

**How do I print certificates for my students?**

Each student gets a chance to get a certificate via email when they finish the [Code.org tutorials](http://studio.code.org). You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our [Certificates](http://<%= codeorg_url() %>/certificates) page to print as many certificates as you like, in one fell swoop!

**What comes after the Hour of Code?**

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your children to learn online](http://uk.code.org/learn/beyond). <% else %> To continue this journey, find additional resources for educators [here](http://<%= codeorg_url() %>/educate). Or encourage your children to learn [online](http://<%= codeorg_url() %>/learn/beyond). <% end %> 