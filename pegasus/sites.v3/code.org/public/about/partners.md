---
title: Partners
nav: about_nav
---
# Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

<HR>

# Professional Learning Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'pl-partner') %>

<HR>

# School district partners

Code.org has over 100 partnerships with school districts around the USA. [See the full list here](/educate/partner-districts).

<HR>

# Infrastructure partners and tools

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'infrastructure') %>

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

# Additional partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'additional') %>

