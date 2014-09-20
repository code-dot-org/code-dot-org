---
title: Education Advisors
nav: about_nav
---
# Education Advisory Council
Our Education Advisory Council is a group of educators with decades of experience in teaching Computer Science, across all grade levels - elementary, secondary, or at the university level.

<%= view :about_advisors, people:DB[:cdo_leaders].where(kind_s:'education') %>
