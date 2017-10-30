---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promuovi l'Ora del Codice

## Stai organizzando un'Ora del Codice?[ Guarda la nostra guida](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Appendi questi poster nella tua scuola

<%= view :promote_posters %>

<a id="social"></a>

## Pubblica queste immagini sui social media

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Usa il logo dell'Ora del Codice per spargere la voce

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Scarica le versioni ad alta risoluzione](http://images.code.org/share/hour-of-code-logo.zip)

**Il nome "Hour of Code" ("Ora del codice") è un marchio registrato. Non vogliamo impedirne l'utilizzo, ma vogliamo assicurarci che l'uso rispetti alcuni limiti:**

1. Qualsiasi riferimento a "Hour of Code" ("Ora del codice") deve essere fatto in modo che non suggerisca che sia un tuo marchio, ma piuttosto si riferisca all'Ora del Codice come un movimento di gente comune. Un esempio di uso corretto: "Partecipa all'Ora del Codice sul sito di ACMECorp.com". Un esempio di uso sbagliato: "Prova l'Ora del Codice di ACME Corp".
2. Utilizza un apice "TM" dove menzioni "Ora del Codice" o "Hour of Code", sia sul tuo sito web sia nelle descrizioni delle app.
3. Includi una nota nella pagina (o nel piè di pagina), che contenga i collegamenti ai siti web CSEdWeek e Code.org e indichi quanto segue:
    
    *"L' Ora del Codice (Hour of Code™) è un'iniziativa nazionale della Computer Science Education Week[csedweek.org] e di Code.org [code.org] per introdurre milioni di studenti ad un'ora di informatica e programmazione."*

4. Non è concesso alcun uso di "Ora del Codice" o "Hour of Code" nei nomi delle app.

<a id="stickers"></a>

## Stampa questi adesivi da dare ai tuoi studenti

(Gli adesivi misurano 1" di diametro, 63 per foglio)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invia queste email per promuovere l'Ora del Codice

<a id="email"></a>

## Chiedi alla tua scuola, al tuo datore di lavoro o ai tuoi amici di iscriversi:

I computer sono ovunque e stanno cambiando ogni industria del pianeta. Ma meno della metà delle scuole insegna informatica. La buona notizia è che intendiamo cambiare rotta. Se hai già sentito parlare dell'Ora del Codice, probabilmente sai già che ha fatto la storia. Più di 100 milioni di studenti hanno provato l'Ora del Codice.

Con l'Ora del Codice, l'informatica è stata sulle homepage di Google, MSN, Yahoo! e anche del sito della Disney. Più di 100 partner si sono uniti per supportare questo movimento. Ogni Apple Store nel mondo ha ospitato un'Ora del Codice. Il presidente Obama ha scritto la sua prima riga di codice nell'ambito di questa campagna.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Spargi la voce. Organizza un evento. Chiedi ad una scuola di iscriversi. Prova tu stesso l'Ora del Codice -- Chiunque può trarre beneficio dell'apprendimento dei concetti fondamentali dell'informatica.

Per iniziare vai su http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invita i media a prendere parte al tuo evento:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. La buona notizia è che intendiamo cambiare rotta.

Con l'Ora del Codice, l'informatica è stata sulle homepage di Google, MSN, Yahoo! e anche del sito della Disney. Più di 100 partner si sono uniti per supportare questo movimento. Ogni Apple Store nel mondo ha ospitato un'Ora del Codice. Il presidente Obama ha scritto la sua prima riga di codice nell'ambito di questa campagna.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly, and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Unisciti a noi.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555

**When:** [DATE and TIME of your event]

**Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

<a id="parents"></a>

## Comunica ai genitori informazioni sull'evento della tua scuola:

Cari genitori,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Invita un politico locale all'evento della tua scuola:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]

<%= view :signup_button %>