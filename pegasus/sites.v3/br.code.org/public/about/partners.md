---
title: Parceiros da Hora do Código do Brasil
nav: about_nav
social:
  'og:title' : 'A Hora do Código do Brasil está chegando'
  'og:description' : "Para todos os alunos e salas de aula: veja como é divertido aprender programação em apenas uma hora, de 8 a 14 de dezembro."
  'og:image' : "http://br.code.org/images/ogimage.png"
  'og:image:width' : ""
  'og:image:height' : ""
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---

# Principais parceiros dos EUA e doadores corporativos

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

# Parceiros de tutorial

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>
