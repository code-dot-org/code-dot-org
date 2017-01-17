---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

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

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Qualsiasi riferimento a "Hour of Code" deve essere fatto in modo che non suggerisca che sia un tuo marchio, ma piuttosto si riferisca all'Ora del Codice come un movimento di gente comune. Un esempio di uso corretto: "Partecipa all'Ora del Codice sul sito di ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Includi una nota nella pagina (o nel piè di pagina), che contenga i collegamenti ai siti web CSEdWeek e Code.org e indichi quanto segue:
    
    *"Hour of Code™" è un'iniziativa nazionale della Computer Science Education Week[csedweek.org] e di Code.org [code.org] per introdurre milioni di studenti ad un'ora di informatica e di programmazione dei computer*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Stampa questi adesivi da dare ai tuoi studenti

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invia queste email per promuovere l'Ora del Codice

<a id="email"></a>

## Chiedi alla tua scuola, al tuo datore di lavoro o ai tuoi amici di iscriversi:

Computers are everywhere, changing every industry on the planet. But fewer than half of all schools teach computer science. La buona notizia è che siamo intenzionati a cambiare rotta. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! e anche del sito della Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invita i media a prendere parte al tuo evento:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. La buona notizia è che siamo intenzionati a cambiare rotta.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! e anche del sito della Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly, and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Please join us.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555

**When:** [DATE and TIME of your event]

**Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

<a id="parents"></a>

## Comunica ai genitori informazioni sull'evento della tua scuola:

Dear Parents,

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