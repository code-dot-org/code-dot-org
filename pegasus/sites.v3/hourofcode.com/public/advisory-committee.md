---
title: <%= hoc_s(:title_hoc_advisory_committee).inspect %>
---
# Hour of Code and CSEdWeek Advisory Committee

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'hoc_advisor') %>

<%= view :about_people, people:DB[:cdo_team].where(kind_s:'hoc_advisor_short') %>
