---
title: Full Team
nav: about_nav
---
# Full Team

<img src="/images/fit-970/2016-team-photo.jpg" width="630px;" style="margin-left: 15px;">

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'team'), :columns=>3 %>

<a id="extended"></a>
## Extended Team
<%= view :about_people, people:DB[:cdo_team].where(kind_s:'extended_active') %>

### Thank you to our extended team of [Engineer Contributors](https://code.org/about/contributors) and [Lead Translators](https://code.org/translators)!

## Special Thanks to
<%= view :about_people, people:DB[:cdo_team].where(kind_s:'extended_inactive') %>


