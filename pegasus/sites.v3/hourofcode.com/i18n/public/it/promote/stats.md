---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Statistiche Utili

## Utilizza questa breve descrizione nelle newsletter

### Porta l'informatica nella tua scuola. Inizia con un'Ora del Codice

I computer sono ovunque, ma rispetto a 10 anni fa le scuole che insegnano informatica sono diminuite. La buona notizia è che siamo intenzionati a cambiare rotta. Se lo scorso anno hai sentito parlare dell'[Ora del Codice](<%= resolve_url('/') %>), forse già sai che ha fatto storia. Nella prima Ora del Codice, 15 milioni di studenti hanno provato l'informatica. L'anno scorso, questo numero è salito a 100 milioni di studenti! L'[Ora del Codice](<%= resolve_url('/') %>) consiste in una lezione di introduzione all'informatica della durata di un'ora, progettata per rimuovere l'alone di mistero che spesso avvolge la programmazione dei computer e per mostrare che l'informatica non è affatto difficile da capire, chiunque può impararne le basi. [Iscriviti](<%= resolve_url('/') %>) per organizzare un'Ora del Codice in queste date <%= campaign_date('full') %> durante la Settimana di Educazione all'Informatica. Per aggiungere la tua scuola alla mappa, via su https://hourofcode.com/<%= @country %>

## Infografica

<%= view :stats_carousel %>

