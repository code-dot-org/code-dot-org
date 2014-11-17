---
title: About the Albanian Hour of Code
nav: about_nav
social:
  'og:title' : 'The Albanian Hour of Code is coming'
  'og:description' : "For every Albanian student and classroom: learn how fun coding is in just one hour December 8-14."
  'og:image' : ""
  'og:image:width' : ""
  'og:image:height' : ""
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---
# Major Partners 

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

# Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>
