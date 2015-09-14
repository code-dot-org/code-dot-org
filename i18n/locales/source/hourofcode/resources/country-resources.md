---
title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: resources_nav
---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos

<iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe><p><a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)</strong></a>

<% elsif @country ==  'uk' %>

# Additional Resources

## Use this handout to recruit corporations
<a href="<%= localized_file('/files/corporations.pdf') %>"><img width="500" height="300" src="<%= localized_file('/images/corporations.png') %>"></a>

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>
