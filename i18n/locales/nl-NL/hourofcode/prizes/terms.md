* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Prijzen - voorwaarden

## Amazon.com, iTunes en Windows Store krediet:

De Amazon.com, iTunes en Windows Store krediet zijn beperkt tot K-12 faculteit, opvoeders voor afterschool clubs en organisaties van onderwijs. Het krediet van $10 moet worden toegevoegd aan een bestaande account, en het krediet verloopt na 1 jaar. Beperkt tot één prijs per organisator.

Elke organisator moet registreren voor het CodeUur om de Amazon.com, iTunes of Windows Store krediet te ontvangen. Wanneer je hele school meedoet met het Uur Code, moet iedere onderwijzer individueel registeren als organisator om aanspraak te maken.

Code.org zal contact opnemen met organisatoren na het CodeUur (7-13 Dec.) voor de instructies van het inruilen van Amazon.com, iTunes en Windows Store kredieten.

<% if @country == 'us' %>

## Laptops voor de hele klas (of $10.000 voor andere technologie):

Alleen voor scholen in het basis- en middelbaar onderwijs. Om in aanmerking te komen moet uw hele school registreren voor het CodeUur in 16 November 2015. Een school in iedere Amerikaanse staat krijgt computers voor een heel klaslokaal. Code.org selecteert winnaars en bericht ze via de mail voor 1 december 2015.

Voor de duidelijkheid: dit is niet een trekking of een wedstrijd gebaseerd op puur toeval.

1) er is geen financiële inzet of risico bij inschrijving van toepassing, iedere school of klas kan deelnemen, zonder enige betaling te Code.org of een andere organisatie

2) winnaars zullen alleen worden geselecteerd onder scholen waar de hele klas (of school) deelneemt aan een uur van Code, waarbij een test plaats vindt van de studenten en docenten over hun collectieve vaardigheden.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video-chat met een gastspreker:

Prijs beperkt tot K-12 klaslokalen in de VS en Canada alleen. Code.org zal winnende scholen willekeurig selecteren, een timeslot kiezen voor de webchat, en samenwerken met de betreffende leraar om de technische details op te zetten. Niet uw hele school hoeft zich aan te melden om in aanmerking te komen voor deze prijs. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>