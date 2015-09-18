---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Njoftime dhe Statistika të domosdoshme

## Përdorni këtë njoftim të shkurtër në gazetë

### Sill shkencat kompjuterike në shkollën tuaj. Filloni me Orën e Kodimit

Kompjuterët janë kudo, por më pak shkolla e mësojnë shkencën kompjuterike tani se sa para 10 vitesh. Lajmi i mirë është se jemi në rrugë a sipër për ta ndryshuar këtë. If you heard about the [Hour of Code](%= resolve_url('/') %) last year, you might know it made history. Në Orën e parë të Kodimit, 15 milion nxënës provuan shkencën kompjuterike. Vitin e fundit, ky numër u rrit në 60 milion nxënës! The [Hour of Code](%= resolve_url('/') %) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](%= resolve_url('/') %) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. Për të shtuar shkollën tuaj në hartë, shko te https://hourofcode.com/<%= @country %>

## Grafikë Informues

<%= view :stats_carousel %>

<%= view :signup_button %>