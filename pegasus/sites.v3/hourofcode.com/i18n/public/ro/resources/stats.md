---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Rezumate si statistici utile

## Folosiți acest scurt rezumat în buletinel de știri

### Aduceți informatica în școala dvs. Începeți cu Ora de Programare/Ora de Cod

Computerele sunt peste tot, dar predau informatica mai puţine şcoli decât acum 10 ani. Vestea bună e că suntem pe cale să schimbăm acest lucru. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

<%= view :signup_button %>