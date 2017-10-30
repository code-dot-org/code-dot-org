---
title: '<%= hoc_s(:title_resources) %>'
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

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use el logotipo de la Hora del Código para correr la voz

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Descarga versiones de alta resolución](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Cualquier referencia a "Hora del Código" debe usarse de tal manera que no sugiera que es el nombre de tu propia marca, sino que haga referencia a la "Hora del Código" como un movimiento de base.
    
    - Buen ejemplo: "Participar en la Hora del Código ™ en ACMECorp.com". 
    - Mal ejemplo: "Participa en la Hora del Código de ACME Corp".
2. Usa un "TM" en forma de superíndice en los lugares más importantes donde menciones la "Hora del Código", así como en tu sitio web o en las descripciones de apps.
3. Incluye el idioma en la página (o en el pie de página) incluyendo links hacia las paginas web de CSEdWeek y Code.org que digan lo siguiente:
    
    *"La 'Hora de Código ™' es una iniciativa nacional por la Semana de Educación en Ciencias de la Computación[csedweek.org] y Code.org[code.org] para introducir a millones de estudiantes en las Ciencias de la Computación y la programación en una hora."*

4. No usar la marca "Hora del Código" en nombres de apps.

<a id="stickers"></a>

## Imprima estas pegatinas para dar a sus estudiantes

(Las pegatinas son de 2,54cm de diámetro, 63 por hoja)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envía estos correos electrónicos para ayudar a promover la Hora del Código

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Los ordenadores están por todas partes, cambiando todas las industrias en el planeta. Pero menos de la mitad de todas las escuelas enseñan Ciencias de la computación. Good news is, we’re on our way to change this! Si has oído hablar de la Hora de Código, podrías saber que hizo historia. Más de 100 millones de estudiantes han probado una Hora de Código.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Más de 100 socios se han unido para apoyar este movimiento. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Corre la voz. Organiza un evento. Pide a una escuela local que se inscriba. O haz tu mismo la Hora del Código-- todos pueden beneficiarse de aprender los conceptos básicos.

Comienza en http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Invita a los medios de comunicación a asistir a tu evento:

**Asunto:** La escuela local se une a la misión de introducir a los estudiantes en las Ciencias de la Computación

Los ordenadores están por todas partes, cambiando todas las industrias en el planeta, pero menos de la mitad de todas las escuelas enseñan Ciencias de la computación. Las niñas y las minorías están seriamente subrepresentadas en clases de informática y en la industria de la tecnología. La buena noticia es que estamos trabajando para cambiar esto.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Más de 100 socios se han unido para apoyar este movimiento. Todas las tiendas de Apple en el mundo han organizado una Hora de Código. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Por favor, únete a nosotros.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Háblale a los padres sobre el evento de tu escuela:

**Subject line:** Our students are changing the future with an Hour of Code

Estimados padres,

Vivimos en un mundo rodeado de tecnología. Y sabemos que cualquier carrera que nuestros estudiantes elijan de adultos, su capacidad para tener éxito dependerá cada vez más en comprender cómo funciona la tecnología.

Pero sólo una pequeña fracción de nosotros está aprendiendo **cómo** la tecnología funciona. Menos de la mitad de todas las escuelas enseñan Ciencias de la computación.

Por eso toda nuestra escuela se está uniendo el evento de aprendizaje más grande en la historia: la Hora del Código, en la Semana de Educación en Ciencias de la Computación (<%= campaign_date('full') %>). Más de 100 millones de estudiantes de todo el mundo ya han hecho una Hora del Código.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Para continuar trayendo actividades de programación a sus estudiantes, queremos hacer nuestro evento de la Hora del Código enorme. Os animo a ser voluntarios, contactar a medios de comunicación locales, compartir las noticias en las redes sociales y considerar realizar eventos adicionales de la Hora del Código en tu comunidad.

Esta es una oportunidad para cambiar el futuro de la educación en [NOMBRE DE LA CIUDAD].

Ver http://hourofcode.com/<%= @country %> para más detalles y ayudar a correr la voz.

Atentamente,

El director

<a id="politicians"></a>

### Invitar a un político local al evento de tu escuela:

**Subject line:** Join our school as we change the future with an Hour of Code

Estimado [Apellido del alcalde/político/representante/senador]:

¿Sabía que la informática es la primera fuente de los salarios en los Estados Unidos? Hay más de 500.000 trabajos de informática a escala nacional, pero el año pasado solo 42,969 estudiantes de informática se graduaron.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Por eso toda nuestra escuela se está uniendo el evento de aprendizaje más grande en la historia: la Hora del Código, en la Semana de Educación en Ciencias de la Computación (<%= campaign_date('full') %>). Más de 100 millones de estudiantes de todo el mundo ya han hecho una Hora del Código.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Queremos asegurarnos que nuestros estudiantes estén en la vanguardia de la creación de tecnología del futuro, que no sólo la consuman.

Por favor contacte conmigo en el [número de teléfono o dirección de correo electrónico]. Espero su respuesta.

Atentamente,

[NAME], [TITLE]

<%= view :signup_button %>