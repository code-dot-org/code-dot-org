---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Presentasjon og nyttig statistikk

## Bruk denne korte teksten i nyhetsbrevet.

### Ta informatikk til skolen din. Start med kodetimen. 

Datamaskiner er overalt, men færre skoler underviser i informatikk nå enn for 10 år siden. De gode nyhetene er at vi jobber for å endre dette. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

<%= view :signup_button %>