---
title: Code.org Diversity Advisory Council
theme: responsive
nav: about_nav
---
# Code.org Diversity Advisory Council

<%= view :about_headshots, people:DB[:cdo_team].where(kind_s:'diversity_council') %>

<%= view :about_people, people:DB[:cdo_team].where(kind_s:'diversity_council_short') %>
