---
title: Parceiros da Hora do Código do Brasil
nav: about_nav
social:
  'og:title' : 'A Hora do Código do Brasil está chegando'
  'og:description' : "A Hora do Código é um movimento global que atinge dezenas de milhões de estudantes em mais de 180 países e mais de 30 idiomas. Podem participar pessoas com idades entre 4 e 104 anos."
  'og:image' : "http://br.code.org/images/ogimage.png"
  'og:image:width' : "1200"
  'og:image:height' : "626"
  "og:url": "http://br.code.org"
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
