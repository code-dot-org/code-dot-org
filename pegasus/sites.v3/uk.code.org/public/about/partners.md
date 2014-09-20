---
title: UK Hour of Code Partners
nav: about_nav
social:
  'og:title' : 'The UK Hour of Code is coming'
  'og:description' : "For every UK student and classroom: learn how fun coding is in just one hour March 3 - 9."
  'og:image' : "http://uk.code.org/images/ogimage.png"
  'og:image:width' : '1200'
  'og:image:height' : '630'
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---
# UK Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'uk') %>

---

# Major US Partners and Corporate Donors

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'majoruk') %>

---

# Tutorial partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>
