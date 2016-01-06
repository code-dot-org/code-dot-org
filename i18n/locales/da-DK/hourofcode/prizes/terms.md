* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Præmier - vilkår og betingelser

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Kun een præmie per arrangør.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Hvis hele skolen deltager i Hour of Code, skal hver lærer registrere sig som arrangør for at være kvalificeret til at modtage en præmie.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Et klassesæt af bærbare computere (eller for $10.000 anden teknologi):

Præmien er desværre begrænset til offentlige K-12 amerikanske skoler. For at blive kvalificeret, skal hele din skole tilmeldes Hour of Code inden d. 16. November 2015. En skole, fra hver af de amerikanske stater, vil modtage en klassesæt computere. Code.org vil udvælge og underrette vinderne via e-mail d. 1. december 2015.

For lige at præcisere, så er dette ikke et lotteri eller en konkurrence, der involverer at man tager nogle chancer.

1) der er ingen finansiel ydelse eller risiko forbundet med at deltage - alle skole eller klasser kan deltage, uden nogen form for betaling til Code.org eller andre organisationer

2) Vinderne bliver kun valgt blandt skoler, hvor hele klassen (eller skolen) deltager i Hour of Code, som omfatter en test af elevernes og lærernes kollektive færdigheder.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video-chat med en gæste-taler:

Denne præmie er begrænset til klasser i USA og Canada (K-12). Code.org vil vælge de vindende klasser, og give et tidspunkt til web-chat og aftale med lærerne om de tekniske detaljer. Hele din skole behøver ikke at ansøge om at kvalificere sig til denne præmie. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>