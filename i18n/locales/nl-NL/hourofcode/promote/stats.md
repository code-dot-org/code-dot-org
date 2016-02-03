* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# Flapteksten en nuttige Stats

## Gebruik deze korte beschrijving in nieuwsbrieven

### Breng informatica naar je school. Start met een Uur Code

Computers zijn overal, maar minder scholen doceren informatica dan 10 jaar geleden. Het goede nieuws is, we zijn op weg om dit te veranderen. Als u vorig jaar over [het CodeUur](%= resolve_url('/') %) heeft gehoord, weet u misschien dat het geschiedenis heeft geschreven. In het eerste CodeUUr hebben 15 miljoen leerlingen geprobeerd te programmeren. Vorig jaar is dat aantal gestegen tot 60 miljoen leerlingen! Het [CodeUur](%= resolve_url('/') %) is een één uur durende introductie tot informatica, om aan te tonen dat programmeren niet zo moeilijk is en iedereen de basis kan aanleren. [Meld u aan](%= resolve_url('/') %) om te hosten van een CodeUur < % = campaign_date('full') %> tijdens de week van programmeren. Om uw school aan de kaart toe te voegen, ga naar https://hourofcode.com/<%= @country %>

## Afbeeldingen die informatie uitbeelden en verklaren

<%= view :stats_carousel %>

<%= view :signup_button %>