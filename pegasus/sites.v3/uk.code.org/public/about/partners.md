---
title: UK Hour of Code Partners
nav: about_nav
social:
  'og:title' : 'The UK Hour of Code is coming'
  'og:description' : "For every UK student and classroom: learn how fun coding is in just one hour December 8 - 14."
  'og:image' : "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://uk.code.org"
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
