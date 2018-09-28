---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### Unisciti al movimento ed introduci un gruppo di studenti alla loro prima ora di informatica seguendo questi passi. L'Ora del Codice è facile da eseguire - anche per i principianti! If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your class.

### Take a look at our [participation guide if you still have questions](%= localized_file('/files/participation-guide.pdf') %).

* * *

## 1. Guarda questo video introduttivo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Scegli un'esercitazione

We provide a variety of fun, [student-guided tutorials](%= resolve_url('/learn') %) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Promuovi la tua Ora del Codice

Promote your Hour of Code [with these tools](%= resolve_url('/promote/resources') %) and encourage others to host their own events.

## 4. Pianifica le tue necessità tecnologiche - i computer non sono indispensabili

Il miglior modo per godersi l'Ora del Codice è avere computer connessi a Internet. Tuttavia **non** è necessario un computer per ciascuno studente e si può addirittura svolgere l'Ora del Codice senza alcun computer.

Esegui dei test sui computer degli studenti per verificare che le esercitazioni funzionino correttamente sui browser utilizzati anche con audio e video. **C'è una scarsa connessione ad Internet?** Pianifica di mostrare i video a tutta la classe, in modo da evitare che ogni studente scarichi singolarmente i video. Oppure prova le lezioni tradizionali.

Se l'esercitazione che hai scelto funziona meglio con il sonoro, fornisci delle cuffie alla tua classe o chiedi agli studenti di portarsi le loro.

**Non hai abbastanza dispositivi per tutti gli studenti?** Usa la [programmazione in coppia](https://youtu.be/sTJ85VIYDRE). Quando gli studenti lavorano in coppia, si aiutano a vicenda e fanno meno affidamento sull'insegnante. In questo modo capiscono anche che l'informatica è un'attività che favorisce la collaborazione e le relazioni sociali.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Inizia la tua Ora del Codice con un testimonial o un video stimolante

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Mostra un video stimolante:**

- Il video di lancio originale del sito Code.org, in collaborazione con Bill Gates, Mark Zuckerberg e la stella del basket americano Chris Bosh. (Ci sono versioni da [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuti](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minuti](https://www.youtube.com/watch?v=dU1xS07N-FA)) (solo in inglese)
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Spiega in che modo la tecnologia influisce sulle nostre vite con degli esempi che interessino sia i ragazzi che le ragazze (puoi parlare di come venga utilizzata per salvare delle vite, aiutare la gente, mettere in comunicazione le persone, ecc.).
- Elenca tutto ciò che utilizza programmi informatici nella vita quotidiana.
- See tips for getting girls interested in computer science [here](%= codeorg_url('/girls')%).

## 6. Scrivi del codice!

**Direct students to the activity**

- Scrivi il link dell'esercitazione sulla lavagna. Puoi recuperare questo link cliccando sull'[esercitazione](%= resolve_url('/learn') %) che desideri e copiando l'indirizzo che appare nella tabella accanto all'indicazione "Link breve".

**When your students come across difficulties it's okay to respond:**

- "Non lo so. Cerchiamo di capirlo insieme."
- "La tecnologia non sempre funziona come vorremmo."
- "Imparare a programmare è come imparare una nuova lingua; non è possibile parlarla subito fluentemente."

**What if a student finishes early?**

- Gli studenti possono vedere tutte le esercitazioni e [provare un'altra attività dell'Ora del Codice](%= resolve_url('/learn')%).
- Oppure è possibile proporre agli studenti che hanno terminato prima, di aiutare i compagni di classe che hanno delle difficoltà.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Festeggia

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](%= codeorg_url('/certificates')%) for your students.
- Stampa gli adesivi ["Ho completato un'Ora del Codice!"](%= resolve_url('/promote/resources#stickers') %)
- [Ordina T-shirt personalizzate](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) per i tuoi studenti (solo per gli USA).
- Condividi le foto e i video del tuo evento dell'Ora del Codice sui social network. Usa #OradelCodice, #HourOfCode, @codeorg e @programmafuturo così anche noi possiamo condividere il tuo successo!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Altre risorse dell'Ora del Codice per gli insegnanti:

- È disponibile un [Forum in inglese di discussione per gli insegnanti](http://forum.code.org/c/plc/hour-of-code). Se sei italiano visita il [Forum italiano di Programma il Futuro](https://www.programmailfuturo.it/aiuto/forum-di-aiuto) per ricevere consigli, opinioni e assistenza dagli altri insegnanti. <% if @country == 'us' %>
- Controlla le [FAQ dell'Ora del Codice](https://hourofcode.com/it#faq). <% end %>

## Cosa c'è dopo l'Ora del Codice?

L'Ora del Codice è solo il primo passo in un viaggio per imparare di più su come funziona la tecnologia e come creare applicazioni software. Per continuare questo viaggio:

- Encourage students to continue to [learn online](%= codeorg_url('/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>