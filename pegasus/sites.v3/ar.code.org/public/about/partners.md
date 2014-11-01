---
title: Partners de La Hora del Código
nav: about_nav
social:
  'og:title' : 'La Hora del Código está al llegar'
  'og:description' : "La hora del código es un movimiento global en el que participan decenas de millones de estudiantes en más de 180 países y en más de 30 idiomas, con edades entre 4 y 104 años."
  'og:image' : "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://ar.code.org"
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---

# Apoyan a Code.org

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

# Proveedores de tutoriales

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>