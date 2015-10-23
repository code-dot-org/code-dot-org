---

title: <%= hoc_s(:title_tutorial_guidelines) %>
layout: wide

---

<%= view :signup_button %>

# Guía para los tutoriales de la Hora de Programación y la semana educativa de Ciencias Computacionales

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>).

Nos gustaría ofrecer una amplia variedad de opciones atractivas, pero el objetivo principal es optimizar la experiencia de los estudiantes y profesores que son nuevos en las Ciencias de la Computación. Por favor usa este documento como guía para la creación de tu actividad, diseñada para usuarios sin experiencia alguna en programación ni Ciencias de la Computación.

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## Índice:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [Cómo serán evaluadas las tutorías en cuánto a inclusión](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [Sugerencias para diseñar tu actividad](#design)
  * [Guía de Marca Registrada](#tm)
  * [Rastrear un Pixel](#pixel)
  * [Promocionar tus tutoriales, CSEdWeek, y Hora de Programación](#promote)
  * [Una nota para estudiantes con discapacidades](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. Idealmente, las instrucciones y las tutorías están integradas directamente en la plataforma de programación, para evitar intercambio de pestañas o ventanas entre la tutoría y la plataforma de programación.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Guía general para crear una actividad de la Hora de Programación

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Anima a los estudiantes a crear algo que puede ser compartido con amigos en línea.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**Volver al principio**](#top)

<a id="inclusion"></a>

## Cómo serán evaluadas las tutorías en cuánto a inclusión

Un comité de educadores en Ciencias de la Computación evaluarán las propuestas con base en medidas cualitativas y cuantitativas, incluyendo resultados de encuestas hechas a un grupo más amplio de educadores.

**Los tutoriales aparecerán en las posiciones más altas si:**

  * alta calidad
  * designed for beginners - among students AND teachers
  * están diseñadas para actividad de 1 hora aproximádamente
  * no requieren de registro
  * no requieren de pago
  * no requieren de ninguna instalación
  * funcionan en diversas plataformas de sistemas operativos, incluso en tabletas y móviles
  * funcionan en múltiples idiomas
  * promueven aprendizaje en todos los grupos demográficos (especialmente los grupos marginados)
  * no se centran solamente en diseño web HTML+CSS - (nuestra meta es las Ciencias de la Computación, no sólo codificación en HTML)

**Los tutoriales aparecerán más abajo si son:**

  * baja calidad
  * tienen un nivel más avanzado de enseñanza (no para principiantes)
  * tienen un soporte limitado de plataformas de sistemas operativos - para plataformas basadas en Web se debe tratar de soportar todo lo siguiente: IE9+, y la ultima versión de Chrome, Firefox y Safari
  * funcionan sólo en inglés
  * reinforce stereotypes that hinder participation by under-represented student groups
  * sirven para promover una plataforma de aprendizaje que cobra

**Los tutoriales NO serán listados si:**

  * no estan diseñados para ser actividades de aproximadamente una hora
  * requieren registro 
  * requieren pago
  * require installation (other than mobile apps)
  * se centran solamente en diseño web HTML+CSS
  * se envían después de la fecha límite, o con información incompleta (vea más abajo)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

La principal meta de la campaña de la Hora de Programación es ampliar la participación en Ciencias de Computación por parte de maestros y estudiantes, y además demostrar que las Ciencias de Computacion son accesibles a todos y "más fáciles de lo que crees". Desde varios puntos de vista, ésta meta se alcanza de mejor manera ofreciendo a los estudiantes y maestros menos opciones y más simples, concentrándose en las opciones de más alta calidad para un usuario nuevo. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**Volver al principio**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**Necesitarás:**

  * Tu nombre, logo (jpg, png, etc.)
  * URL para una imagen de pantalla o de marketing de la actividad de la Hora de Programación. Las imágenes deben tener una resolución de 446 x 335 exactamente. Si no se proporciona una imagen adecuada, podremos tomar una de tu tutoría O podremos NO incluirla.
  * Enlace URL para el logo
  * Nombre de la actividad
  * URL para la actividad
  * URL para las notas del profesor (opcional, ve los detalles más abajo)
  * Descripción de la actividad (móvil y escritorio) 
      * **Caracteres máximos permitidos para versión de escritorio:** 384
      * **Caracteres máximos permitidos para versión móvil:** 74
      * Por favor incluye en la descripción si es guiado por el estudiante o guiado por el profesor. Adicionalmente, algunas escuelas están interesadas en conocer si las actividades de la de Hora de Programación reflejan estándares comunes o de próxima generación. Si la actividad se centra en estándares específicos, incluye esta información.
  * Una lista de plataformas compatibles y/o probadas: 
      * Web based: Which platforms have you tested 
          * Versiones para OS - Mac, Win
          * Navegadores - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS Safari móvil (optimizado para móvil)
          * Android Chrome (optimizado para móvil)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Desconectado
  * Una lista de lenguajes soportados y formato apropiado: 
      * Los tutorías deben especificar qué lenguajes soportan usando códigos de lenguaje de de 2 caracteres, ej.: inglés - en, japonés - ja
      * Si es necesaria mayor especificación, usa guiones, ej.: fr-be para francés (Bélgica) o fr-ca para francés (Canadá)
      * ***Nota: la detección del lenguaje es trabajo de quien provee la tutoría, nosotros redireccionaremos a todos los usuarios al único URL ofrecido.*** 
  * Si envías una tutoría en línea, necesitamos saber si es [compatible con COPPA](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) o no.
  * Nivel(es) de grado recomendados para los posibles usuarios. Te puedes referir a [Estándares de la Computer Science Teachers' Association para K-12](http://csta.acm.org/Curriculum/sub/K12Standards.html) para conceptos de computación apropiados al grado. Ejemplo de niveles de grado incluyen: 
      * Primaria: grados K-2 ó 3-5
      * Secundaria: grados 6-8
      * Preparatoria: grados 9-12
      * Todas las edades
  * Por favor incluye también nivel de conocimiento en computación requerido dentro del grado: Principiante, Intermedio o Avanzado. El sitio web de la Hora de Programación destacará principalmente actividades para Principiantes. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Requisitos técnicos: 
      * Con el fin de realizar un seguimiento más preciso de la participación, queremos que todos las terceras partes asociadas con las tutorías incluyan imágenes de seguimiento de 1 píxel en la primera y la última páginas de sus tutorías para la Hora de Programación. Coloca una imagen-pixel inicial en la página de inicio y una final en la última página. No coloques los pixeles en las páginas intermedias). Consulte la sección de Seguimiento de Pixel abajo para más detalles. 
      * Al finalizar tu actividad, los usuarios deben ser dirigidos a [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) where they will be able to: 
          * Compartir en las redes sociales que completaron la Hora del Programación
          * Recibir un certificado que dice que completaron la Hora de Programación
          * Ver tablas con los países/ciudades que tienen las mayores tasas de participación en las actividades de la Hora de Programación
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) as well. 
  * *(Opcional)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * Para actividades en línea (especialmente aplicaciones para smartphone/tablet): 
          * Número de usuarios
          * Cuántos completaron la tarea
          * Tiempo promedio en la tarea
          * Número de líneas totales de código escrito por todos los usuarios
          * Cuántos continuaron con más aprendizaje (medido a través de cualquier usuario que finaliza la tarea y va hacia tareas adicionales en tu sitio)
      * Para las actividades fuera de línea 
          * Número de descargas de la versión en papel de la actividad (si corresponde)

[**Volver al principio**](#top)

<a id="design"></a>

## Sugerencias para diseñar tu actividad

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Bajo ninguna circunstancia se puede utilizar el nombre o logotipo de Code.org. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Asegúrese de que el estudiante promedio pueda finalizar confortablemente en una hora.** Considere agregar una actividad abierta al final, para los alumnos que avancen más rápidamente durante la lección. Recuerde que la mayoría de los niños son principiantes iniciales para las ciencias de la computación y la programación.

**Incluya las notas del profesor.** La mayoría de las actividades deben ser dirigidas por alumnos. Pero si una actividad debe ser facilitada o administrada por el profesor, por favor incluya instrucciones claras y simples en forma de "notas de profesor" en la URL enviada con su actividad. No solo los alumnos son principiantes, algunos profesores también lo son. Incluya información como:

  * Nuestro tutorial funciona mejor en las siguientes plataformas y navegadores
  * Does it work on smartphones? Tablets?
  * ¿Recomiendas programar en pares? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Incorpore retroalimentación al final de la actividad.** (Por Ejemplo: “¡Ha finalizado 10 niveles y aprendido sobre ciclos! ¡Felicidades!”)

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HoraDeCódigo” o “He hecho una #HoraDeCódigo como parte de la #CSEdWeek. ¿y tu? @Scratch.” Use el HashTag **#HoraDeCódigo** (Con letras H, D, C mayúsculas)

**Create your activity in Spanish or in other languages besides English.** ]

**Explica o conecta la actividad a un contexto social significativo.** ¡La programación se convierte en un superpoder cuando los estudiantes ven como puede mejorar el mundo!

** No hagas necesario el login o pago para que los estudiantes puedan probar el tutorial. ** Los tutoriales que requieren login o pago no serán listados.

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * El conductor controla el ratón y el teclado.
  * El navegante hace sugerencias, señala errores y hace preguntas. 
  * Los estudiantes deben cambiar roles por lo menos dos veces en una sesión.

Beneficios de la programación en parejas:

  * Los estudiantes pueden ayudarse mutuamente en lugar de pedir ayuda al profesor
  * Mostrar que la codificación no es una actividad individual, sino que involucra la interacción social
  * No todas las aulas o laboratorios tienen suficientes computadoras para una experiencia de 1:1

[**Volver al principio**](#top)

<a id="tm"></a>

## Guía de Marca Registrada

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Una pieza de esto es para proteger la marca "Hora de código" para evitar confusiones. Muchos de nuestros tutores asociados han usado "Hora de código" en sus sitios web. No queremos evitar este uso, pero queremos asegurarnos de que encaje dentro de unos límites:

  1. Cualquier referencia a "Hour Of Code" debe usarse de tal manera que no sugiera que es tu propia marca, sino hacer referencia a la "Hour Of Code" como un movimiento de base. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Un mal uso es: "Participa en la Hour of Code de ACME Corp"
  2. Usa un "TM" subscrito en los lugares más donde menciones la "Hora de Programación", así como en tu sitio web o en descripciones interna de apps
  3. Incluye en la página (o en el pie de página") links hacia las paginas de CSEdWeek y Code.org que digan lo siguiente:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No usar la marca "Hora de Programación" o "Hour Of Code" en inglés en nombres de apps

[**Volver al principio**](#top)

<a id="pixel"></a>

## Rastrear un Pixel

Para rastrear con más precisión la participación le pedimos a cada socio que hace tutoriales incluir una imagen de 1 pixel en la primera y última hoja de sus tutoriales de Hora de Código (Una imagen de un pixel al inicio y una imagen de un pixel en la página final. No en páginas intermedias).

Esto permitirá a los usuarios cuentar directamente reclutar y visitar su página web para hacer su hora de código, o los usuarios que la visitan cuando un profesor escriba tu URL directamente en su pizarra. Conducirá a cuentas de participación más precisas para el tutorial, que le ayudará a atraer a los usuarios. Si usted integrar el pixel al final también permitirá medir las tasas de finalización.

Si tu tutorial es aprobado e incluido en la última páginal, Code.org le proporcionará un seguimiento único píxel para integrar su tutorial. Ver ejemplo abajo.

Nota: esto no es importante hacerlo para instalar aplicaciones (apps iOS/Android o aplicaciones de escritorio-install)

Ejemplo de píxeles de rastreo para AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**Volver al principio**](#top)

<a id="promote"></a>

## Promocionar tus tutoriales, CSEdWeek, y Hora de Programación

Pedimos a todos que promocionen sus tutorías de 1 hora con todos sus usuarios. Please direct them to ***your*** Hour of Code page. Es mucho más probable que tus usuarios reaccionen a un mensaje tuyo acerca de tu tutoría. Usa la campaña internacional de la Hora de Programación para la Semana de Educación en Ciencias de Computación como una excusa para animar a usuarios a invitar a otros a unirse, para alcanzar un total de 100 millones de participantes.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Promueve la Hora de Programación utilizando las redes sociales, medios de comunicación tradicionales, listas de correo, etc., usando el hashtag **#HourOfCode** (con letra mayúscula H, O, C)
  * Sé el anfitrión de un evento local o pídele a tus empleados que organicen un evento en escuelas locales o grupos comunitarios.
  * Consulta nuestro kit de recursos para más información (próximamente).

[**Volver al principio**](#top)

<a id="disabilities"></a>

## Una nota especial para estudiantes con discapacidades

Si haz creado una tutoría orientada a estudiantes con visión deteriorada, nos gustaría resaltarlo para estudiantes con lectores de pantalla. Aún no hemos recibido este tipo de tutoría, y nos encantaría incluirlo como una opción para éstos estudiantes.

[**Volver al principio**](#top)

<%= view :signup_button %>