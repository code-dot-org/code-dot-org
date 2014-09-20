---
title: Italia ore di Codice Partners
nav: about_nav
social:
  'og:title' : 'Il Italia Ora del codice è in arrivo'
  'og:description' : "Per ogni studente e classe: imparare come divertimento di codifica è in una sola ora"
  'og:image' : ""
  'og:image:width' : ""
  'og:image:height' : ""
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---

# Maggiore ci Partners e donatori aziendali

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

# Partner Tutorial

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>