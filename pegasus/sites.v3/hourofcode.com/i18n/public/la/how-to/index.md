---
title: '<%= hoc_s(:title_how_to) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Cómo enseñar una Hora de Código</h1>

Únete al movimiento e introduce a un grupo de estudiantes a su primera hora de Informática con estos pasos. ¡La hora del código es fácil de ejecutar - incluso para los principiantes! Si desea un juego extra de manos para ayudar, usted puede encontrar un [ voluntario local](<%= resolve_url('https://code.org/volunteer/local') %>) para ayudar a ejecutar un hora de código en la clase.

## 1. Mira este vídeo explicativo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Elige un tutorial para tu hora

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promueve tu Hora de Código

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Planifica tus necesidades tecnológicas - los ordenadores son opcionales

La mejor experiencia de Hora Code incluye computadoras con conexión a internet. Pero **no** necesitas un computador para cada niño, incluso se puede hacer La Hora del Código sin ningún computador.

Asegúrate de probar los tutoriales en ordenadores o dispositivos de los estudiantes para asegurarse de que funcionan correctamente en los navegadores con sonido y vídeo. **¿Tiene un ancho de banda limitado?** Muestra los vídeos en el proyector a toda la clase, así los estudiantes no tendrán que descargar los suyos. O prueba los tutoriales sin conexión.

Proporcione audífonos o auriculares, o pida a los estudiantes que traigan los suyos, en caso de que el tutorial funcione mejor con sonido.

**¿No cuenta con suficientes dispositivos? ** Utilice [programación en pareja](https://www.youtube.com/watch?v=vgkahOzFH2Q). Cuando los estudiantes trabajan en parejas, se ayudan mutuamente y dependen menos del profesor. También observarán que las ciencias de la computación es sociable y cooperativa.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Comienza tu Hora del Código con un orador o video inspirador

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Muestre un video inspirador:**

- El video original de lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh. (Existen versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
- Encuentre más [recursos](<%= resolve_url('https://code.org/inspire') %>) y [vídeos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)motivadores.

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explica algunas formas en las que la tecnología hace impacto en nuestras vidas, con ejemplos que les interesen tanto a niños como a niñas (hable acerca de las tecnologías que salvan vidas, que ayudan apersonas, que las conecta, etc.).
- Como clase, hagan una lista de cosas que usan programación en el día a día.
- Mira consejos para que las niñas se interesen por la informática [aquí](<%= resolve_url('https://code.org/girls')%>).

## 6. ¡A Programar!

**Direct students to the activity**

- Escribe el enlace del tutorial en una pizarra. Encuentra el enlace que figura en la [información del tutorial seleccionado](<%= resolve_url('/learn')%>) debajo del número de participantes.

**When your students come across difficulties it's okay to respond:**

- "No lo sé. Vamos a averiguarlo juntos."
- "La tecnología no siempre funciona de la manera que queremos."
- "Aprender a programar es como aprender un nuevo idioma; No tendrás fluidez de inmediato."

**What if a student finishes early?**

- Los estudiantes pueden ver todos los tutoriales y [probar otra actividad de la Hora del Código](<%= resolve_url('/learn')%>).
- O pida a los estudiantes que terminen primero que ayuden a los que tengan problemas con la actividad.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celébralo

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Imprime certificados](<%= resolve_url('https://code.org/certificates')%>) para tus estudiantes.
- [Imprima stickers de "¡Yo hice una Hora del Código!"](<%= resolve_url('/promote/resources#stickers') %>) para sus estudiantes.
- [Ordene camisetas personalizadas](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) para su escuela.
- Comparte fotos y vídeos del evento de la Hora del Código en las redes sociales. ¡Utilice #HourOfCode y @codeorg para que también podamos resaltar tu éxito!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Otros recursos de la Hora del Código para educadores:

- Visite el [Foro para Profesores de La Hora del Código](http://forum.code.org/c/plc/hour-of-code) para obtener consejos, tips y apoyo de otros docentes. <% if @country == 'us' %>
- Revise las [Preguntas Frecuentes de La Hora del Código](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## ¿Qué viene después de la Hora del Código?

La Hora del Código es sólo el primer paso de un viaje para aprender más de cómo funciona la tecnología y cómo crear aplicaciones de software. Para continuar este viaje:

- Anima a los estudiantes a seguir [aprendiendo online](<%= resolve_url('https://code.org/learn/beyond')%>).
- [Asista a](<%= resolve_url('https://code.org/professional-development-workshops') %>) un taller presencial de 1 día, para recibir entrenamiento por un facilitador experimentado en Ciencias de la Computación. (Sólo para educadores de Estados Unidos)

<%= view :signup_button %>