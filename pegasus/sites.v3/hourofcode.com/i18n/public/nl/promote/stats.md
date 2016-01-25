---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Flapteksten en nuttige Stats

## Gebruik deze korte beschrijving in nieuwsbrieven

### Breng informatica naar je school. Start met een Uur Code

Computers zijn overal, maar minder scholen doceren informatica dan 10 jaar geleden. Het goede nieuws is, we zijn op weg om dit te veranderen. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

