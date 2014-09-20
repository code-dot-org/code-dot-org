---
title: Leadership
nav: about_nav
---
# Leadership

## Board of Directors

<%= view :about_headshots, people:DB[:cdo_leaders].where(kind_s:'director'), columns:3 %>

## Advisory Board

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'advisor') %>

### Advisory Board Liaisons

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'liason') %>
