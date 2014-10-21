---
title: Partners de La Hora del Código
nav: about_nav
social:
  'og:title' : 'La Hora del Código está llegando'
  'og:description' : "Enterate, en sólo una hora, lo divertido que es programar computadoras." 
  'og:image' : ""
  'og:image:width' : ""
  'og:image:height' : ""
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