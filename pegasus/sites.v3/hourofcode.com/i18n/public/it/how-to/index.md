---
title: '<%= hoc_s(:title_how_to) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Come insegnare un'Ora del Codice</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) as well as [teacher-guided tutorials](<%= resolve_url('https://code.org/educate/teacher-led') %>) for participants of all ages, created by a variety of partners.

[![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

Il miglior modo per godersi l'Ora del Codice è avere computer connessi a Internet. Tuttavia **non** è necessario un computer per ciascuno studente e si può addirittura svolgere l'Ora del Codice senza alcun computer.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Fornisci delle cuffie alla tua classe, o chiedi agli studenti di portarsi le loro, se l'esercitazione che hai scelto funziona meglio con il sonoro.

**Non hai abbastanza dispositivi per tutti gli studenti?** Usa la [programmazione in coppia](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quando gli studenti lavorano in coppia, si aiutano a vicenda e fanno meno affidamento sul docente. In questo modo capiscono che l'informatica è un'attività che favorisce la collaborazione e le relazioni sociali.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= resolve_url('https://code.org/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Mostra un video motivante:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Trova ancora più [risorse](<%= resolve_url('https://code.org/inspire') %>) e [video](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP) stimolanti <a href="https://www.programmailfuturo.it/notizie/il-terzo-anno-del-progetto/marco-belinelli-con-programma-il-futuro" target="_blank">oppure questo in italiano di Programma il Futuro</a>.

**Non preoccuparti se sia tu che i tuoi studenti siete digiuni di informatica. Qui ci sono alcune idee per farti familiarizzare con le attività della tua Ora del Codice:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Elenca tutto ciò che utilizza programmi informatici nella vita quotidiana.
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls')%>).

## 6. Code!

**Guida gli studenti nell'attività**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**Quando i partecipanti incontrano delle difficoltà, si può rispondere così:**

- "Non lo so. Cerchiamo di capirlo insieme."
- "La tecnologia non sempre funziona come vorremmo."
- "Imparare a programmare è come imparare una nuova lingua; non è possibile parlarla subito fluentemente."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- Oppure è possibile proporre agli studenti che hanno terminato prima di aiutare i compagni di classe che hanno difficoltà con l'attività.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= resolve_url('https://code.org/certificates')%>) for your students.
- Stampa gli adesivi ["Ho completato un'Ora del Codice!"](<%= resolve_url('/promote/resources#stickers') %>)
- [Ordina T-shirt personalizzate](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) per i tuoi studenti (per gli USA).
- Condividi le foto e i video del tuo evento dell'Ora del codice sui social media. Usa #HourOfCode e @codeorg e @programmafuturo così anche noi possiamo condividere il tuo successo!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Altre risorse dell'Ora del Codice per gli insegnanti:

- Visita il [Forum dell'Ora del Codice per gli Insegnanti](http://forum.code.org/c/plc/hour-of-code) per ricevere consigli, opinioni e assistenza dagli altri insegnanti. <% if @country == 'us' %>
- Controlla le [FAQ dell'Ora del Codice](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Cosa c'è dopo l'Ora del Codice?

L'Ora del Codice è solo il primo passo in un viaggio per imparare di più su come funziona la tecnologia e come creare applicazioni software. Per continuare questo viaggio:

- Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond')%>).
- [Frequentate](<%= resolve_url('https://code.org/professional-development-workshops') %>) un seminario di un giorno, per ricevere istruzioni da un esperto di informatica. (Solo per gli USA)

<%= view :signup_button %>