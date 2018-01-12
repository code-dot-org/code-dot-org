---
title: Partners
nav: about_nav
theme: responsive
style_min: true
---
# Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

<HR>

# Regional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'pl-partner') %>

<HR>

# School District Partners

Code.org has over 100 historical partnerships with school districts around the USA. [See the full list here](/educate/partner-districts).

<HR>

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'infrastructure') %>

<HR>

# Major Promotional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'promotional') %>

<HR>

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'international') %>

<HR>

# Activity Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>

<HR>

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'additional') %>
