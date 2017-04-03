---
title: Code.org Diversity Advisory Council
theme: responsive
---
# Code.org Diversity Advisory Council

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'diversity_council'), :columns=>3 %>

<%= view :about_people, people:DB[:cdo_team].where(kind_s:'diversity_council_short'), :columns=>3 %>
