* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Prix - conditions générales

## Amazon.com, iTunes et crédit dans le Windows Store :

Les crédits Amazon.com, iTunes et Windows Store sont limités aux professeurs du jardin d'enfants au lycée, aux éducateurs de soutien scolaire et aux d'organismes d'éducation. Le crédit de 10 $ s'ajoutent à un compte existant, et le crédit expire après 1 an. Dans la limite d'un par organisateur.

Chaque organisateur doit s'inscrire pour l'Heure de Code afin de recevoir le crédit Amazon.com, iTunes ou Windows Store. Si toute votre école participe à Une Heure du Code, chaque éducateur doit s'inscrire individuellement comme organisateur pour se qualifier.

Code.org prendra contact avec les organisateurs après les Heures de Code (7-13 décembre) pour fournir des instructions pour l'acquisition de leur crédit Amazon.com, iTunes et Windows Store.

<% if @country == 'us' %>

## Ensemble d'ordinateurs portables pour une classe (ou 10 000 $ d'achat de matériels technologies) :

Prix limité aux écoles publiques américaines. Afin de participer, votre établissement scolaire doit s'enregistrer à Une Heure de Code, avant le 16 novembre 2015. Une école, par état américain, recevra un ensemble d'ordinateurs portables. Code.org sélectionnera et contactera les gagnants par courriel vers le 1er décembre 2015.

A des fins de clarification, prenez en note qu'il ne s'agit pas d'un jeu-concours ou d'un concours impliquant le hasard ou la chance.

1) Aucun intérêt ou risque financier n'est lié à une participation - toute école ou classe peut participer, et cela sans frais lié à Code.org ou toute autre organisation

2) Les gagnants seront choisis uniquement parmi les écoles où la classe (ou l'école) qui participe entièrement à l'évènement Une Heure de Code. Ceci implique également une évaluation des compétences des élèves et des enseignants.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Vidéoconférence avec un invité:

L'attribution des prix s'avère limitée aux classes d'élémentaires et secondaires aux États-Unis et au Canada seulement. Code.org déterminera les classes gagnantes, établira une période pour la séance de clavardage et travaillera de concert avec l'enseignant afin de mettre en place les détails technologiques. Votre école, dans son ensemble, n'a pas besoin de postuler pour être admissible à ce prix. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>