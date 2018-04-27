---
title: Partners
nav: about_nav
---
# Founding Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'founder') %>

---

# Curriculum and Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'tutorial') %>

---

# All Other Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'other') %>
