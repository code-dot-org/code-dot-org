* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promova a Hora de Código

## Quere ser sede de unha Hora de Código? [Consulte a guía práctica](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Pendura estes pósters na túa escola

<%= view :promote_posters %>

<a id="social"></a>

## Publique estas imaxes nas redes sociais

[![imaxe](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imaxe](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imaxe](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use o logotipo da Hora de Código para divulgar o evento

[![imaxe](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Baixar a versión en alta resolución](http://images.code.org/share/hour-of-code-logo.zip)

**A "Hour of Code" é unha marca rexistrada. Non queremos impedir o seu uso, pero queremos garantir que se encadre en algúns límites:**

  1. Calquera referencia á marca "Hour of Code" debe ser feita de forma que non suxira que é unha marca da súa propiedade, senón unha referencia á Hora do Código como un movemento popular. Un bo exemplo: "Participe da Hora do Código no ACMECorp.com". Exemplo de uso errado: "Experimente a Hora de Código promovida pola empresa ACME".
  2. Use "TM" como superíndice nos textos de maior destaque cando mencione "Hour of Code", tanto no seu website como en descricións de aplicativos.
  3. Use o seguinte texto na páxina (ou no rodapé), con ligazóns para as páxinas da Semana da Educación en Informática e Code.org:
    
    *"A 'Hora do Código' é unha iniciativa nacional da Semana da Educación en Informática[csedweek.org] e da Code.org[code.org] para proporcionar a experiencia de unha hora de informática e programación de computadores a millóns de estudantes."*

  4. Está prohibido o uso de "Hour of Code" en nomes de aplicacións.

<a id="stickers"></a>

## Imprima estes adhesivos para os seus alumnos

(Son 63 adhesivos de 1 polgada de diámetro por folla)  
[![imaxe](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envía estes ecoreos para axudar a promover a Hora de Código

<a id="email"></a>

## Pida a súa escola, empregador ou amigos se inscribiren:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. A boa noticia é que estamos en camiño de mudar esta realidade. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Con a Hora do Código, a informática estivo nas páxinas iniciais da Google, MSN e Yahoo! e Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Comece en http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Convide aos medios de comunicación para participar do seu evento

**Asunto:** Escola local participa da misión de levar a informática aos alumnos

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. A boa noticia é que estamos en camiño de mudar esta realidade.

Con a Hora do Código, a informática estivo nas páxinas iniciais da Google, MSN e Yahoo! e Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Con gusto invítoo a participar da abertura de noso evento e asistir ao inicio das actividades dos rapaces no día [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Xúntese a nós.

**Contacto:** [SEU NOME], [TITLE], móbil: (XX) 55555-5555

**Cando:** [DATA e HORA do seu evento]

**Onde:** [ENDEREZO e ORIENTACIÓNS DE COMO CHEGAR]

Agardo o seu contacto.

<a id="parents"></a>

## Informe os pais sobre o evento da súa escola:

Queridos pais,

Vivimos nun mundo rodeado de tecnoloxías. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Convide un representante político local para o evento de súa escola:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]