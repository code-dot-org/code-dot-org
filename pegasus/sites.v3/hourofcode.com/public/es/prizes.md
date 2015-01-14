

<div class="row">
  <h1 class="col-sm-9">
    Premios para cada organizador
  </h1>
</div>

<% if @country == 'us' %>

## ¡Un aula ganará un viaje a Washington D.C. para una Hora de Código, histórica y super secreta! {#dc}

Code.org seleccionará un aula afortunada para asistir a un evento muy especial de la Hora de Código en la capital del país — ¡tan especial que todos los detalles están en secreto! Los estudiantes ganadores (con acompañantes) podrán disfrutar de un viaje con todos los gastos cubiertos a Washington, D.C. Los estudiantes participarán en un día lleno de actividades secretas el lunes 8 de diciembre.

<% end %>

<% if @country == 'us' %>

<h2 id="hardware_prize" style="font-size: 18px">
  51 escuelas ganarán un conjunto de computadoras portátiles para toda una clase (o $10,000 para otra tecnología)
</h2>

Una escuela afortunada en ***cada*** estado de los EEUU (+ Washington D.C.) ganaron un valor de $10,000 en implementos de tecnología. [**Mira a los 51 ganadores**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>

<% if @country == 'uk' %>

## ¡Aulas con suerte ganan una videoconferencia con un invitado! {#video_chat}

20 aulas afortunadas serán invitadas a participar de un video chat para celebrar la Hora de Código el 8 de diciembre del 2014. Tus estudiantes podrán hacer preguntas y hablar con líderes en la industria de la tecnología. **El periodo de inscripción ha terminado. Los ganadores serán anunciados pronto.**

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## ¡100 aulas ganan un video chat con un invitado! {#video_chat}

100 aulas afortunadas serán invitadas a participar en la cámara en vivo Q&As con titanes de la tecnología y famosos amantes de la tecnología. Los estudiantes podrán hacer preguntas y conversar con estos interesantes modelos a seguir para poner en marcha su Hora de Código.

### Sintoniza a los chats en vivo, o ve los videos archivados:

**Martes**, 9 de diciembre   
10:00 AM PST - [Lyndsey Scott](http://www.youtube.com/watch?v=6s5oxGmbXy4)   
12:00 PM PST - [Jack Dorsey](http://www.youtube.com/watch?v=PBGJfpbSWjY)   
3:00 PM PST - [Ashton Kutcher](http://www.youtube.com/watch?v=d1LuhJPJP9s)   


**Miércoles**, 10 de diciembre   
7:30 AM PST - [Cory Booker](http://www.youtube.com/watch?v=wD0Heuvv87I)   
10:00 AM PST - [JR Hildebrand](http://www.youtube.com/watch?v=DfhAdnosy58)   
11:00 AM PST - [Clara Shih](http://www.youtube.com/watch?v=2p7uhb1qulA)   
12:00 PM PST - [Jessica Alba](http://www.youtube.com/watch?v=Kxm7PK-iS3c)   


**Jueves**, 11 de diciembre   
5:30 AM PST - [Karlie Kloss](http://www.youtube.com/watch?v=6SzsRGTmjy0)   
9 AM PST - [David Karp](http://www.youtube.com/watch?v=1tVei0jOyVQ)   
10 AM PST - [Jess Lee](http://www.youtube.com/watch?v=wXKPrtfaoi8)   
11 AM PST - [Usher](http://www.youtube.com/watch?v=xvQSSaCD4yw)   


**Viernes**, 12 de diciembre   
10:00 AM PST - [Hadi Partovi](http://www.youtube.com/watch?v=PDnjt6iIBzo)

&#42;Los videos de las charlas de Bill Gates y Sheryl Sandberg estarán disponibles en [nuestro canal de YouTube](https://www.youtube.com/user/CodeOrg/)

### Las celebridades que este año participarán en el video chat:

<%= view :video_chat_speakers %>

<% end %>

## Cada organizador gana un código de regalo en agradecimiento {#gift_code}

¡Cada educador que sea anfitrión de una Hora de Código para sus estudiantes recibirá 10 GB en Dropbox o $10 de crédito en Skype como regalo de agradecimiento!

<% if @country == 'ca' %>

## Proyecto brillante $2000 {#brilliant_project}

[Brilliant Labs](http://brilliantlabs.com/hourofcode) proveerá los recursos necesarios, de hasta un valor de $2,000.00, para implementar un proyecto basado en tecnología, centrado y con la participación de los estudiantes, en un aula en cada provincia y territorio (nota: con la excepción de Québec). Para calificar, los profesores deberán registrarse en hourofcode.com/ca#signup hasta el 6 de diciembre del 2014. Para más detalles, términos y condiciones, por favor visite [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## Escuelas con suerte ganarán un taller Actua {#actua_workshop}

15 escuelas afortunadas en Canadá recibirán como regalo 2 talleres involucrados en STEM presentados por uno de los [33 Miembros de la Red](http://www.actua.ca/about-members/) Actua. Miembros Actua, presentan talleres de ciencia, tecnología, ingeniería, y matemáticas (STEM) que están conectados al currículo de estudio provincial y territorial de los estudiantes de K-12. Estos experiencias en-aula, son presentados por estudiantes de licenciatura modelo altamente entrenados en STEM. ¡Los maestros pueden esperar demostraciones emocionantes, experimentos interactivos, y mucha diversión STEM para sus alumnos! Por favor tomen nota de que la disponibilidad de los talleres en-aula puede variar en comunidades rurales.

[Actua](http://actua.ca/) el el líder en trabajo social de Ciencia, Tecnología, Ingeniería, y Matemáticas. Anualmente Actua alcanza más de 225,000 jóvenes en más de 500 comunidades gracias una programación que derriba barreras.

## ¡Kids Code Jeunesse le ayudará en el aula! {#kids_code}

¿Eres un profesor que quiere introducir la programación a sus estudiantes y requiere de apoyo en el aula? Cualquier maestro que guste tener a una voluntaria de Programación de Computadoras para asistirle en el aula, puede contactar a [Kid Code Jeunesse](http://www.kidscodejeunesse.org), ¡y buscaremos la manera de proveer soporte! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) es una firma sin fin de lucro Canadiense con el objetivo de proveer a cada niño y niña con una oportunidad para aprender a escribir código. Y a todo maestro, la oportunidad de aprender como enseñar programación de computadoras en el aula.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 salones de clase podrán ganar un equipo de robots programables {#programmable_robots}

[Sphero](http://www.gosphero.com/) es la bola robótica controlada por una app que está cambiando la forma en que los estudiantes aprenden. Accionado por [lecciones SPRK](http://www.gosphero.com/education/), estos robots redondos les dan a los estudiantes un divertido curso corto en programación al mismo tiempo que les agudizan las habilidades en matemáticas y ciencias. Sphero está regalando 100 juegos para el aula - cada uno incluye 5 robots. Cualquier aula (pública o privada) en los EEUU o Canadá es elegible para ganar éste premio.

<% end %>

## ¿Más preguntas sobre los premios? {#more_questions}

Revisa los [Términos y Condiciones](<%= hoc_uri('/prizes-terms') %>) o visita nuestro foro para leer las [Preguntas Frecuentes (FAQs)](http://support.code.org) y hacer tus propias preguntas.

<% if @country == 'us' %>

# Preguntas Frecuentes {#faq}

## ¿Es necesario que toda la escuela participe para tener la oportunidad de ganar $10,000 en hardware?

Sí. Toda tu escuela tiene que participar para ser elegible al premio, pero sólo es necesario que una persona haga el registro y envíe el formulario de solicitud al Premio Hardware que se encuentra [aquí](<%= hoc_uri('/prizes') %>).

## ¿Es necesario que toda la escuela participe para tener la oportunidad de ganar un chat de tecnología?

Cualquier clase (en escuelas públicas o privadas) es elegible para ganar este premio. No es necesario que toda la escuela participe.

## ¿Escuelas que no sean públicas pueden ganar el premio de chat por vídeo?

¡Sí! Escuelas privadas e independientes son elegibles, así como las públicas, para ganar los premios de chat por vídeo.

## ¿Pueden las escuelas por fuera de los Estados Unidos ganar el premio de chat por vídeo?

No, desafortunadamente debido a dificultades logísticas no podemos ofrecer el premio de chat por vídeo a escuelas por fuera de Estados Unidos y Canadá. Todos los organizadores internacionales **son** elegibles para recibir espacio en Dropbox o crédito en Skype.

## ¿Por qué el premio de $10.000 en hardware sólo está disponible para las escuelas públicas?

Estaríamos encantados de ayudar a los maestros en escuelas públicas y privadas por igual, pero en este momento se trata de logística. Nos hemos asociado con [DonorsChoose.org](http://donorschoose.org) para la administración de los fondos para los premios a las aulas, esta entidad sólo trabaja con escuelas públicas, nivel K-12, en los Estados Unidos. Según DonorsChoose.org, ellos son capaces de acceder a información más precisa y coherente para las escuelas públicas.

## Estoy fuera de los Estados Unidos. ¿Puedo calificar para los premios?

Debido al reducido tamaño de nuestro equipo de trabajo a tiempo completo, Code.org no puede manejar la logística de entregar premios internacionales. Debido a esto las personas por fuera de los Estados Unidos no pueden calificar para los premios.

## ¿Cuándo es la fecha límite para aplicar al premio de hardware?

Para calificar, toda tu escuela debe registrarse para la Hora de Programación y completar el [formulario de Aplicación a Hardware](<%= hoc_uri('/prizes') %>) a más tardar el 14 de Noviembre de 2014. Una escuela en cada estado de Estados Unidos podrá ganar un conjunto de computadoras para toda una generación. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1ro de diciembre de 2014.

## ¿Cuándo es la fecha límite para ser elegible para ganar un chat de tecnología?

Para calificar, debes registrar tu aula para la Hora de Programación a más tardar el 14 de noviembre de 2014. Las aulas ganarán un chat de vídeo con una celebridad. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1ro de diciembre de 2014.

## ¿Cuándo se me notificará si mi escuela o aula gana un premio?

Para calificar, toda tu escuela debe registrarse para la Hora de Programación y completar el [formulario de Aplicación a Hardware](<%= hoc_uri('/prizes') %>) a más tardar el 14 de Noviembre de 2014. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1ro de diciembre de 2014.

## Si toda mi escuela no puede participar en la Hora de Programación durante la semana de la educación en ciencias de la computación (8-14 de diciembre), ¿Puedo aún calificar para los premios?

Sí, sólo asegúrate de enviar un plan logístico que muestre cómo toda tu escuela está participando en un periodo de tiempo razonable y regístrate para la Hora de Programación el 14 de noviembre.<% end %>