---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Cómo enseñar una Hora de Código</h1>

Únete al movimiento e introduce a un grupo de estudiantes a su primera hora de Informática con estos pasos. ¡La hora del código es fácil de ejecutar - incluso para los principiantes! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Mira este vídeo explicativo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Elige un tutorial para tu hora

Ofrecemos una variedad de divertidos [tutoriales guiados por estudiantes](<%= resolve_url('/learn') %>) para todos los grupos de edad y niveles de experiencia. Los estudiantes realizan las actividades por su cuenta, aunque muchas actividades incluyen planes de lecciones para los profesores (verás el enlace cuando hagas clic en la actividad) para guiar la discusión o ampliar la actividad. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promueve tu Hora de Código

Promociona tu Hora de Código [con estas herramientas](<%= resolve_url('/promote/resources') %>) y anima a otros a organizar sus propios eventos.

## 4. Planifica tus necesidades tecnológicas - los ordenadores son opcionales

La mejor experiencia de Hora de Código incluye ordenadores conectados a Internet. Pero **no** se necesita un ordenador para cada niño, y se puede hacer la Hora de Código incluso sin ningún ordenador.

Asegúrate de probar los tutoriales en ordenadores o dispositivos de los estudiantes para asegurarse de que funcionan correctamente en los navegadores con sonido y vídeo. **¿Tiene un ancho de banda limitado?** Muestra los vídeos en el proyector a toda la clase, así los estudiantes no tendrán que descargar los suyos. O prueba los tutoriales sin conexión.

Proporcione auriculares para su clase, o pida a los estudiantes que traign los suyos, si el tutorial que eligió funciona mejor con sonido.

**¿No tienes suficientes dispositivos?** Use [programación por parejas ](https://www.youtube.com/watch?v=vgkahOzFH2Q). Cuando los estudiantes trabajan en parejas, se ayudan el uno al otro y dependen menos del profesor. Además se dan cuenta que en las Ciencias de la Computación son una actividad social y colaborativa.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Comienza tu Hora del Código con un orador o video inspirador

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Muestre un video inspirador:**

- El video original de lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh. (Existen versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**No hay problema si usted y sus estudiantes son nuevos en Informática. Aquí tiene algunas ideas para presentar su actividad de Hora de Código:**

- Explica algunas formas en las que la tecnología hace impacto en nuestras vidas, con ejemplos que les interesen tanto a niños como a niñas (hable acerca de las tecnologías que salvan vidas, que ayudan apersonas, que las conecta, etc.).
- Como clase, liste cosas que usan programación en la vida cotidiana.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. ¡A Programar!

**Dirije a los estudiantes a la actividad**

- Escribe el enlace del tutorial en una pizarra. Encuentra el enlace que figura en la [información del tutorial seleccionado](<%= resolve_url('/learn')%>) debajo del número de participantes.

**Cuando los estudiantes encuentran dificultades, está bien responder:**

- "No sé. Vamos a averiguarlo juntos."
- "La tecnología no siempre funciona como queremos."
- "Aprender a programar es como aprender un nuevo idioma; usted no tendrá fluidez inmediatamente."

**¿Qué hacer si un estudiante termina antes?**

- Los estudiantes pueden ver todos los tutoriales y [probar otra actividad de la Hora del Código](<%= resolve_url('/learn')%>).
- O pida a los estudiantes que terminen primero, que ayuden a los que tengan problemas con la actividad.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celébralo

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [Imprima pegatinas de "Hice una Hora de Código!"](<%= resolve_url('/promote/resources#stickers') %>) para sus estudiantes.
- [Pida camisetas personalizadas](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) para su escuela.
- Comparta fotos y vídeos del evento de la Hora del Código en las redes sociales. ¡Utilice #HourOfCode y @codeorg para que también podamos resaltar su éxito!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Otros recursos de Hora del Código para los educadores:

- Visite el [Foro de Maestros de Hora de Código](http://forum.code.org/c/plc/hour-of-code) para obtener consejos, comprensión y apoyo de otros educadores. <% if @country == 'us' %>
- Revise las [ FAQS de Hora de Código](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## ¿Qué viene después de la Hora de Código?

La Hora del Código es sólo el primer paso de un viaje para aprender más de cómo funciona la tecnología y cómo crear aplicaciones de software. Para continuar este viaje:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>