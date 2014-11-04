* * *

title: Resources layout: wide

* * *

<div class="row">
  <h1 class="col-sm-6">
    How to teach one Hour of Code
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="/#join"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

## 1) Probá los tutoriales:

Contamos con una gran variedad de tutoriales muy divertidos de hora de duración, para estudiantes de todas las edades, y pronto agregaremos más.

**Todos los tutoriales:**

  * Requieren mínima preparación previa de parte de los docentes.
  * Son autoguiados, lo que permite que los estudiantes trabajen a su propio ritmo y según su propio nivel de conocimientos.

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 2) Fijate qué hadware necesitás, para la Hora del Código las computadoras son opcionales :)

Si bien es recomendable tener conexión a Internet, no es una condición necesaria. Incluso no hace falta contar con una computadora por chico. Más aún: algunas de las experiencias no requieren computadora.

  * **Probá los tutoriales en las computadoras o dispositivos móviles que vayas a usar.** Asegurate de que funcionen bien (chequeá audio y video).
  * **Mirá la página de felicitaciones**, para ver qué van a ver los alumnos cuando terminen. 
  * **Chequeá el audio**. Si los tutoriales que vas a usar dependen del audio asegurate de contar con auriculares para cada estudiante o de pedirles que traigan los suyos.

## 3) Planeá con tiempo basándote en la tecnología disponible

  * **¿No tenés suficientes dispositivos?** Usá [programación entre pares](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Cuando los alumnos trabajan junto se ayudan mutuamente y dependen mucho menos del docente. Además van a ver que las Ciencias de la Computación son colaborativas y fomentan la interacción social.
  * **¿No tenés buena conexión a Internet?** Podés mostrar videos desde el frente de la clase, así cada chico no tiene que bajárselo en su propia máquina. También podés probar los tutoriales "desenchufados".

## 4) Inspirá a los chicos: mostrales un video

Mostrale a los estudiantes un video motivador para dar comienzo a la Hora del Código. Ejemplos:

  * El video de inicio original de Code.org, presentando a Bill Gates, Mark Zuckerberg y la estrella de la NBA, Chris Bosh (Hay versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * El [video de inicio de la Hora del Código 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), o el <% if @country == 'uk' %> [video de la Hora del Código 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [video de la Hora del Código 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [El Presidente Obama incentivando a todos los estudiantes a aprender informática](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Podés hacer una pequeña introducción para entusiasmar a tus estudiantes**

La mayoría de los niños y adolescentes no saben en qué consiste la informática. He aquí algunas ideas:

  * Da explicaciones de manera simple, que incluyan ejemplos de aplicación que interesen tanto a chicos como chicas (salvar vidas, ayudar a la gente, conectar con la gente, etc.).
  * Intentá: "Piensen sobre cosas de su vida diaria que utilicen la informática: un teléfono celular, un microondas, una computadora, la luz del semáforo… todas estas cosas necesitan un especialista en informática que ayude a construirlas."
  * O: "Las Ciencias de la Computación son el arte de combinar ideas humanas y herramientas digitales para incrementar nuestro poder. Los expertos en informática trabajan en muchas áreas diferentes: escriben aplicaciones para teléfonos, curan enfermedades, crean películas animadas, trabajan en redes sociales, construyen robots que exploran otros planetas y muchas cosas más."
  * [Aquí](http://<%= codeorg_url() %>/girls) puedes ver consejos para interesar a las chicas en Ciencias de la Computación. 

## 5) Empezá tu Hora del Código

**Cómo comenzar la actividad**

  * Escribe el enlace al tutorial en el tablero. Encuentra el enlace en la [información para el tutorial seleccionado](http://<%= codeorg_url() %>/learn) bajo el número de participantes. [hourofcode.com/co](http://hourofcode.com/co)
  * Indica a los estudiantes que visiten la URL e inicien el tutorial.

**Si se encuentran con dificultades**

  * Indica a los estudiantes, "Pregunta a 3 personas, luego a mi". Pregunta a 3 compañeros y si ellos no conocen la respuesta entonces pregunta al profesor.
  * Alienta a los estudiantes y dales refuerzos positivos: "Lo estás haciendo muy bien, sigue intentando."
  * Está bien responder: "No sé. Encontremos la respuesta juntos." Si no puedes resolver un problema úsalo como una buena lección para toda la clase: "La tecnología no siempre funciona como queremos. Todos juntos somos una comunidad de aprendizaje". Y: "Aprender a programar es como aprender un nuevo idioma, no serás fluido enseguida."

**¿Y si un estudiante termina rápidamente?**

  * Los estudiantes pueden ver todos los tutoriales e intentar otra actividad de la Hora de Programación en [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * O pide a los estudiantes que terminen primero que ayuden a los que tegan problemas con la actividad.

**¿Cómo imprimo certificados para mis estudiantes?**

Cada estudiante tiene la oportunidad de obtener un certificado vía email cuando termina los tutoriales. Podés hacer click en el certificado para imprimirlo. Sin embargo, si quieres hacer certificados nuevos para tus estudiantes visita nuestra página [Certificados](http://<%= codeorg_url() %>/certificates) para imprimir todos los certificados que quieras, de una sola vez.

**¿Qué viene después de la Hora del Código?**

La Hora del Código es sólo el primer paso para aprender más sobre cómo funciona la tecnología y cómo crear aplicaciones de software. <% if @country == 'uk' %> Para continuar este camino de aprendizaje podés [animar a los chicos a aprender más online](http://uk.code.org/learn/beyond). <% else %> Para continuar este camino, encuentra [aquí](http://<%= codeorg_url() %>/educate) recursos adicionales para educadores. O anima a tus hijos a aprender más [en línea](http://<%= codeorg_url() %>/learn/beyond). <% end %> <a style="display: block" href="/#join"><button style="float: right;">Sign up your event</button></a>