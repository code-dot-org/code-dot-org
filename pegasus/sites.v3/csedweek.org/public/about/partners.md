---
title: Partners
nav: about_nav
---
# Founding partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'founder') %>

---

# Major promotional partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'promotional') %>

---

# Tutorial partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'tutorial') %>

---

# All other partners

<%= view :about_logos, logos:DB[:cdo_partners].where(csedweek_b:true).and(kind_s:'other') %>
