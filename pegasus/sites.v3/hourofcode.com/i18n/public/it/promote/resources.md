---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promuovi l'Ora del Codice

## Stai organizzando un'Ora del Codice?[ Guarda la nostra guida](<%= resolve_url('/how-to') %>)  
  
Se sei in Italia puoi anche approfondire sul sito italiano <a href="https://www.programmailfuturo.it/come/ora-del-codice/introduzione" target="_blank">Programma il Futuro</a>

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Appendi questi poster nella tua scuola

<%= view :promote_posters %>

<a id="social"></a>

## Pubblica queste immagini sui social network

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Usa il logo dell'Ora del Codice per spargere la voce

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Scarica le versioni ad alta risoluzione](http://images.code.org/share/hour-of-code-logo.zip)

**Il nome "Hour of Code" ("Ora del codice") è un marchio registrato. Non vogliamo impedirne l'utilizzo, ma vogliamo assicurarci che l'uso rispetti alcuni limiti:**

1. Qualsiasi riferimento a "Hour of Code" ("Ora del codice") deve essere fatto in modo che non suggerisca che sia un tuo marchio, ma piuttosto si riferisca all'Ora del Codice come un movimento di gente comune. **Un esempio di uso corretto: "Partecipa all'Ora del Codice sul sito di ACMECorp.com". Un esempio di uso sbagliato: "Prova l'Ora del Codice di ACME Corp".**
2. Utilizza un apice "TM" dove menzioni "Ora del Codice" o "Hour of Code", sia sul tuo sito web sia nelle descrizioni delle app.
3. Includi una nota nella pagina (o nel piè di pagina), che contenga i collegamenti ai siti web CSEdWeek e Code.org e indichi quanto segue:
    
    *"L' Ora del Codice (Hour of Code™) è un'iniziativa nazionale della Computer Science Education Week [csedweek.org] e di Code.org [code.org] per introdurre milioni di studenti ad un'ora di informatica e programmazione."*

4. Non è concesso alcun uso di "Ora del Codice" o "Hour of Code" nei nomi delle app.

<a id="stickers"></a>

## Stampa questi adesivi da dare ai tuoi studenti

(Gli adesivi misurano 1" di diametro, 63 per foglio)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invia queste email per promuovere l'Ora del Codice

<a id="email"></a>

### Chiedi alla tua scuola, al tuo datore di lavoro o ai tuoi amici di iscriversi:

**Oggetto:** Unisciti a me e ad oltre 100 milioni di studenti per un'Ora del Codice

I computer sono ovunque e stanno cambiando ogni industria del pianeta. Ma meno della metà delle scuole insegna informatica. La buona notizia è che intendiamo cambiare rotta! Se hai già sentito parlare dell'Ora del Codice, probabilmente sai già che ha fatto la storia. Più di 100 milioni di studenti hanno provato un'Ora del Codice.

Con l'Ora del Codice, l'informatica è stata sulle homepage di Google, MSN, Yahoo! e Disney. Più di 100 partner si sono uniti per supportare questo movimento. Ogni Apple Store nel mondo ha ospitato un'Ora del Codice e leader come il Presidente Obama ed il primo ministro canadese Justin Trudeau hanno scritto le prime righe di codice come parte della campagna.

Quest'anno facciamo in modo che cresca ancora di più. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Sarebbe ottimo se ti facessi coinvolgere in un evento dell'Ora del Codice durante la Settimana di Educazione all'Informatica, <%= campaign_date('full') %>.

Spargi la voce. Organizza un evento. Chiedi ad una scuola di iscriversi. Prova tu stesso l'Ora del Codice — Chiunque può trarre beneficio dell'apprendimento dei concetti fondamentali dell'informatica.

Per iniziare vai su http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Proponiti come volontario in una scuola:

**Oggetto:** Possiamo aiutarvi ad ospitare un Ora del Codice?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Alla nostra organizzazione / Mio nome] piacerebbe aiutare la scuola [nome della scuola] a svolgere un evento dell'Ora del Codice. Possiamo aiutare gli insegnanti ad ospitare un'Ora del Codice nelle loro classi (non abbiamo nemmeno bisogno computer!) o, se preferite organizzare un'assemblea di tutta la scuola, possiamo partecipare come testimonial per spiegare come funziona la tecnologia e cosa significa essere un ingegnere informatico.

Gli studenti creeranno le proprie applicazioni o giochi che possono mostrare ai loro genitori e si potranno anche stampare dei certificati dell'Ora del Codice da portare a casa. Ed, è divertente! Con attività interattive, sul campo, gli studenti apprenderanno le competenze del pensiero computazionale in modo facilmente accessibile.

I computer sono ovunque e stanno cambiando ogni industria del pianeta. Ma meno della metà delle scuole insegna informatica. La buona notizia è che intendiamo cambiare rotta! Se avete già sentito parlare dell'Ora del Codice, forse sapete che ha fatto storia - più di 100 milioni gli studenti nel mondo hanno provato un'Ora del Codice.

Grazie all'Ora del Codice, l'informatica è stata sulle homepage di Google, MSN, Yahoo! e Disney. Più di 100 partner si sono uniti per supportare questo movimento. Ogni Apple Store nel mondo ha ospitato un'Ora del Codice ed anche leader come il Presidente Obama ed il primo ministro canadese Justin Trudeau hanno scritto le prime righe di codice come parte della campagna.

Potete leggere di più sull'evento presso http://hourofcode.com/it In alternativa, fateci sapere se volete dedicare del tempo per parlare di come la scuola [nome della scuola] può partecipare.

Grazie!

[IL TUO NOME], [LA TUA ORGANIZZAZIONE]

<a id="media-pitch"></a>

### Invita i media a prendere parte al tuo evento:

**Oggetto:** la scuola si unisce alla missione di avvicinare gli studenti all'informatica

I computer sono ovunque e stanno cambiando ogni industria del pianeta, ma meno della metà delle scuole insegna informatica. Le ragazze e le minoranze sono molto poco rappresentate negli studi informatici e nelle aziende tecnologiche. La buona notizia è che intendiamo cambiare rotta.

Con l'Ora del Codice, l'informatica è stata sulle homepage di Google, MSN, Yahoo! e Disney. Più di 100 partner si sono uniti per supportare questo movimento. Ogni Apple Store nel mondo ha ospitato un'Ora del Codice. Anche il presidente Obama ha scritto la sua prima riga di codice nell'ambito di questa campagna.

Ecco perché ognuno dei [NUMERO] studenti della scuola [NOME SCUOLA] sta per prendere parte al più grande evento nella storia dell'apprendimento: l'Ora del Codice, durante la Settimana di Educazione all'Informatica (<%= campaign_date('full') %>).

Ti scrivo per invitarti a partecipare alla nostra riunione di lancio e vedere i ragazzi che iniziano l'attività il [DATA].

L'Ora del Codice, organizzata da Code.org e da oltre 100 altre organizzazioni senza scopo di lucro, è un movimento globale che crede che la generazione degli studenti di oggi sia pronta ad imparare le competenze cruciali per il successo nel XXI secolo. Unisciti a noi.

**Contatto:** [IL TUO NOME], [TITOLO], cellulare: (333) 555-5555 **Quando:** [DATA e ORA del vostro evento] **Dove:** [INDIRIZZO e INDICAZIONI]

Vi aspettiamo.

[IL TUO NOME]

<a id="parents"></a>

### Comunica ai genitori informazioni sull'evento della tua scuola:

**Oggetto:** I nostri studenti stanno cambiando il futuro con un'Ora del Codice

Cari genitori,

Viviamo in un mondo in cui siamo circondati dalla tecnologia. E sappiamo che qualunque sarà il campo in cui i nostri studenti sceglieranno di impegnarsi nel loro futuro di adulti, le possibilità di successo dipenderanno sempre di più dalla loro capacità di capire come funziona la tecnologia.

Ma solo una piccola parte di noi sta imparando **come** funziona la tecnologia. Meno della metà di tutte le scuole insegna informatica.

Ecco perché tutta la nostra scuola si è unita al più grande evento di apprendimento della storia: L'Ora del Codice, durante la Settimana di Educazione all'Informatica (<%= campaign_date('full') %>). Più di 100 milioni di studenti di tutto il mondo hanno già provato l'Ora del Codice.

L'Ora del Codice è una dichiarazione che la scuola [NOME SCUOLA] è pronta ad insegnare queste competenze fondamentali per raggiungere il successo nel XXI secolo. Per poter continuare a mettere a disposizione dei vostri studenti altre attività riguardanti la programmazione, vogliamo fare in modo che il nostro evento dell'Ora del Codice sia immenso. Vi incoraggio ad offrirvi volontari, a contattare i media locali, a diffondere la notizia sui social network e a prendere in considerazione la possibilità di organizzare altri eventi dell'Ora del Codice nella vostra comunità.

Questa è una possibilità di cambiare il futuro dell'istruzione a [NOME CITTA'].

Visita il sito italiano <a href="https://www.programmailfuturo.it/come/ora-del-codice/introduzione" target="_blank">www.programmailfuturo.it</a> per altri dettagli e contribuire a diffondere la notizia.

Cordiali saluti,

Il Dirigente Scolastico

<a id="politicians"></a>

### Invita un politico locale all'evento della tua scuola:

**Oggetto:** Si unisca ai nostri studenti che stanno cambiando il futuro con un'Ora del Codice

Spettabile [COGNOME DEL Sindaco/Governatore/Rappresentante/Senatore]:

Sapeva che l'informatica è la principale fonte di retribuzione negli Stati Uniti? Ci sono più di 500.000 posti di lavoro vacanti in informatica, ma l'anno scorso solo 42.969 studenti di informatica si è laureato e si è affacciato sul mondo del lavoro.

L'informatica è oggi fondamentale per *ogni* settore. Eppure la maggior parte delle scuole non la insegnano. Alla scuola [NOME DELLA SCUOLA], stiamo cercando di cambiare la situazione.

Ecco perché tutta la nostra scuola si è unita al più grande evento di apprendimento della storia: L'Ora del Codice, durante la Settimana di Educazione all'Informatica (<%= campaign_date('full') %>). Più di 100 milioni di studenti di tutto il mondo hanno già provato l'Ora del Codice.

Le scrivo per invitarla a partecipare al nostro evento dell'Ora del Codice e a parlare al nostro incontro di lancio. L'evento si svolgerà il giorno [DATA, ORA, LUOGO] e costituirà una forte dichiarazione che [REGIONE O CITTA'] è pronta per insegnare ai nostri studenti le competenze fondamentali per avere successo nel XXI secolo. Vogliamo assicurarci che i nostri studenti siano all'avanguardia nella creazione delle tecnologie del futuro — non ne siano solo dei consumatori.

La prego di contattarmi a [NUMERO DI TELEFONO O EMAIL]. Attendo con ansia la Sua risposta.

Cordiali saluti,

[IL TUO NOME], [TITOLO]

<%= view :signup_button %>