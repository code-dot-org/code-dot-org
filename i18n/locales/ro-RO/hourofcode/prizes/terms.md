* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premii - termeni și condiții

## Amazon.com or Microsoft’s Windows Store credit:

The Amazon.com and Microsoft’s Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Limita este de un premiu pe organizator.

Every organizer must register for the Hour of Code in order to receive the Amazon.com or Microsoft’s Windows Store credit. În cazul în care întreaga şcoală participă la Hour of Code, pentru a se califica, fiecare profesor trebuie să înregistreze individual ca organizator.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com and Microsoft’s Windows Store credit.

<% if @country == 'us' %>

## Laptopuri pentru întreaga clasă (sau 10.000 USD pentru alte tehnologii):

Premiul limitat numai pentru şcoli publice K-12 SUA. To qualify, your entire school must register for the Hour of Code by November 16, 2015. O şcoală în fiecare stat al SUA va primi un set de calculatoare pentru clasă. Code.org will select and notify winners via email by December 1, 2015.

Pentru a clarifica, acest lucru nu este un concurs care implică noroc.

1) nu există nici o miza financiara sau risc in a aplica - orice şcoală sau clasă pot participa, fără nici o plată la Code.org sau orice altă organizație

2) câştigătorii vor fi selectați numai între şcoli unde întreaga clasă (sau scoala) participă la o oră de programare, care implică un test de aptitudini colective elevilor şi profesorilor.

<% end %>

<%= view :signup_button %>