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

## Evaluation
Code.org’s 3rd party evaluation team is [Jeanne Century](http://outlier.uchicago.edu/outlier/team/?data-target-rollout-thumb-id=jeanne), [Heather King](http://outlier.uchicago.edu/outlier/team/?data-target-rollout-thumb-id=heather) and [Courtney Blackwell](http://cemse.uchicago.edu/staff/courtney-blackwell/) of [Outlier Research & Evaluation](http://outlier.uchicago.edu/), at [CEMSE | University of Chicago](http://cemse.uchicago.edu/).

## We're grateful for the advice and help of so many leaders over the years:

### From Tech

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'advisor') %>

### From Education

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'education') %>
