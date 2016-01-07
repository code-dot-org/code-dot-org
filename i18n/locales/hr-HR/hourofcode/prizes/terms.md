* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Nagrade - pravila i uvjeti

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Ograničavamo jednu ponudu za jednog organizatora.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Ukoliko cijela škola sudjeluje u Satu Kodiranja, svaki edukator mora se osobno registrirati kao organizator kako bi se kvalificirao za nagrade.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Komplet računala za razred (ili tehnologija u vrijednosti 10 tisuća dolara):

Nagrada je ograničena na javne K-12 škole u SAD-u. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Jedna škola u svakoj saveznoj državi SAD-a primit će komplet računala za razred. Code.org will select and notify winners via email by December 1, 2015.

Da pojasnimo, ovo nije nagrdna igra niti takmičenje gdje vam treba puka sreća.

1) Nemate nikakavih financijskih rizika koji bi proizašli iz vaše prijave - bilo koja škola ili razred može sudjelovati, bez ikakvog plaćanja ka Code.org ili bilo kojoj drugoj organizaciji

2) Pobjednici će biti odabrani samo između onih škola u kojima cijeli razred (ili cijela škola) sudjeluje u Satu Kodiranja, što uključuje kolektivni test sposobnosti učenika i učitelja.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video zapis sa gostujućim govornikom:

Ova nagrada je ograničena samo na osnovne škole u SAD-u i Kanadi. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>