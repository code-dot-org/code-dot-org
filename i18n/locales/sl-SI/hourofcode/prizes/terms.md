* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Nagrade - pogoji

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Omejitev je ena nagrada na organizatorja.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. V kolikor celotna šola sodeluje v Uri za kodo, se mora vsak učitelj registrirati posebej kot organizator, da se lahko kvalificira.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Prenosniki za cel razred (ali $10.000 za drugo tehnologijo):

Ta nagrada je omejena na osnovne šole v ZDA. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Ena šola v vsaki zvezni državi ZDA bo dobila prenosnike za en cel razred. Code.org will select and notify winners via email by December 1, 2015.

Za pojasnitev, to ni nagradna igra ali tekmovanje, ki bi bilo v celoti naključno.

1) Ni finančnih vložkov ali tveganj vezanih na prijavo - vsaka šola ali razred lahko sodeluje ne da bi bilo potrebno plačilo Code.org ali kateri drugi organizaciji

2) Zmagovalci bodo izbrani samo med šolami katerih celotni razredi (ali šola) sodelujejo v Uri za kodo, kar vključuje preverjanje skupnih sposobnosti učencev in učiteljev.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Klepet preko videa z gostujočim govorcem:

Ta nagrada je omejena na osnovne šole v ZDA in Kanadi. Code.org bo izbrala zmagovalne razrede, priskrbela čas za spletni klepet in sodelovala z ustreznim učiteljem za ureditev tehnoloških podrobnosti. Ni potrebno, da se vaša šola prijavi, da se lahko kvalificirate za to nagrado. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>