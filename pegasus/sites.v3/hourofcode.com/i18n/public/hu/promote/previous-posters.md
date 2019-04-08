---
title: <%= hoc_s(:title_past_posters).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

# Régebbi "Hour of Code" poszterek

### Keress egy előző évi posztert, melyet kinyomtatva kitehetsz az osztályterembe! Újabb posztereket keresel? [Kattints ide!](<%= resolve_url('/promote/resources#posters') %>)

---

<br />

<%= view :promote_posters %>

<%= view :signup_button %>