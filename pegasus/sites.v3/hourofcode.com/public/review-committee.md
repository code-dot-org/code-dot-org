---
title: Hour of Code and CS Ed Week Review Committee
---
# Hour of Code and CS Ed Week Review Committee

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'hoc_review'), :columns=>3 %>

<%= view :about_people, people:DB[:cdo_team].where(kind_s:'hoc_review_short') %>
