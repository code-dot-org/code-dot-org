---
title: XX Hour of Code Partners
nav: about_nav
social:
  'og:title' : 'The %{XX} Hour of Code is coming'
  'og:description' : "For every student and classroom: learn how fun coding is in just one hour March 3 - 9."
  'og:image' : ""
  'og:image:width' : ""
  'og:image:height' : ""
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---
# %{XX} Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'uk') %>

---

# Major US Partners and Corporate Donors

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'majoruk') %>

---

# Tutorial partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>
