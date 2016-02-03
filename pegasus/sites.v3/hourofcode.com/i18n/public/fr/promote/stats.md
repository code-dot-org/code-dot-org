---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Présentation et statistiques utiles

## Utiliser ce court texte de présentation dans vos newsletters

### Demandez plus d'informatique dans votre école. Commencez avec Une Heure de Code

Les ordinateurs sont partout, mais les écoles enseignent moins l'informatique qu'il y a 10 ans. La bonne nouvelle, c'est nous sommes sur le point de changer cela. Si vous avez entendu parler de l'évènement [Une Heures de Code](<%= resolve_url('/') %>) l'année dernière, vous savez peut-être qu'il a marqué l'histoire. Dès la première édition d'Une Heure de Code, 15 millions d'étudiants ont essayé l'informatique et la programmation. L'an dernier, ce nombre a augmenté et est passé à 60 millions d'élèves ! [Une Heure de Code](<%= resolve_url('/') %>) est une introduction d'une heure à l'informatique. Elle est conçue pour démystifier le code et montrer que n'importe qui peut en apprendre les rudiments. [Inscrivez-vous](<%= resolve_url('/') %>) pour organiser Une heure de Code <%= campaign_date('full') %> au cours de la semaine de l'éducation des sciences informatiques. Pour ajoutez votre école à la carte des évènements, rendez-vous sur https://hourofcode.com/<%= @country %>

## Infographies

<%= view :stats_carousel %>

