---
title: Partners
nav: about_nav
theme: responsive
style_min: true
---
# Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

<HR>
<a name="regionalpartners"></a>

# Regional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'pl-partner') %>

<HR>
<a name="schooldistricts"></a>

# School District Partners

Code.org has over 100 historical partnerships with school districts around the USA. [See the full list here](/educate/partner-districts).

<HR>
<a name="infrastructure"></a>

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'infrastructure') %>

<HR>
<a name="international"></a>

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'international') %>

<HR>
<a name="activity"></a>

# Curriculum and Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>

<HR>
<a name="additional"></a>

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'additional') %>
