---
title: Parteneri Hour of Code România 
nav: about_nav
social:
  'og:title' : ‘Hour of Code România se apropie'
  'og:description' : "Pentru fiecare elev și clasă din România: Află cât de distractiv este sa înveți programare în doar o oră, 8-14 Decembrie."
  'og:image' : ""
  'og:image:width' : ""
  'og:image:height' : ""
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