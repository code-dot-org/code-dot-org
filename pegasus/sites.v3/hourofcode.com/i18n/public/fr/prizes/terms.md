---

title: <%= hoc_s(:title_prizes_terms) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Prix - conditions générales

## Amazon.com or Microsoft’s Windows Store credit:

The Amazon.com and Microsoft’s Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Dans la limite d'un par organisateur.

Every organizer must register for the Hour of Code in order to receive the Amazon.com or Microsoft’s Windows Store credit. Si votre toute votre école participe à une Heure du Code, chaque éducateur doit s'inscrire individuellement à titre d'organisateur pour se qualifier.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com and Microsoft’s Windows Store credit.

<% if @country == 'us' %>

## Ensemble d'ordinateurs portables pour une classe (ou 10 000$ pour d'autres technologies):

Prix limité aux écoles publiques américaines. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Une école par états américains recevra un ensemble d'ordinateurs portables. Code.org sélectionnera et contactera les gagnants par courriel jusqu'au 1er décembre 2014.

Aux fins de clarification, prenez note qu'il ne s'agit pas d'un jeu-concours ou d'un concours impliquant la chance pure.

1) Aucun intérêt ou risque financier n'est lié à une participation - toute école ou classe peut participer, et cela sans frais redevable à Code.org ou toute autre organisation

2) Les gagnants seront choisis uniquement parmi les écoles où la classe (ou l'école) participe entièrement à l'événement Une Heure de Code. Ceci implique également une évaluation des compétences des élèves et des enseignants.

<% end %>

<%= view :signup_button %>