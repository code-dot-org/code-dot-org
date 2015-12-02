* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premii - termeni și condiții

## Credit pe Amazon.com, iTunes si Windows Store:

Creditele Amazon.com, iTunes si Windows Store sunt limitate la scoala primara si gimnaziala, liceee si cluburi after-school, precum si organizatii educationale. Creditul de 10 dolari trebuie adaugat unui cont deja existent, acesta expirand dupa 1 an. Limita este de un premiu pe organizator.

Fiecare organizator trebuie sa se inscrie la Hour of Code pentru a putea primi credit de pe Amazon.com, iTunes sau Windows Store. În cazul în care întreaga şcoală participă la Hour of Code, pentru a se califica, fiecare profesor trebuie să se înregistreze individual ca organizator.

Code.org va contacta organizatorii dupa Hour of Code (7-13 decembrie) pentru a le oferi instructiuni in ceea ce priveste posesia creditului Amazon.com, iTunes si Windows Store.

<% if @country == 'us' %>

## Laptopuri pentru întreaga clasă (sau 10.000 Usd pentru alte tehnologii):

Premiul limitat numai pentru şcoli publice din Sua. Pentru a te califica, intreaga scoala trebuie sa fie inregistrata pentru evenimentul Hour of Code pana pe 16 noiembrie 2015. O şcoală din fiecare stat al Sua va primi un set de calculatoare pentru clasă. Code.org va selecta si anunta castigatorii prin e-mail pana pe 1 decembrie 2015.

Pentru a clarifica, acest lucru nu este un concurs care implică noroc.

1) nu există nici o miza financiara sau risc in a aplica - orice şcoală sau clasă pot participa, fără nici o plată la Code.org sau orice altă organizație

2) câştigătorii vor fi selectați numai între şcoli unde întreaga clasă (sau scoala) participă la o oră de programare, care implică un test de aptitudini colective elevilor şi profesorilor.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Conferinta video cu un vorbitor invitat:

Premiul se limitează la K-12 săli de clasă în SUA şi Canada numai. Code.org va selecta şcolile câştigătoare, oferind un slot de timp pentru conferinta online şi va lucra cu profesorul pentru a pune la punct detaliile legate de tehnologie. Întreaga şcoală nu trebuie să aplice pentru a se califica pentru acest premiu. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>