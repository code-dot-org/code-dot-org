---
title: <%= hoc_s(:title_past_posters).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

# Eelmised KoodiTund plakatid

### Kasuta meie eelmiste aastate plakateid ning kaunista nendega oma klassiruum! Otsid uusi plakateid? [Kliki siia](<%= resolve_url('/promote/resources#posters') %>).

---

<br />

<%= view :promote_posters %>

<%= view :signup_button %>