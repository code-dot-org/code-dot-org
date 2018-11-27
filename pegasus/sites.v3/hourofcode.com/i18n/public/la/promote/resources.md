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

<%= view :promote_new_posters %>

Looking for our posters from previous years? [Find them here](<%= resolve_url('/promote/previous-posters') %>)!

<a id="social"></a>

## Publica esto en las redes sociales

[![imagen](/images/social-media/fit-250/social-1.png)](/images/social-media/social-1.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/social-2.png)](/images/social-media/social-2.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/social-3.png)](/images/social-media/social-3.png)&nbsp;&nbsp;&nbsp;&nbsp;

[![imagen](/images/social-media/fit-250/bill_gates.png)](/images/social-media/bill_gates.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/malala_yousafzai.png)](/images/social-media/malala_yousafzai.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/chris_bosh.png)](/images/social-media/chris_bosh.png)&nbsp;&nbsp;&nbsp;&nbsp;

[![imagen](/images/social-media/fit-250/karlie_kloss.png)](/images/social-media/karlie_kloss.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/satya_nadella.png)](/images/social-media/satya_nadella.png)&nbsp;&nbsp;&nbsp;&nbsp; [![imagen](/images/social-media/fit-250/jeff_bezos.png)](/images/social-media/jeff_bezos.png)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="logo"></a>

## Use el logotipo de la Hora del Código para correr la voz

[![imagen](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Cualquier referencia a "Hora del Código" debe usarse de tal manera que no sugiera que es el nombre de tu propia marca, sino que haga referencia a la "Hora del Código" como un movimiento de base. **Buen ejemplo**: "Participa en la Hora del Código™ en ACMECorp.com." **Mal ejemplo**: "Intenta participar en la Hora el Código de ACME Corp."
2. Usa un "TM" en forma de superíndice en los lugares más importantes donde menciones la "Hora del Código," así como en tu sitio web o en las descripciones de apps.
3. Incluye mensajes en tu página (o en el pie de página), incluyendo vínculos hacia la Semana por la Educación de la Informática y al sitio web de [Code.org](<%= resolve_url('https://code.org') %>), que digan lo siguiente:
    
    *"La 'Hora del Código ™' es una iniciativa nacional por la Semana de Educación en Ciencias de Computación [csedweek.org] y Code.org [code.org] para introducir las Ciencias de la Computación y la programación a millones de estudiantes."*

4. No usar la marca "Hora del Código" en nombres de apps.

<a id="stickers"></a>

## Imprima estas etiquetas para darlas a sus estudiantes

(Stickers are 1" diameter, 63 per sheet) <br />

[![imagen](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invita a personas de tu comunidad a tu Hora del Código y promueve tu evento vía correo electrónico

### Encuentra <a href="<%= resolve_url('/promote/stats') %>más información y mensajes que puedes utilizar</a> cuando hables sobre la Hora del Código.

---

<a id="email"></a>

### Pídele a tu escuela, jefe o amigos que se registren:

**Subject line:** Join me and over 100 million students for an Hour of Code <br />

Computers are everywhere, changing every industry on the planet. But only 35% of all high schools teach computer science. Good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Con la Hora del Código, la informática ha estado en las páginas principales de Google, MSN, Yahoo! y Disney. Más de 100 socios se han unido para apoyar este movimiento. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %> <br />

---

<a id="help-schools"></a>

### Voluntario en una escuela:

#### <a href="<%= resolve_url('/how-to/volunteers') %>Encuentra más recursos e información sobre el voluntareado en escuelas en este vínculo</a>.

**Subject line:** Can we help you host an Hour of Code?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code at their school. It’s an opportunity for every child to learn how the technology around us works.

[Our organization/My name] would love to help [school name] run an Hour of Code event. We can help teachers host an Hour of Code in their classrooms (we don’t even need computers!) or if you would like to host a school assembly, we can arrange for a speaker to talk about how technology works and what it’s like to be a software engineer.

The students will create their own apps or games they can show their parents, and we’ll also print Hour of Code certificates they can bring home. And, it’s fun! With interactive, hands-on activities, students will learn computational thinking skills in an approachable way.

Computers are everywhere, changing every industry on the planet. But only 35% of all high schools teach computer science. The good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history - more than 100 million students around the world have tried an Hour of Code. Even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

You can read more about the event at http://hourofcode.com. Or, let us know if you’d like to schedule some time to talk about how [school name] can participate. <br />

---

<a id="parents"></a>

### Háblale a los padres sobre el evento de tu escuela:

**Subject line:** Our students are changing the future with an Hour of Code

Dear Parents,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 35% of all high schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code. Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word. <br />

---

<a id="media-pitch"></a>

### Invita a los medios de comunicación a asistir a tu evento:

#### [Revisa nuestro kit de prensa para más información sobre la invitación de los medios a tu evento.](<%= resolve_url('/promote/press-kit') %>)

**Asunto**: La escuela local se une a la misión de introducir a los estudiantes en las Ciencias de la computación

Computers are everywhere, changing every industry on the planet, but only 35% of all high schools teach computer science. Las niñas y las minorías están seriamente subrepresentadas en clases de informática y en la industria de la tecnología. La buena noticia es que estamos trabajando para cambiar esto.

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

**Subject line**: Join our school as we change the future with an Hour of Code

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for every industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

<%= view :signup_button %>