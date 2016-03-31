---
title: The Hour of Code
tagline: ''
theme: responsive
responsivePadMobile: yes
social:
  'og:title' : 'Every child deserves opportunity'
  'og:description' : "For every student and classroom: learn how fun coding is in just one hour during the Hour of Code"
  'og:image' : "http://<%=request.host%>/images/code-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://tr.code.org"
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
