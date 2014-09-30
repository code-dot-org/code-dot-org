---
title: Partners of the EU Hour of Code
nav: about_nav
social:
  'og:title' : 'The EU Hour of Code is coming'
  'og:description' : "For every student: learn how fun coding is in just one hour, October 11-17."
  'og:image' : ""
  'og:image:width' : ""
  'og:image:height' : ""
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---
# Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'eu') %>