---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Cómo enseñar la Hora de Código en su clase

### Únete al movimiento e introduce a un grupo de estudiantes a su primer hora de ciencias de la computación con los estos pasos. La hora de código es fácil de hacer - incluso para principiantes! Si desea un par de manos adicionales para ayudar, puede encontrar un [voluntario local](<%= codeorg_url('/volunteer/local') %>) para ayudarlo a organizar una Hora de Código en tu clase.

### Dale un vistazo a nuestra [guía de participación](<%= localized_file('/files/participation-guide.pdf') %>) si aún tienes preguntas.

---

## 1. Mira este vídeo explicativo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Elige un tutorial para tu hora

Ofrecemos una variedad de divertidos [tutoriales guiados por estudiantes](<%= resolve_url('/learn') %>) para todos los grupos de edad y niveles de experiencia. Los estudiantes realizan las actividades por su cuenta, aunque muchas actividades incluyen planes de lecciones para los profesores (verás el enlace cuando hagas clic en la actividad) para guiar la discusión o ampliar la actividad. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promueve tu Hora de Código

Promociona tu Hora de Código [con estas herramientas](<%= resolve_url('/promote/resources') %>) y anima a otros a organizar sus propios eventos.

## 4. Planifica tus necesidades tecnológicas - los ordenadores son opcionales

La mejor experiencia de Hora Code incluye computadoras con conexión a internet. Usted **no** necesita una computadora para cada niño, incluso se puede hacer La Hora del Código sin ningúna computadora.

Asegúrese de probar los tutoriales en los computadores o en los dispositivos de los estudiantes para asegurar que trabajan apropiadamente los navegadores con sonido y video. ** ¿El ancho de banda es bajo? ** Planifique mostrar videos en la parte delantera de la clase, para que el alumno no tenga que descargarlos individualmente. O intente probar los tutoriales sin conexión a internet.

Proporcione audífonos, o pida a los estudiantes que traigan los suyos, en caso de que el tutorial que usted elija funcione mejor con sonido.

**¿No cuenta con suficientes dispositivos? ** Utilice [programación en pareja](https://www.youtube.com/watch?v=vgkahOzFH2Q). Cuando los estudiantes trabajan en parejas, se ayudan mutuamente y dependen menos del profesor. También observarán que las ciencias de la computación es sociable y cooperativa.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Comienza tu Hora del Código con un orador o video inspirador

**Invite a un [voluntario local](<%= codeorg_url('/volunteer/local') %>) para inspirar a sus alumnos hablando de la amplitud de posibilidades en informática.** ¡Hay miles de voluntarios en todo el mundo listos para ayudarlo con su Hora del código a través de ya sea una visita al aula o video chat con sus estudiantes!

**Muestre un video inspirador:**

- El video original de lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh. (Existen versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
- Encuentre más [recursos](<%= codeorg_url('/inspire') %>) inspiradores y [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**No hay problema si usted y sus estudiantes son nuevos en las ciencias de la computación. Aquí hay algunas ideas para presentar su actividad de La Hora del Código:**

- Explica algunas formas en las que la tecnología hace impacto en nuestras vidas, con ejemplos que les interesen tanto a niños como a niñas (hable acerca de las tecnologías que salvan vidas, que ayudan apersonas, que las conecta, etc.).
- Como clase, hagan una lista de cosas que usan programación en el día a día.
- Vea consejos para que las chicas se interesen en la informática [aquí](<%= codeorg_url('/girls') %>).

## 6. ¡A Programar!

**Dirija a los estudiantes en la actividad**

- Escribe el enlace del tutorial en una pizarra. Encuentra el enlace que figura en la [información del tutorial seleccionado](<%= resolve_url('/learn')%>) debajo del número de participantes.

**Cuando los estudiantes se encuentren con dificultades, está bien responder:**

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

- [Imprime certificados](<%= codeorg_url('/certificates')%>) para tus estudiantes.
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

- Anima a los estudiantes a continuar [aprendiendo en línea](<%= codeorg_url('/learn/beyond')%>).
- [Asista a un dia](<%= codeorg_url('/professional-development-workshops') %>) de adiestramiento y reciba entrenamiento de una facilitador con experiencia en ciencias de computadoras. (U.S. educadores solamente)

<%= view :signup_button %>