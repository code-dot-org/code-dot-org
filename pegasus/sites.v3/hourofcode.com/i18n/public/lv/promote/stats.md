---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Atslēgfrāzes un nodarīga statistika

## Izmanto šo īso atslēgfrāzi biļetienē

### Iepazīstini savu skolu ar datorzinātni, sāc ar Programmēšanas Stundu

Datori ir visur, bet daudz mazāk skolas māca datorzinātni nekā pirms desmit gadiem. Labās ziņas ir tādas, ka mēs esam gatavi to mainīt. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

