---
title: Contributors
nav: about_nav
---
# Contributors
We especially want to recognize the engineers from Facebook, Google, Microsoft, Twitter and many others who helped create these materials.

## Active Contributors
<%= view :about_people, people:DB[:cdo_contributors].where(kind_s:'active') %>

## Past Contributors
<%= view :about_people, people:DB[:cdo_contributors].where(kind_s:'inactive') %>

You can view a [live list of recent contributors](https://github.com/code-dot-org/code-dot-org/graphs/contributors)
on GitHub.
