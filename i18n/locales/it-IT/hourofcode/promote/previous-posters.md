---
title: <%= hoc_s(:title_past_posters).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

# Ultima Ora del Codice

### Trova i nostri poster degli anni precedenti da stampare e da portare nella tua classe! Cerchi i poster più recenti? [Clicca qui](<%= resolve_url('/promote/resources#posters') %>).

* * *

<br />

<%= view :promote_posters %>

<%= view :signup_button %>