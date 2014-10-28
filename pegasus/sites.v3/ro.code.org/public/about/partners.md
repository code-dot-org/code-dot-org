---
title: Parteneri Hour of Code România 
nav: about_nav
social:
  'og:title' : ‘Hour of Code România se apropie'
  'og:description' : "Hour of Code este o mişcare globală care ajunge la zeci de milioane de elevi si studenţi din peste 180 de ţări şi peste 30 de limbi vorbite. Vârstele de la 4 la 104 ani."
  'og:image' : "http://ro.code.org/images/ogimage.png"
  'og:image:width' : "1200"
  'og:image:height' : "626"
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---

# Parteneri Hour of Code România 

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'ro') %>

---

## Parteneri și Donatori Corporate

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

## Parteneri Tutorial 

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>