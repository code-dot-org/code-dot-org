---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Come insegnare un'Ora del Codice

Unisciti al movimento e introduci un gruppo di studenti alla loro prima ora di informatica con questi passaggi:

## 1) Guarda questo video tutorial <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe> 

## 2) Scegli un'esercitazione per la tua Ora del Codice:

Ti forniamo una ambia scelta di [esercitazioni divertenti della durata di un'ora](<%= resolve_url('/learn') %>) adatti per studenti di tutte le età, creati da diversi partner.  
  
**Trovi altre informazioni in italiano sul sito <a href="https://www.programmailfuturo.it/come/ora-del-codice/introduzione" target="_blank">Programma il Futuro</a>**

**[Tutti i corsi dell'Ora del Codice:](<%= resolve_url('/learn') %>)**

  * Richiedono un tempo di preparazione minimo per gli insegnanti
  * Sono auto-guidati — cioè permettono agli studenti di imparare secondo il proprio ritmo e livello di abilità

**[Tutorial per Ore del Codice guidate dagli insegnati:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * Sono lezioni che richiedono un po' più di preparazione da parte dell'insegnante
  * Sono classificate per livello scolastico *e* per argomento (ad esempio: matematica, inglese, ecc.)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 3) Promuovi la tua Ora del Codice

Promuovi la tua Ora del Codice [con questi strumenti](<%= resolve_url('/promote') %>) e incoraggia gli altri a fare altrettanto.

## 4) Verifica le esigenze di tecnologia - i computer non sono indispensabili

Il miglior modo per godersi l'Ora del Codice è avere computer connessi a Internet. Tuttavia **non** è necessario un computer per ciascuno studente e si può addirittura svolgere l'Ora del Codice senza alcun computer.

**Preparati prima!** Prima che inizi il tuo evento, assicurati di svolgere le seguenti operazioni:

  * Prova i corsi sui computer e sui dispositivi che gli studenti utilizzeranno. Assicurati che l'audio e il video funzionino correttamente sui browser.
  * Fornisci delle cuffie alla tua classe, o chiedi agli studenti di portarsi le loro, se l'esercitazione che hai scelto funziona meglio con il sonoro.
  * **Non hai abbastanza dispositivi per tutti gli studenti?** Usa la [programmazione in coppia](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quando gli studenti lavorano in coppia, si aiutano a vicenda e fanno meno affidamento sul docente. In questo modo capiscono che l'informatica è un'attività che favorisce la collaborazione e le relazioni sociali.
  * **Hai una ridotta velocità di connessione a Internet?** Mostra tu i video a tutta la classe, in modo da evitare che ogni studente li scarichi. Oppure prova ad usare le lezioni "tradizionali" (che non necessitano di connessione ad internet).

![](/images/fit-350/group_ipad.jpg)

## 5) Inizia la tua Ora del Codice con un testimonial o un video stimolante

**Invita un [volontario del luogo](https://code.org/volunteer/local) (solo per gli USA) per ispirare i tuoi studenti parlando delle numerose opportunità in informatica.** Ci sono migliaia di volontari in tutto il mondo pronti ad aiutare con gli eventi dell'Ora del Codice. [Usa questa mappa](https://code.org/volunteer/local) per trovare volontari locali (solo per gli USA) che possono venire nella tua aula o partecipare a una chat video con i tuoi studenti.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**Mostra un video motivante:**

  * Il video di lancio originale del sito Code.org, in collaborazione con Bill Gates, Mark Zuckerberg e la stella del basket americano Chris Bosh (Ci sono versioni da [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuti](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minuti](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * Il [ video di lancio de l'Ora del Codice 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) o il <% if @country == 'uk' %>[Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [video de l'Ora del Codice 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Il video del Presidente Obama che invita gli studenti ad imparare l'informatica](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Trova ancora più [risorse](<%= resolve_url('https://code.org/inspire') %>) e [video](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP) stimolanti <a href="https://www.programmailfuturo.it/notizie/il-terzo-anno-del-progetto/marco-belinelli-con-programma-il-futuro" target="_blank">oppure questo in italiano di Programma il Futuro</a>..

**Non preoccuparti se sia tu che i tuoi studenti siete digiuni di informatica. Qui ci sono alcune idee per farti familiarizzare con le attività della tua Ora del Codice:**

  * Spiega in che modo la tecnologia influisce sulle nostre vite con degli esempi che interessino sia i ragazzi che le ragazze (puoi parlare di come venga utilizzata per salvare delle vite, aiutare la gente, mettere in comunicazione le persone, ecc.).
  * Elenca tutto ciò che utilizza programmi informatici nella vita quotidiana.
  * Puoi trovare dei suggerimenti per far interessare le ragazze all'informatica [qui](<%= resolve_url('https://code.org/girls') %>).

**Hai bisogno di ulteriore aiuto?** Scarica questo [schema per pianificare le lezioni](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Vuoi avere ulteriori suggerimenti riguardo all'insegnamento?** Scopri le [buone pratiche](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) consigliate da insegnanti esperti.

## 6) Scrivi del codice!

**Guida gli studenti nell'attività**

  * Scrivi il link dell'esercitazione sulla lavagna. Puoi trovare i link nelle [informazioni dell'esercitazione da te selezionata](<%= resolve_url('/learn') %>) ("Link breve" nella tabella sotto alla descrizione dell'esercitazione).

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**Quando i partecipanti incontrano delle difficoltà, si può rispondere così:**

  * "Non lo so. Cerchiamo di capirlo insieme."
  * "La tecnologia non sempre funziona come vorremmo."
  * "Imparare a programmare è come imparare una nuova lingua; non è possibile parlarla subito fluentemente."

**[Guarda questi suggerimenti per insegnare](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Cosa fare se qualcuno finisce prima del previsto?**

  * Gli studenti possono visionare tutte le esercitazioni e provare un'altra attività dell'Ora del Codice su [hourofcode.com/learn](<%= resolve_url('/learn') %>)
  * Oppure è possibile proporre agli studenti che hanno terminato prima di aiutare i compagni di classe che hanno difficoltà con l'attività.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Festeggia

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [Stampa gli attestati](<%= resolve_url('https://code.org/certificates') %>) per i tuoi studenti.
  * Stampa gli adesivi ["Ho completato un'Ora del Codice!"](<%= resolve_url('/promote/resources#stickers') %>)
  * [Ordina T-shirt personalizzate](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) per i tuoi studenti (per gli USA).
  * Condividi le foto e i video del tuo evento dell'Ora del codice sui social media. Usa #HourOfCode e @codeorg e @programmafuturo così anche noi possiamo rilanciare il tuo successo!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Altre risorse dell'Ora del Codice per gli insegnanti:

  * Usa questo [modello di lavoro di una lezione](/files/EducatorHourofCodeLessonPlanOutline.docx) per organizzare la tua Ora del Codice.
  * Scopri le [buone pratiche](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) consigliate dagli insegnanti delle passate edizioni de L'Ora del Codice. 
  * Guarda la registrazione del nostro webinar [Guida per l'Educatore all'Ora del Codice](https://youtu.be/EJeMeSW2-Mw).
  * [Partecipa dal vivo a una sessione di Domande e Risposte](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) con il nostro fondatore, Hadi Partovi, per prepararti all'Ora del Codice.
  * Visita il [Forum dell'Ora del Codice per gli Insegnanti](http://forum.code.org/c/plc/hour-of-code) per ricevere consigli, opinioni e assistenza dagli altri insegnanti. <% if @country == 'us' %>
  * Controlla le [FAQ dell'Ora del Codice](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Cosa c'è dopo l'Ora del Codice?

L'Ora del Codice è solo il primo passo in un viaggio per imparare di più su come funziona la tecnologia e come creare applicazioni software. Per continuare questo viaggio:

  * Incoraggia gli studenti a continuare a [imparare online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Frequentate](<%= resolve_url('https://code.org/professional-development-workshops') %>) un seminario di un giorno, per ricevere istruzioni da un esperto di informatica. (Solo per gli USA)

<%= view :signup_button %>