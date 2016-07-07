* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promova a Hora do Código

## Quer sediar uma Hora do Código? [Consulte o guia prático](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Pendure estes cartazes em sua escola

<%= view :promote_posters %>

<a id="social"></a>

## Publique estas imagens nas mídias sociais

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use o logotipo da Hora do Código para divulgar o evento

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Baixar a versão em alta resolução](http://images.code.org/share/hour-of-code-logo.zip)

**A "Hour of Code" é uma marca registrada. Não queremos impedir seu uso, mas queremos garantir que ele se enquadre em alguns limites:**

  1. Qualquer referência à marca "Hour of Code" deve ser feita de forma que não sugira que ela é uma marca de sua propriedade, mas uma referência à Hora do Código como um movimento popular. Um bom exemplo: "Participe da Hora do Código no ACMECorp.com". Exemplo de uso errado: "Experimente a Hora do Código promovida pela ACME Corp".
  2. Use "TM" sobrescrito nos textos de maior destaque quando mencionar "Hour of Code" (ou Hora do Código), tanto em seu website como em descrições de aplicativos.
  3. Use o seguinte texto na página (ou no rodapé), com links para os sites da Semana da Educação em Ciência da Computação e Code.org:
    
    *"A 'Hora do Código' é uma iniciativa nacional da Semana da Educação em Ciência da Computação[csedweek.org] e da Code.org[code.org] para proporcionar a experiência de uma hora de ciência da computação e programação de computadores a milhões de estudantes."*

  4. É proibido o uso de "Hour of Code" em nomes de aplicativos.

<a id="stickers"></a>

## Imprima esses adesivos para seus alunos

(São 63 adesivos de 1 polegada de diâmetro por folha)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envie estes e-mails para ajudar a promover a Hora do Código

<a id="email"></a>

## Peça para sua escola, empregador ou amigos se inscreverem:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. A boa notícia é que estamos a caminho de mudar essa realidade. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Com a Hora do Código, a ciência da computação esteve nas páginas iniciais da Google, MSN e Yahoo! e Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Comece em http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Convide a mídia para participar de seu evento

**Assunto:** Escola local participa da missão de levar a ciência da computação aos alunos

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. A boa notícia é que estamos a caminho de mudar essa realidade.

Com a Hora do Código, a ciência da computação esteve nas páginas iniciais da Google, MSN e Yahoo! e Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Gostaria de convidá-lo para participar da abertura de nosso evento e assistir ao início das atividades das crianças no dia [DATA].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Junte-se a nós.

**Contato:** [SEU NOME], [CARGO], celular: (XX) 55555-5555

**Quando:** [DATA e HORA do seu evento]

**Onde:** [ENDEREÇO e ORIENTAÇÕES DE COMO CHEGAR]

Aguardo seu contato.

<a id="parents"></a>

## Informe os pais sobre o evento de sua escola:

Caros pais,

Vivemos em um mundo cercado de tecnologias. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Convide um representante político local para o evento de sua escola:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]