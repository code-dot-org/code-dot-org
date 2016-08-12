---
title: Hour of Code Advisory Board
nav: about_nav
---
# Hour of Code Advisory Board

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'hoc_advisor'), :columns=>3 %>

<%= view :about_people, people:DB[:cdo_team].where(kind_s:'hoc_advisor_short') %>
