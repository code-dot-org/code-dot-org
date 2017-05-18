---
title: Leadership
nav: about_nav
theme: responsive
---

# Leadership

## Board of Directors

<%= view :about_headshots, people:DB[:cdo_leaders].where(kind_s:'director') %>

## Leadership Team

<%= view :about_headshots, people:DB[:cdo_leaders].where(kind_s:'LT') %>

## We're grateful for the advice and help of so many leaders over the years:

### From Tech

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'advisor') %>

### From Education

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'education') %>
