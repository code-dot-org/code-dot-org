---
title: Partners
nav: about_nav
---
# Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

<HR>

# Major promotional partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'promotional') %>

<HR>

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'international') %>

<HR>

# Tutorial partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>

<HR>

# Infrastructure partners and tools

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'infrastructure') %>

<HR>

# Additional partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'additional') %>

