---
title: Partners
nav: about_nav
---
# Founding Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'founder') %>

---

# Major Promotional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'promotional') %>

---

# Activity Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'tutorial') %>

---

# All Other Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'other') %>
