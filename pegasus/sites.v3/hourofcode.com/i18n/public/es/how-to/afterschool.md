---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Cómo enseñar una hora de código después de la escuela clases y clubes

### Únete al movimiento e introduce a un grupo de estudiantes a su primera hora de Informática con estos pasos. ¡La hora del código es fácil de ejecutar - incluso para los principiantes! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your after-school class or club.

---

## 1. Mira este vídeo explicativo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Elige un tutorial

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. [¡Pruébalos!](<%= resolve_url('/learn') %>)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promueve tu Hora de Código

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4. Planifica tus necesidades tecnológicas - los ordenadores son opcionales

La mejor experiencia de Hora de Código incluye ordenadores conectados a Internet. Pero **no** se necesita un ordenador para cada niño, y se puede hacer la Hora de Código incluso sin ningún ordenador.

Asegúrate de probar los tutoriales en ordenadores o dispositivos de los estudiantes para asegurarse de que funcionan correctamente en los navegadores con sonido y vídeo. **¿Tiene un ancho de banda limitado?** Muestra los vídeos en el proyector a toda la clase, así los estudiantes no tendrán que descargar los suyos. O prueba los tutoriales sin conexión.

Proporcione auriculares para su clase, o pida a los estudiantes que traign los suyos, si el tutorial que eligió funciona mejor con sonido.

**¿No tienes suficientes dispositivos?** Use [programación por parejas ](https://www.youtube.com/watch?v=vgkahOzFH2Q). Cuando los estudiantes trabajan en parejas, se ayudan el uno al otro y dependen menos del profesor. Además se dan cuenta que en las Ciencias de la Computación son una actividad social y colaborativa.

## 5. Empieza tu Hora del Código con un vídeo inspirador

Empiece su Hora del Código inspirando a los participantes y comentando cómo las Ciencias de la Computación tienen impacto en cada parte de nuestras vidas.

**Muestre un video inspirador:**

- El vídeo original del lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh. Hay versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA).
- El [vídeo mundial de la Hora del Código](https://www.youtube.com/watch?v=KsOIlDT145A)
- [El presidente Obama llama a todos los estudiantes a aprender informática](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Encuentra más vídeos inspiradores [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explique algunas formas en las que la tecnología hace impacto en nuestras vidas, con ejemplos que les interesen tanto a niños como a niñas (hable acerca de las tecnologías que salvan vidas, ayudando a las personas o conectándolas).
- Haga una lista de las cosas que utilizan código en la vida cotidiana.
- - Vea consejos para que las niñas se interesen en la Informática [aquí](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. ¡A Programar!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>) - Or, ask those who finish early to help others who are having trouble.

## 7. Celébralo

- [Print certificates](<%= codeorg_url('/certificates') %>) for your students.
- [Imprima pegatinas de "Hice una Hora de Código!"](<%= resolve_url('/promote/resources#stickers') %>) para sus estudiantes.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Comparta fotos y vídeos del evento de la Hora del Código en las redes sociales. ¡Utilice #HourOfCode y @codeorg para que también podamos resaltar su éxito!

## Otros recursos de Hora del Código para educadores:

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Revise las [ FAQS de Hora de Código](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## ¿Qué viene después de la Hora de Código?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](<%= codeorg_url('/learn/beyond') %>)!

<%= view :signup_button %>