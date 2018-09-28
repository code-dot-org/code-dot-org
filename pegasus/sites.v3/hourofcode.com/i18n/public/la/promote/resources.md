---
title: <%= hoc_s(:title_resources).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promueve la "Hora del Código"

### Encuentra todos los recursos que necesitas para llamar la atención hacia tu "Hora del Código". ¿No sabes donde empezar? Inicia con nuestra <a href="<%= resolve_url('/how-to') %>guía para ser anfitrión de la "Hora del Código"</a>!

---

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Cuelga estos carteles en tu escuela

<%= view :promote_posters %>

<a id="social"></a>

## Publica esto en las redes sociales

[![imagen](/images/social-media/fit-250/social-1.png)](/images/social-media/social-1.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/social-2.png)](/images/social-media/social-2.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/social-3.png)](/images/social-media/social-3.png)&nbsp;&nbsp;&nbsp;&nbsp;

[![imagen](/images/social-media/fit-250/bill_gates.png)](/images/social-media/bill_gates.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/malala_yousafzai.png)](/images/social-media/malala_yousafzai.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/chris_bosh.png)](/images/social-media/chris_bosh.png)&nbsp;&nbsp;&nbsp;&nbsp;

[![imagen](/images/social-media/fit-250/karlie_kloss.png)](/images/social-media/karlie_kloss.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/satya_nadella.png)](/images/social-media/satya_nadella.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/jeff_bezos.png)](/images/social-media/jeff_bezos.png)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="logo"></a>

## Use el logotipo de la Hora del Código para correr la voz

[![imagen](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Descarga versiones de alta resolución](http://images.code.org/share/hour-of-code-logo.zip)

**La "Hora del Código" es una marca registrada. No queremos evitar este uso, pero queremos que quede dentro de unos límites:**

1. Cualquier referencia a "Hora del Código" debe usarse de tal manera que no sugiera que es el nombre de tu propia marca, sino que haga referencia a la "Hora del Código" como un movimiento de base. **Buen ejemplo**: "Participa en la Hora del Código™ en ACMECorp.com." **Mal ejemplo**: "Intenta participar en la Hora el Código de ACME Corp."
2. Usa un "TM" en forma de superíndice en los lugares más importantes donde menciones la "Hora del Código," así como en tu sitio web o en las descripciones de apps.
3. Incluye mensajes en tu página (o en el pie de página), incluyendo vínculos hacia la Semana por la Educación de la Informática y al sitio web de [Code.org](<%= resolve_url('https://code.org') %>), que digan lo siguiente:
    
    *"La 'Hora del Código ™' es una iniciativa nacional por la Semana de Educación en Ciencias de Computación [csedweek.org] y Code.org [code.org] para introducir las Ciencias de la Computación y la programación a millones de estudiantes."*

4. No usar la marca "Hora del Código" en nombres de apps.

<a id="stickers"></a>

## Imprima estas pegatinas para dar a sus estudiantes

(Las pegatinas son de 2,54cm de diámetro, 63 por hoja)<br />

[![imagen](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invita a personas de tu comunidad a tu Hora del Código y promueve tu evento vía correo electrónico

### Encuentra <a href="<%= resolve_url('/promote/stats') %>más información y mensajes que puedes utilizar</a> cuando hables sobre la Hora del Código.

---

<a id="email"></a>

### Pídele a tu escuela, jefe o amigos que se registren:

**Asunto:** Únete a mí y a más 100 millones de estudiantes para una Hora de Código <br />

Las computadoras están por todas partes, cambiando todas las industrias en el planeta. Pero menos de la mitad de todas las escuelas enseñan Informática. ¡La buena noticia es que estamos trabajando para cambiar esto! Si has oído hablar de la Hora de Código, podrías saber que hizo historia. Más de 100 millones de estudiantes han probado una Hora del Código.

Con la Hora del Código, la informática ha estado en las páginas principales de Google, MSN, Yahoo! y Disney. Más de 100 socios se han unido para apoyar este movimiento. Cada Apple Store en el mundo ha organizado una hora de código, y líderes como el presidente Obama y el primer ministro canadiense Justin Trudeau escribieron sus primeras líneas de código como parte de la campaña.

Este año, hagámoslo aún más grande. Te pido que te unas a la Hora del Código <%= campaign_date('year') %>. Por favor, participa en un evento de la Hora del Código para la Semana de educación en informática, <%= campaign_date('full')%>.

Corre la voz. Organiza un evento. Pide a una escuela local que se inscriba. O haz tu mismo la Hora del Código - todos pueden beneficiarse de aprender los conceptos básicos.

Comienza en http://hourofcode.com/<%= @country %> <br />

---

<a id="help-schools"></a>

### Voluntario en una escuela:

#### <a href="<%= resolve_url('/how-to/volunteers') %>Encuentra más recursos e información sobre el voluntareado en escuelas en este vínculo</a>.

**Asunto:** ¿Podemos ayudarte a organizar la Hora del código?

Entre <%= campaign_date('short') %>, el diez por ciento de los estudiantes de todo el mundo celebrarán La Semana de Educación en Informática haciendo un evento de la Hora del Código evento en sus escuelas. Es una oportunidad para todos los niños de aprender cómo funciona la tecnología que nos rodea.

[Nuestra organización / Mi nombre] me encantaría ayudar a [nombre de la escuela] a organizar un evento de la Hora del código. Podemos ayudar a los profesores a organizar una hora de código en sus aulas (¡ni siquiera necesitamos computadoras!) O si desea organizar una asamblea escolar, podemos hacer arreglos para que un orador hable sobre cómo funciona la tecnología y cómo es ser un ingeniero de software.

Los estudiantes crearán sus propias aplicaciones o juegos que pueden mostrar a sus padres, y también imprimiremos certificados de Hora del Código que pueden llevar a casa. ¡Y es divertido! Con actividades interactivas y prácticas, los estudiantes aprenderán habilidades de pensamiento computacional de una manera accesible.

Las computadoras están por todas partes, cambiando todas las industrias en el planeta. Pero menos de la mitad de todas las escuelas enseñan Informática. ¡La buena noticia es que estamos trabajando para cambiar esto! Si ya has oido sobre la Hora del Código, es posible que sepas que hizo historia: más de 100 millones de estudiantes en todo el mundo han probado una Hora de Código. Incluso, líderes como el Presidente Obana y el Primer Ministro Canadiense Justin Trudeau escribieron sus primeras líneas de código como parte de la campaña.

Puedes leer más sobre el evento en http://hourofcode.com. O infórmenos si desea hacer tiempo para hablar sobre cómo [nombre de la escuela] puede participar.<br />

---

<a id="parents"></a>

### Háblale a los padres sobre el evento de tu escuela:

**Asunto:** nuestros estudiantes están cambiando el futuro con una Hora de Código

Estimados padres,

Vivimos en un mundo rodeado de tecnología. Y sabemos que cualquier carrera que nuestros estudiantes elijan de adultos, su capacidad para tener éxito dependerá cada vez más en comprender cómo funciona la tecnología.

Pero sólo una pequeña fracción de nosotros está aprendiendo **cómo** la tecnología funciona. Menos de la mitad de todas las escuelas enseñan Ciencias de la computación.

Por eso toda nuestra escuela se está uniendo el evento de aprendizaje más grande en la historia: la Hora del Código, en la Semana de Educación en Ciencias de la Computación (<%= campaign_date('full') %>). Más de 100 millones de estudiantes de todo el mundo ya han hecho una Hora del Código. Nuestra Hora del Código es una declaración de que [NOMBRE DE LA ESCUELA] está lista para enseñar estas habilidades fundamentales del siglo XXI. Para continuar trayendo actividades de programación a sus estudiantes, queremos hacer nuestro evento de la Hora del Código enorme. Os animo a ser voluntarios, llegar a medios de comunicación locales, compartir las noticias en las redes sociales y considerar realizar eventos adicionales de la Hora del Código en tu comunidad.

Esta es una oportunidad para cambiar el futuro de la educación en [nombre de la ciudad].

Visita http://hourofcode.com/<%= @country %> para consultar detalles, y ayudar a difundir la noticia. <br />

---

<a id="media-pitch"></a>

### Invita a los medios de comunicación a asistir a tu evento:

#### [Revisa nuestro kit de prensa para más información sobre la invitación de los medios a tu evento.](<%= resolve_url('/promote/press-kit') %>)

**Asunto**: La escuela local se une a la misión de introducir a los estudiantes en las Ciencias de la computación

Los ordenadores están por todas partes, cambiando todas las industrias en el planeta, pero menos de la mitad de todas las escuelas enseñan Ciencias de la computación. Las niñas y las minorías están seriamente subrepresentadas en clases de informática y en la industria de la tecnología. La buena noticia es que estamos trabajando para cambiar esto.

Con la Hora del Código, la informática ha estado en las páginas principales de Google, MSN, Yahoo! y Disney. Más de 100 socios se han unido para apoyar este movimiento. Cada tienda de Apple en el mundo ha organizado una hora de código. Incluso el presidente Obama escribió su primera línea de código como parte de la campaña.

Es por eso que cada uno de los [NÚMERO DE ESTUDIANTES] estudiantes en [NOMBRE DE LA ESCUELA] se están uniendo al evento de aprendizaje más grande en la historia: la Hora del Código.

Le escribo para invitarle a asistir a nuestra Asamblea de comienzo y a ver cómo los niños comienzan la actividad el [DATE].

La Hora del Código, organizada por la entidad sin ánimo de lucro Code.org y más de otros 100, es un movimiento que cree los estudiantes de hoy están listos para aprender las habilidades cruciales para el éxito en el siglo 21. Por favor, únete a nosotros.

Contacto: [TU NOMBRE], [TITLE]. Teléfono: (212) 555-5555. Cuándo: [FECHA y HORA del tu evento]. Dónde: [DIRECCIÓN e INDICACIONES PARA LLEGAR]

Estoy deseando estar en contacto.<br />

---

<a id="politicians"></a>

### Invitar a un político local al evento de tu escuela:

#### <a href="<%= resolve_url('/how-to/public-officials') %>¿Necesitas más información? Hecha un vistazo a nuestros recursos para invitar a politicos a asistir a tu evento</a>.

**Asunto**: Únete a nuestra escuela mientras cambiamos el futuro con una Hora de Código

Estimado [Apellido del alcalde/gobernador/representante/senador]:

¿Sabía que la informática es la primera fuente de los salarios en los Estados Unidos? Hay más de 500.000 trabajos de informática a escala nacional, pero el año pasado solo 42,969 estudiantes de informática se graduaron.

La informática es fundamental para cada industria en la actualidad. Sin embargo, la mayoría de las escuelas no lo enseñan. En [NOMBRE DE LA ESCUELA], estamos tratando de cambiar eso.

Por eso toda nuestra escuela se está uniendo el evento de aprendizaje más grande en la historia: la Hora del Código, en la Semana de Educación en Ciencias de la Computación (<%= campaign_date('full') %>). Más de 100 millones de estudiantes de todo el mundo ya han hecho una Hora del Código.

Le escribo para invitarle a participar en nuestro evento de la Hora del Código y hablar en nuestra Asamblea de comienzo. Se llevará a cabo el [fecha, hora, lugar] y hará una declaración firme de que [nombre del estado o ciudad] está preparado para enseñar a nuestros estudiantes habilidades críticas del siglo XXI. Queremos asegurarnos que nuestros estudiantes estén en la vanguardia de la creación de tecnología del futuro, que no sólo la consuman.

Por favor comuníquese conmigo al [número de teléfono o dirección de correo electrónico]. Espero su respuesta.

<%= view :signup_button %>