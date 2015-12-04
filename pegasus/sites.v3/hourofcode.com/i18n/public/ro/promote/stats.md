---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Rezumate si statistici utile

## Folosiți acest scurt rezumat în buletinele de știri

### Aduceți informatica în școala dvs. Începeți cu o Ora de Programare

Computerele sunt peste tot, dar predau informatica mai puţine şcoli decât acum 10 ani. Vestea bună e că suntem pe cale să schimbăm acest lucru. Dacă ați auzit despre [Hour of Code](<%= resolve_url('/') %>)anul trecut, poate ştiți şi că a făcut istorie. La primul eveniment Hour of Code, 15 milioane de elevi au incercat tehnologia computer-ului. Anul trecut, numarul a crescut la 60 de milioane de elevi! Evenimentul[Hour of Code](<%= resolve_url('/') %>)reprezinta o introducere in programare de o ora, realizata pestu a demistifica limbajul programarii si pentru a arăta că oricine poate învăța bazele acesteia. [Inscrie-te](<%= resolve_url('/') %>)pentru a tine un eveniment Hour of Code în timpul Săptămânii Educației in tehnologia computerelor. <%= campaign_date('full') %> Pentru a vă adauga şcoala pe hartă, mergeți la https://hourofcode.com/<%= @country %>

## Infografice

<%= view :stats_carousel %>

<%= view :signup_button %>