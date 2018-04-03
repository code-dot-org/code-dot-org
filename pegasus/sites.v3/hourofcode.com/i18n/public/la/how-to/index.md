---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Cómo enseñar una Hora de Código</h1>

Únete al movimiento e introduce a un grupo de estudiantes a su primer hora de ciencias de la computación con los siguientes pasos. La hora de código es fácil de hacer - incluso para principiantes! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

## 1. Mira este vídeo explicativo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Elige un tutorial para tu hora

Ofrecemos una variedad de divertidos [tutoriales guiados por estudiantes](<%= resolve_url('/learn') %>) para todos los grupos de edad y niveles de experiencia. Los estudiantes realizan las actividades por su cuenta, aunque muchas actividades incluyen planes de lecciones para los profesores (verás el enlace cuando hagas clic en la actividad) para guiar la discusión o ampliar la actividad. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promueve tu Hora de Código

Promociona tu Hora de Código [con estas herramientas](<%= resolve_url('/promote/resources') %>) y anima a otros a organizar sus propios eventos.

## 4. Planifica tus necesidades tecnológicas - los ordenadores son opcionales

La mejor experiencia de Hora Code incluye computadoras con conexión a internet. Usted **no** necesita una computadora para cada niño, incluso se puede hacer La Hora del Código sin ningúna computadora.

Asegúrese de probar los tutoriales en los computadores de os estudiantes o en los dispositivos para asegurar que trabajan apropiadamentesobre los navegadores con sonido y video. ** ¿Tiene un ancho de banda bajo? </ strong> Planifique mostrar videos en la parte delantera de la clase, para que cada alumno no descargue sus propios videos. O intente probar los tutoriales sin conexión a internet.</p> 

Proporcione audifonos para sus claes, o digale a los estudinates que traigan los propios, en caso de que el tutorial que usted elija funcione mejor con sonido.

**¿No cuenta con suficientes dispositivos? ** Utilice [programación en pareja](https://www.youtube.com/watch?v=vgkahOzFH2Q). Cuando los estudiantes trabajan en parejas, se ayudan mutuamente y dependen menos del profesor. También observarán que las ciencias de la computación es sociable y cooperativa.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Comienza tu Hora del Código con un orador o video inspirador

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Muestre un video inspirador:**

- El video original de lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh. (Existen versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**No hay problema si usted y sus estudiantes son nuevos en Informática. Aquí tiene algunas ideas para presentar su actividad de Hora de Código:**

- Explica algunas formas en las que la tecnología hace impacto en nuestras vidas, con ejemplos que les interesen tanto a niños como a niñas (hable acerca de las tecnologías que salvan vidas, que ayudan apersonas, que las conecta, etc.).
- Como clase, hagan una lista de cosas que usan programación en el día a día.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. ¡A Programar!

**Dirije a los estudiantes a la actividad**

- Escribe el enlace del tutorial en una pizarra. Encuentra el enlace que figura en la [información del tutorial seleccionado](<%= resolve_url('/learn')%>) debajo del número de participantes.

**Cuando los estudiantes encuentran dificultades, está bien responder:**

- "No lo sé. Vamos a averiguarlo juntos."
- "La tecnología no siempre funciona de la manera que queremos."
- "Aprender a programar es como aprender un nuevo idioma; No tendrás fluidez de inmediato."

**¿Qué hacer si un estudiante termina antes?**

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

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
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

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>