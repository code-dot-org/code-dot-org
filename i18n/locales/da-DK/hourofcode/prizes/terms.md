* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Præmier - vilkår og betingelser

## Amazon.com or Microsoft’s Windows Store credit:

The Amazon.com and Microsoft’s Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Kun een præmie per arrangør.

Every organizer must register for the Hour of Code in order to receive the Amazon.com or Microsoft’s Windows Store credit. Hvis hele skolen deltager i Hour of Code, skal hver lærer registrere sig som arrangør for at være kvalificeret til at modtage en præmie.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com and Microsoft’s Windows Store credit.

<% if @country == 'us' %>

## Et klassesæt af bærbare computere (eller for $10.000 anden teknologi):

Præmien er desværre begrænset til offentlige K-12 amerikanske skoler. To qualify, your entire school must register for the Hour of Code by November 16, 2015. En skole, fra hver af de amerikanske stater, vil modtage en klassesæt computere. Code.org will select and notify winners via email by December 1, 2015.

For lige at præcisere, så er dette ikke et lotteri eller en konkurrence, der involverer at man tager nogle chancer.

1) der er ingen finansielle indsats eller risiko forbundet med at deltage - alle skole eller klasser kan deltage, uden nogen form for betaling til Code.org eller nogen anden organisation

2) vinderne bliver kun valgt blandt skoler, hvor hele klassen (eller skolen) deltager i Hour of Code, som omfatter en test af elevernes og lærernes kollektive færdigheder.

<% end %>

<%= view :signup_button %>