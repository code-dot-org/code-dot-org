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

## Appendi questi poster nella tua scuola

<%= view :promote_posters %>

<a id="banners"></a>

## Inserisci questi banner nel tuo sito web

[![image](/images/fit-250/banner1.jpg)](/images/banner1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/banner3.jpg)](/images/banner3.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-500/banner5.jpg)](/images/banner5.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="social"></a>

## Pubblicare questi sui social media

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invia queste email per promuovere l'Ora del Codice

<a id="email"></a>

## Chiedi alla tua scuola, al tuo datore di lavoro o ai tuoi amici di iscriversi:

I computer sono ovunque, ma rispetto a 10 anni fa le scuole che insegnano informatica sono diminuite. La buona notizia è che siamo intenzionati a cambiare rotta. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! e anche del sito della Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Spargi la voce. Organizza un evento. Chiedi ad una scuola di iscriversi. O prova tu stesso l'Ora del Codice -- Chiunque può trarre beneficio dell'apprendimento dei concetti fondamentali dell'informatica.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invita i media a prendere parte al tuo evento:

**Subject line:** Local school joins mission to introduce students to computer science

I computer sono ovunque, ma l'informatica viene insegnata in un numero di scuole inferiore rispetto a quello di solo 10 anni fa. Le ragazze e le minoranze sono gravemente sottorappresentate. La buona notizia è che siamo sulla strada giusta per cambiare presto tutto questo.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! e anche del sito della Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Vi scrivo per invitarvi a frequentare la nostra riunione di lancio e vedere i ragazzi che iniziano l'attività il [DATA].

L'Ora del Codice, organizzata da Code.org e da oltre 100 altre organizzazioni senza scopo di lucro, è un'affermazione che la generazione degli studenti di oggi è pronta ad imparare le abilità critiche per il successo nel XXI secolo. Unisciti a noi.

**Contatti:** [IL TUO NOME], [RUOLO], cell: (333) 555-5555

**Quando:** [DATA e ORA del tuo evento]

**Dove:** [INDIRIZZO e INDICAZIONI per raggiungere il luogo dell'evento]

Vi aspettiamo.

<a id="parents"></a>

## Comunica ai genitori informazioni sull'evento della tua scuola:

Cari genitori,

Viviamo in un mondo in cui siamo circondati dalla tecnologia. E sappiamo che qualunque sarà il campo in cui i nostri studenti sceglieranno di impegnarsi nel loro futuro di adulti, le possibilità di successo dipenderanno sempre di più dalla loro capacità di capire come funziona la tecnologia. Ma solo una piccola frazione di noi sta imparando l'informatica e oggi sono meno gli studenti che la studiano rispetto ad un decennio fa.

Ecco perché tutta la nostra scuola si è unita al più grande evento di apprendimento della storia: L'Ora del Codice, durante la Settimana dell'Educazione Informatica 7-13). More than 100 million students worldwide have already tried an Hour of Code.

L'Ora del codice è una dichiarazione che la scuola [NOME SCUOLA] è pronta ad insegnare queste abilità fondamentali per raggiungere il successo nel XXI secolo. Per poter continuare a mettere a disposizione dei vostri studenti altre attività riguardanti la programmazione, vogliamo fare in modo che il nostro evento Ora del Codice sia enorme. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Questa è una possibilità di cambiare il futuro dell'istruzione a [NOME CITTA'].

Andata alla pagina http://hourofcode.com/<%= @country %> per i dettagli e contribuirt a diffondere la notizia.

Cordiali saluti,

Il Dirigente Scolastico

<a id="politicians"></a>

## Invita un politico locale all'evento della tua scuola:

Spettabile [COGNOME DEL Sindaco/Governatore/Rappresentante/Senatore]:

Sapeva che nell'economia odierna, i lavori per informatici superano gli studenti laureati in informatica per 3 a 1? E l'informatica è alla base di *tutta* l'industria moderna. Yet most of schools don’t teach it. Presso la scuola [NOME SCUOLA] stiamo cercando di cambiare le cose.

Ecco perché tutta la nostra scuola si è unita al più grande evento di apprendimento della storia: L'Ora del Codice, durante la Settimana dell'Educazione Informatica 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Le scrivo per invitarla a partecipare al nostro evento Ora del Codice e a parlare al nostro incontro di lancio. L'evento si svolgerà il giorno [DATA, ORA, LUOGO] e costituirà una forte dichiarazione che [REGIONE O CITTA'] è pronta per insegnare ai nostri studenti le competenze fondamentali per avere successo nel XXI secolo. Vogliamo assicurarci che i nostri studenti siano all'avanguardia della creazione delle tecnologie del futuro--non ne siano solo dei consumatori.

La prego di contattarmi a [NUMERO DI TELEFONO O EMAIL]. Attendo con ansia la Sua risposta.

Sinceramente, [NOME], [TITOLO]

