---
title: Full Team
nav: about_nav
---
# Our Facilitators
Our expert facilitators and professional learning partners are an extension of the Code.org team. This amazing team of experts are responsible for preparing the computer science teachers of tomorrow.

<img src="/images/AllFacilitators.jpg" width="100%;" >


# Our Team

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'team'), :columns=>3 %>

<a id="extended"></a>
## Extended Team
<%= view :about_people, people:DB[:cdo_team].where(kind_s:'extended_active') %>

### Thank you to our extended team of [Engineer Contributors](https://code.org/about/contributors) and [Lead Translators](https://code.org/translators)!

## Special Thanks to
<%= view :about_people, people:DB[:cdo_team].where(kind_s:'extended_inactive') %>


