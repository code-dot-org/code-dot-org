---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Cuelga estos carteles en tu escuela

<%= view :promote_posters %>

<a id="banners"></a>

## Incluye estas pancartas en tu sitio web

[![imagen](/images/fit-250/banner1.jpg)](/images/banner1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/fit-250/banner3.jpg)](/images/banner3.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/fit-500/banner5.jpg)](/images/banner5.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="social"></a>

## Publica esto en tus redes sociales

[![imagen](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![imagen](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![imagen](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envía estos correos electrónicos para ayudar a promover la Hora de Programación

<a id="email"></a>

## Pídele a tu escuela, empleador o amigos que se registren:

Las computadoras están en todas partes, pero hoy, menos escuelas enseñan ciencia de la computación que hace 10 años. Las buenas noticias son que: estamos trabajando para cambiar esto. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! y Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Correr la voz. La sede de un evento. Pide a una escuela local para inscribirse. O practica la hora del código, todos pueden beneficiarse de aprender los conceptos básicos.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invitamos a medios de comunicación para asistir a tu evento:

**Subject line:** Local school joins mission to introduce students to computer science

Las computadoras están en todas partes, pero hoy, menos escuelas enseñan ciencia de la computación que hace 10 años. Las chicas y las minorías cuentan con muy baja representación. La buena noticia es, estamos en camino ha cambiar esto.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! y Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Le escribo para invitarle a asistir a nuestra Asamblea despliegue y a ver niños que comienzan la actividad en [DATE].

La Hora de Código, organizada por la entidad sin ánimo de lucro Code.org y más de 100 otros, es una declaración de que la generación de estudiantes de hoy está lista para aprender las habilidades cruciales para el éxito en el siglo 21. Por favor, únetenos.

**Contacto:** [TU NOMBRE], [TITULO], cell: (212) 555-5555

**Cuándo:** [FECHA y HORA de tú evento]

**Dónde:** [DIRECCIÓN y ORIENTACIONES]

Estoy entusiasmado de estar en contacto.

<a id="parents"></a>

## Háblale a los padres sobre los eventos de tú escuela:

Estimados padres,

Vivimos en un mundo rodeado de tecnología. Y sabemos que cualquier campo de nuestros estudiantes deciden entrar como adultos, su capacidad para tener éxito cada vez más dependerá comprender cómo funciona la tecnología. Pero sólo una pequeña fracción de nosotros está aprendiendo la informática y menos estudiantes estudian hoy que hace una década.

Por eso nuestra escuela entera se une el evento de aprendizaje más grande en la historia: la hora del código, en la semana de ciencias de la computación (Dec. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Nuestra hora de código es una declaración que [nombre de la escuela] está listo para enseñar estas habilidades fundamentales del siglo XXI. Para continuar trayendo actividades de programación a sus estudiantes, queremos hacer nuestro evento hora del código enorme. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Esta es una oportunidad para cambiar el futuro de la educación en [nombre de la ciudad].

Ver http://hourofcode.com/ <%= @country %> para más detalles y ayudar a difundir la palabra.

Atentamente,

Su principal

<a id="politicians"></a>

## Invitar a un político local al evento de su escuela:

Estimado [Apellido alcalde/gobernador/representante/senador]:

¿Sabías que la economía actual, puestos de trabajo informáticos superan en número a estudiantes que se gradúan en el campo por 3 a 1. Y Ciencias de la computación es fundamental para la *industria* hoy en día. Yet most of schools don’t teach it. En [nombre de la escuela], nosotros estamos tratando de cambiar eso.

Por eso nuestra escuela entera se une el evento de aprendizaje más grande en la historia: la hora del código, en la semana de ciencias de la computación (Dec. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Le escribo para invitarlos a participar en nuestro evento de hora de código y hablar en nuestra Asamblea de comienzo. Se llevará a cabo el [fecha, hora, lugar] y hará una declaración fuerte que [nombre del estado o ciudad] está listo para enseñar a nuestros estudiantes habilidades críticas del siglo XXI. Queremos asegurarnos que nuestros estudiantes estén en la vanguardia de la creación de tecnología del futuro, no sólo consumirla.

Por favor comuníquese conmigo al [teléfono número o dirección de correo electrónico]. Espero su respuesta.

Atentamente,[NOMBRE], [TITULO]

<%= view :signup_button %>