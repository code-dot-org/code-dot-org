---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# How to teach one Hour of Code in after-school

## 1) Iscriviti

  * Iscriviti per organizzare un'[Ora del Codice](<%= resolve_url('/') %>) <%= campaign_date('short') %>.
  * Promovi la tua [Ora del codice](<%= resolve_url('/promote') %>) ed incoraggia gli altri ad organizzarla.

## 2) Guarda questo video di istruzioni <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Scegli un corso:

Mettiamo a disposizione molti [corsi divertenti da un'ora](<%= resolve_url('https://code.org/learn') %>) per partecipanti di tutte le età, realizzati da molti partner. *Sono in arrivo nuovi corsi per l'Ora del Codice, usciranno entro il <%= campaign_date('full') %>.* [Prova i corsi disponibili.](<%= resolve_url("https://code.org/learn") %>)

**Tutte i corsi dell'Ora del Codice:**

  * Richiedono un tempo di preparazione minimo per gli organizzatori
  * Sono auto-guidati — cioè permettono ai bambini di imparare secondo il proprio ritmo e livello di abilità

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Verifica le esigenze di tecnologia - i computer non sono indispensabili

La migliore esperienza dell'Ora del Codice si può avere con computer connessi a Internet. Ma **non** è necessario avere un computer per ogni bambino ed è possibile partecipare all'Ora del Codice anche senza alcun computer.

  * Prova le esercitazioni sui computer e sui dispositivi che intendi utilizzare. Assicurati che l'audio e il video funzionino correttamente sui browser.
  * Fornisci delle cuffie, o chiedi agli studenti di portarsi le loro, se l'esercitazione che hai scelto funziona meglio con il sonoro.
  * **Non hai abbastanza dispositivi per tutti gli studenti?** Usa la [programmazione in coppia](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quando i bambini fanno coppia, si aiutano l'un l'altro e fanno meno affidamento sull'organizzatore. In questo modo capiscono che l'informatica è un'attività che favorisce la collaborazione e le relazioni sociali.
  * **Hai una ridotta velocità di connessione a Internet?** Mostra tu i video con un proiettore, in modo da evitare che ogni studente li scarichi. Oppure prova ad usare le lezioni "tradizionali" (che non necessitano di connessione ad internet).

![](/images/fit-350/group_ipad.jpg)

## 5) Stimola i partecipanti ad iniziare la tua Ora del Codice

Dai il via alla tua Ora del Codice stimolando i partecipanti e discutendo di come l'informatica influisca su ogni parte delle nostre vite.

**Mostra un video stimolante:**

  * Il video di lancio originale del sito Code.org, in collaborazione con Bill Gates, Mark Zuckerberg e la stella del basket americano Chris Bosh (Ci sono versioni da [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuti](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minuti](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * Il [ video di lancio de l'Ora del Codice 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) o il <% if @country == 'uk' %>[Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [video de l'Ora del Codice 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Il video del Presidente Obama che invita gli studenti ad imparare l'informatica](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Puoi trovare altri video stimolanti [qui](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Non preoccuparti se sei a digiuno di informatica. Qui ci sono alcune idee per familiarizzarti con i corsi dell'Ora del Codice:**

  * Spiega in che modo la tecnologia influisce sulle nostre vite con degli esempi che interessino sia i ragazzi che le ragazze (puoi parlare di app e tecnologie che vengono utilizzate per salvare delle vite, aiutare la gente, mettere in comunicazione le persone, ecc.).
  * Elenca tutto ciò che utilizza programmi informatici nella vita quotidiana.
  * Puoi trovare dei suggerimenti per far interessare le ragazze all'informatica [qui](<%= resolve_url('https://code.org/girls') %>).

**Hai bisogno di ulteriori suggerimenti?** Scarica questo [modello di piano di lavoro di una lezione](/files/AfterschoolEducatorLessonPlanOutline.docx).

**Vuoi avere ulteriori suggerimenti riguardo all'insegnamento?** Scopri le [buone pratiche](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) consigliate da insegnanti esperti.

## 6) Scrivi del codice!

**Chi partecipa direttamente all'attività**

  * Scrivi il link del corso su una lavagna. Puoi trovare il link elencato sulle [ informazioni riguardo il corso che hai selezionato](<%= resolve_url('https://code.org/learn') %>) sotto il numero dei partecipanti.

**Se qualcuno si trova in difficoltà puoi rispondere:**

  * "Non lo so. Cerchiamo di capirlo insieme."
  * "La tecnologia non sempre funziona come vorremmo."
  * "Imparare a programmare è come imparare una nuova lingua; non è possibile parlarla subito fluentemente."

**Cosa fare se qualcuno finisce prima del previsto?**

  * Incoraggia i partecipanti a provare un'altra attività dell'Ora del Codice a [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Oppure, chiedi a chi ha finito prima di aiutare i compagni che si trovano in difficoltà.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Festeggia

  * [Stampa gli attestati](<%= resolve_url('https://code.org/certificates') %>) per i tuoi studenti.
  * Stampa gli adesivi ["Ho completato un'Ora del Codice!"](<%= resolve_url('/promote/resources#stickers') %>)
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your students.
  * Condividi le foto e i video del tuo evento dell'Ora del codice sui social media. Usa #HourOfCode e @codeorg e @programmafuturo così anche noi possiamo rilanciare il tuo successo!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Altre risorse dell'Ora del Codice per gli insegnanti:

  * Usa questo [modello di piano di lavoro di una lezione](/files/AfterschoolEducatorLessonPlanOutline.docx) per organizzare la tua Ora del Codice.
  * Scopri le [buone pratiche](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) consigliate dagli organizzatori delle passate edizioni de L'Ora del Codice. 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Visita il [Forum dell'Ora del Codice](http://forum.code.org/c/plc/hour-of-code) per ricevere consigli, opinioni e assistenza dagli altri organizzatori. <% if @country == 'us' %>
  * Controlla le [FAQ dell'Ora del Codice](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Cosa c'è dopo l'Ora del Codice?

L'Ora del Codice è soltanto il primo passo di un viaggio per imparare di più su come la tecnologia funziona e su come si creano gli applicativi software. To continue this journey: - The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>