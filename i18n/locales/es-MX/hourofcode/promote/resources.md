---
title: '& lt;% = hoc_s (: title_press_release)% & gt;'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promueve la Hora del Código

## ¿Albergando una Hora de Código? [Consulte la guía de cómo hacerlo](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Cuelga estos carteles en tu escuela

<%= view :promote_posters %>

<a id="social"></a>

## Publica esto en las redes sociales

[![imagen](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use el logotipo de la Hora del Código para correr la voz

[![imagen](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Descarga versiones de alta resolución](http://images.code.org/share/hour-of-code-logo.zip)

**La "Hora del Código" es una marca registrada. No queremos evitar su uso, pero queremos que quede dentro de unos límites:**

1. Cualquier referencia a "Hora del Código" debe usarse de tal manera que no sugiera que es el nombre de tu propia marca, sino que haga referencia a la "Hora del Código" como un movimiento de base. **Buen ejemplo: "Participar en la Hora del Código™ en ACMECorp.com". Mal ejemplo: "Participa en la Hora del Código de ACME Corp".**
2. Usa un "TM" en forma de superíndice en los lugares más importantes donde menciones la "Hora del Código", así como en tu sitio web o en las descripciones de apps.
3. Incluye el idioma en la página (o en el pie de página) incluyendo links hacia las paginas web de CSEdWeek y Code.org que digan lo siguiente:
    
    *"La 'Hora de Código ™' es una iniciativa nacional por la Semana de Educación en Ciencias de la Computación[csedweek.org] y Code.org[code.org] para introducir a millones de estudiantes en las Ciencias de la Computación y la programación en una hora."*

4. No usar la marca "Hora del Código" en nombres de apps.

<a id="stickers"></a>

## Imprima estas pegatinas para dar a sus estudiantes

(Las pegatinas son de 2,54cm de diámetro, 63 por hoja)  
[![imagen](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envía estos correos electrónicos para ayudar a promover la Hora del Código

<a id="email"></a>

### Pídele a tu escuela, jefe o amigos que se registren:

**Asunto:** Únete a mí y a más 100 millones de estudiantes para una Hora de Código

Los ordenadores están por todas partes, cambiando todas las industrias en el planeta. Pero menos de la mitad de todas las escuelas enseñan Informática. ¡La buena noticia es que estamos trabajando para cambiar esto! Si has oído hablar de la Hora de Código, podrías saber que hizo historia. Más de 100 millones de estudiantes han probado una Hora de Código.

Con la Hora del Código, la informática ha estado en las páginas principales de Google, MSN, Yahoo! y Disney. Más de 100 socios se han unido para apoyar este movimiento. Cada Apple Store en el mundo ha organizado una hora de código, y líderes como el presidente Obama y el primer ministro canadiense Justin Trudeau escribieron sus primeras líneas de código como parte de la campaña.

Este año, vamos a hacerlo aún más grande. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Por favor, participa en un evento de la Hora del Código para la Semana de educación en informática, <%= campaign_date('full')%>.

Corre la voz. Organiza un evento. Pide a una escuela local que se inscriba. O haz tu mismo la Hora del Código - todos pueden beneficiarse de aprender los conceptos básicos.

Comienza en http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Voluntario en una escuela:

**Asunto:** ¿Podemos ayudarte a organizar la Hora del código?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Nuestra organización / Mi nombre] me encantaría ayudar a [nombre de la escuela] a organizar un evento de la Hora del código. Podemos ayudar a los profesores a organizar una hora de código en sus aulas (¡ni siquiera necesitamos computadoras!) O si desea organizar una asamblea escolar, podemos hacer arreglos para que un orador hable sobre cómo funciona la tecnología y cómo es ser un ingeniero de software.

Los estudiantes crearán sus propias aplicaciones o juegos que pueden mostrar a sus padres, y también imprimiremos certificados de Hora del Código que pueden llevar a casa. ¡Y es divertido! Con actividades interactivas y prácticas, los estudiantes aprenderán habilidades de pensamiento computacional de una manera accesible.

Los ordenadores están por todas partes, cambiando todas las industrias en el planeta. Pero menos de la mitad de todas las escuelas enseñan Informática. ¡La buena noticia es que estamos trabajando para cambiar esto! Si ya has oido sobre la Hora del Código, es posible que sepas que hizo historia: más de 100 millones de estudiantes en todo el mundo han probado una Hora de Código.

Gracias a la Hora del Código, la informática ha estado en las páginas principales de Google, MSN, Yahoo! y Disney. Más de 100 socios se han unido para apoyar este movimiento. Cada Apple Store en el mundo ha organizado una hora de código, y líderes como el presidente Obama y el primer ministro canadiense Justin Trudeau escribieron sus primeras líneas de código como parte de la campaña.

Puedes leer más sobre el evento en http://hourofcode.com/. O infórmenos si desea hacer tiempo para hablar sobre cómo [nombre de la escuela] puede participar.

¡Gracias!

[Tu nombre], [Tu organización]

<a id="media-pitch"></a>

### Invita a los medios de comunicación a asistir a tu evento:

**Asunto:** La escuela local se une a la misión de introducir a los estudiantes a la informática

Los ordenadores están por todas partes, cambiando todas las industrias en el planeta, pero menos de la mitad de todas las escuelas enseñan informática. Las niñas y las minorías están seriamente subrepresentadas en clases de informática y en la industria de la tecnología. La buena noticia es que estamos trabajando para cambiar esto.

Con la Hora del Código, la informática ha estado en las páginas principales de Google, MSN, Yahoo! y Disney. Más de 100 socios se han unido para apoyar este movimiento. Cada tienda de Apple en el mundo ha organizado una hora de código. Incluso el presidente Obama escribió su primera línea de código como parte de la campaña.

Es por eso que cada uno de los [NÚMERO DE ESTUDIANTES] estudiantes en [NOMBRE DE LA ESCUELA] se están uniendo al evento de aprendizaje más grande en la historia: la Hora del Código, durante la Semana de Educación en Informática (<%= campaign_date('full') %>).

Le escribo para invitarle a asistir a nuestra Asamblea de comienzo y a ver cómo los niños comienzan la actividad el [DATE].

La Hora del Código, organizada por la entidad sin ánimo de lucro Code.org y más de otros 100, es un movimiento que cree los estudiantes de hoy están listos para aprender las habilidades cruciales para el éxito en el siglo 21. Por favor, únete a nosotros.

**Contacto:** [SU NOMBRE], [TITLE], teléfono: (212) 555-5555 **Cuándo:** [FECHA y HORA de su evento] **Dónde:** [DIRECCIÓN E INDICACIONES]

Espero con interés estar en contacto.

[Tu nombre]

<a id="parents"></a>

### Háblale a los padres sobre el evento de tu escuela:

**Asunto:** nuestros estudiantes están cambiando el futuro con una Hora de Código

Estimados padres,

Vivimos en un mundo rodeado de tecnología. Y sabemos que cualquier carrera que nuestros estudiantes elijan de adultos, su capacidad para tener éxito dependerá cada vez más en comprender cómo funciona la tecnología.

Pero sólo una pequeña fracción de nosotros está aprendiendo **cómo** la tecnología funciona. Menos de la mitad de todas las escuelas enseñan informática.

Por eso toda nuestra escuela se está uniendo el evento de aprendizaje más grande en la historia: la Hora del Código, en la Semana de Educación en Ciencias de la Computación (<%= campaign_date('full') %>). Más de 100 millones de estudiantes de todo el mundo ya han hecho una Hora del Código.

Nuestra Hora del Código es una declaración de que [NOMBRE DE LA ESCUELA] está lista para enseñar estas habilidades fundamentales del siglo XXI. Para continuar trayendo actividades de programación a sus estudiantes, queremos hacer nuestro evento de la Hora del Código enorme. Os animo a ser voluntarios, llegar a medios de comunicación locales, compartir las noticias en las redes sociales y considerar realizar eventos adicionales de la Hora del Código en tu comunidad.

Esta es una oportunidad para cambiar el futuro de la educación en [nombre de la ciudad].

Visita http://hourofcode.com/<%= @country %> para consultar detalles, y ayudar a difundir la noticia.

Atentamente,

El director

<a id="politicians"></a>

### Invitar a un político local al evento de tu escuela:

**Asunto:** Únete a nuestra escuela mientras cambiamos el futuro con una Hora de Código

Estimado [Apellido del alcalde/gobernador/representante/senador]:

¿Sabía que la informática es la primera fuente de los salarios en los Estados Unidos? Hay más de 500.000 trabajos de informática a escala nacional, pero el año pasado solo 42,969 estudiantes de informática se graduaron.

La informática es fundamental para *cada* industria en la actualidad. Sin embargo, la mayoría de las escuelas no lo enseñan. En [NOMBRE DE LA ESCUELA], estamos tratando de cambiar eso.

Por eso toda nuestra escuela se está uniendo el evento de aprendizaje más grande en la historia: la Hora del Código, en la Semana de Educación en Ciencias de la Computación (<%= campaign_date('full') %>). Más de 100 millones de estudiantes de todo el mundo ya han hecho una Hora del Código.

Le escribo para invitarle a participar en nuestro evento de la Hora del Código y hablar en nuestra Asamblea de comienzo. Se llevará a cabo el [fecha, hora, lugar] y hará una declaración firme de que [nombre del estado o ciudad] está preparado para enseñar a nuestros estudiantes habilidades críticas del siglo XXI. Queremos asegurarnos que nuestros estudiantes estén en la vanguardia de la creación de tecnología del futuro, que no sólo la consuman.

Por favor contacte conmigo en el [número de teléfono o dirección de correo electrónico]. Espero su respuesta.

Atentamente,

[Su nombre], [Título]

<%= view :signup_button %>