---
title: Leadership
nav: about_nav
---
# Leadership

## Board of Directors

<%= view :about_headshots, people:DB[:cdo_leaders].where(kind_s:'director'), columns:3 %>

<!-- ## Leadership Team

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'LT'), columns:3 %> -->

## Advisory Board

<%= view :about_people, people:DB[:cdo_leaders].where(kind_s:'advisor') %>

## Evaluation
Code.org’s 3rd party evaluation team is [Jeanne Century](http://outlier.uchicago.edu/outlier/team/?data-target-rollout-thumb-id=jeanne), [Heather King](http://outlier.uchicago.edu/outlier/team/?data-target-rollout-thumb-id=heather) and [Courtney Blackwell](http://cemse.uchicago.edu/staff/courtney-blackwell/) of [Outlier Research & Evaluation](http://outlier.uchicago.edu/), at [CEMSE | University of Chicago](http://cemse.uchicago.edu/).


## Education Advisory Council
Our Education Advisory Council is a group of educators with decades of experience in teaching Computer Science, across all grade levels - elementary, secondary, or at the university level.

<%= view :about_advisors, people:DB[:cdo_leaders].where(kind_s:'education') %>