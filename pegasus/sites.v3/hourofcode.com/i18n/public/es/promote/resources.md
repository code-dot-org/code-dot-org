---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

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

[![imagen](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Descargue las versiones de alta resolución](http://images.code.org/share/hour-of-code-logo.zip)

**La "Hora del Código" es una marca registrada. No queremos evitar este uso, pero queremos que quede dentro de unos límites:**

  1. Cualquier referencia a "Hora del Código" debe usarse de tal manera que no sugiera que es el nombre de tu propia marca, sino que haga referencia a la "Hora del Código" como un movimiento de base. Buen ejemplo: "Participar en la Hora del Código ™ en ACMECorp.com". Mal ejemplo: "Participa en la Hora del Código de ACME Corp".
  2. Usa un "TM" en forma de superíndice en los lugares más importantes donde menciones la "Hora del Código", así como en tu sitio web o en las descripciones de apps.
  3. Incluye el idioma en la página (o en el pie de página) incluyendo links hacia las paginas web de CSEdWeek y Code.org que digan lo siguiente:
    
    *"La 'Hora de Código ™' es una iniciativa nacional por la Semana de Educación en Ciencias de la Computación[csedweek.org] y Code.org[code.org] para introducir a millones de estudiantes en las Ciencias de la Computación y la programación en una hora."*

  4. No usar la marca "Hora del Código" en nombres de apps.

<a id="stickers"></a>

## Imprima estas pegatinas para dar a sus estudiantes

(Las pegatinas son de 1" de diámetro, 63 por hoja)  
[![imagen](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envía estos correos electrónicos para ayudar a promover la Hora del Código

<a id="email"></a>

## Pídele a tu escuela, empleador o amigos que se registren:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. La buena noticias es que estamos trabajando para cambiar esto. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Con la Hora del Código, las Ciencias de la computación han estado en las páginas principales de Google, MSN, Yahoo! y Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Comienza en http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invita a los medios de comunicación a asistir a tu evento:

**Asunto:** La escuela local se une a la misión de introducir a los estudiantes en las Ciencias de la Computación

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. La buena noticias es que estamos trabajando para cambiar esto.

Con la Hora del Código, las Ciencias de la Computación han estado en las páginas principales de Google, MSN, Yahoo! y Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Le escribo para invitarle a asistir a nuestra Asamblea de comienzo y a ver cómo los niños comienzan la actividad en [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Por favor, únete a nosotros.

**Contacto:** [TU NOMBRE], [TITLE], teléfono móvil: (212) 555-5555

**Cuándo:** [FECHA y HORA de tu evento]

**Dónde:** [DIRECCIÓN e INDICACIONES]

Estoy deseando estar en contacto.

<a id="parents"></a>

## Háblale a los padres sobre el evento de tu escuela:

Estimados padres,

Vivimos en un mundo rodeado de tecnología. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Invitar a un político local al evento de tu escuela:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]