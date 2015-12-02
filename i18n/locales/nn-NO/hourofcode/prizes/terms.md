* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premiar og vilkår

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Det er berre ein premie til kvar.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Hvis heile skulen er med på Kodetimen, må kvar instruktør registrere seg som arrangør for å kvalifisere.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Klasse-sett av bærbare datamaskiner (eller $10,000 til annet teknisk utstyr):

Premien kan kun tildeles videregående skoler i USA. To qualify, your entire school must register for the Hour of Code by November 16, 2015. En skole i hver stat i USA vil motta et klasse-sett med datamaskiner. Code.org will select and notify winners via email by December 1, 2015.

For å avklare, dette er ikke et lotteri eller en konkurranse basert på tilfeldigheter.

1) Det er ingen finansielle risikoer involvert i å søke - hvilken som helst skole eller klasserom kan delta, uten å betale Code.org eller noe andre organisasjoner

2) Vinnere vil bare bli valgt blant skoler der hele klasser (eller skoler) deltar i en Kodetime, som involverer en test av studentenes og lærerenes samlede egenskaper.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video-samtale med en foredragholder:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>