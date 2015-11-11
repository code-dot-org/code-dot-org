* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# Promozione e Statistiche Utili

## Utilizza questa breve descrizione nelle newsletter

### Porta l'informatica nella tua scuola. Iniziare con un'Ora del Codice

I computer sono ovunque, ma rispetto a 10 anni fa le scuole che insegnano informatica sono diminuite. La buona notizia è che siamo intenzionati a cambiare rotta. If you heard about the [Hour of Code](%= resolve_url('/') %) last year, you might know it made history. Nella prima Ora del Codice, 15 milioni di studenti hanno provato l'ingegneria informatica. L'ultimo anno, quel numero è salito a 60 milioni di studenti! L'[Ora del Codice](%= resolve_url('/') %) consiste in una lezione di introduzione all'informatica della durata di un'ora, progettata per rimuovere l'alone di mistero che spesso avvolge la programmazione dei computer e per mostrare che l'informatica non è affatto difficile da capire, chiunque può impararne le basi. [Iscriviti](%= resolve_url('/') %) per organizzare un'Ora del Codice in queste date <%= campaign_date('full') %> durante la Settimana di Educazione all'Informatica. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infografica

<%= view :stats_carousel %>

<%= view :signup_button %>