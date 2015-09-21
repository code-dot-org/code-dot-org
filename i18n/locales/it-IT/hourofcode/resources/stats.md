* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# Promozione e Statistiche Utili

## Utilizza questa breve descrizione nelle newsletter

### Porta l'informatica nella tua scuola. Iniziare con un'Ora del Codice

I computer sono ovunque, ma rispetto a 10 anni fa le scuole che insegnano informatica sono diminuite. La buona notizia è che siamo intenzionati a cambiare rotta. If you heard about the [Hour of Code](%= resolve_url('/') %) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](%= resolve_url('/') %) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](%= resolve_url('/') %) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infografica

<%= view :stats_carousel %>

<%= view :signup_button %>