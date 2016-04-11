---
title: The Hour of Code
tagline: ''
theme: responsive
responsivePadMobile: yes
social:
  'og:title' : 'Her çocuk bir fırsatı hak eder.'
  'og:description' : "Öğrenciler ve Sınıflar; Kod Saatine sadece bir saatinizi ayırarak programlamanın ne kadar eğlenceli olduğunu keşfedin"
  'og:image' : "http://<%=request.host%>/images/code-video-thumbnail.jpg"
  "og:image:width": 1705
  "og:image:height": 949
  "og:url": "http://tr.code.org"
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---

# Ana Ortaklarımız

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

---

# Ders Ortaklarımız

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>
