* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premii - termeni și condiții

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. Creditul de 10 dolari trebuie adaugat unui cont deja existent, acesta expirand dupa 1 an. Limita este de un premiu pe organizator.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. În cazul în care întreaga şcoală participă la Hour of Code, pentru a se califica, fiecare profesor trebuie să se înregistreze individual ca organizator.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Laptopuri pentru întreaga clasă (sau 10.000 Usd pentru alte tehnologii):

Premiul limitat numai pentru şcoli publice K-12 Sua. Pentru a te califica, intreaga scoala trebuie sa fie inregistrata pentru evenimentul Hour of Code pana pe 16 noiembrie 2015. O şcoală din fiecare stat al Sua va primi un set de calculatoare pentru clasă. Code.org va selecta si anunta castigatorii prin e-mail pana pe 1 decembrie 2015.

Pentru a clarifica, acest lucru nu este un concurs care implică noroc.

1) nu există nici o miza financiara sau risc in a aplica - orice şcoală sau clasă pot participa, fără nici o plată la Code.org sau orice altă organizație

2) câştigătorii vor fi selectați numai între şcoli unde întreaga clasă (sau scoala) participă la o oră de programare, care implică un test de aptitudini colective elevilor şi profesorilor.

<% end %>

<%= view :signup_button %>