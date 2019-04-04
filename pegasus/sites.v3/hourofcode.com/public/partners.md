---
title: <%= hoc_s(:title_partners).inspect %>
---

The Hour of Code is driven by the Hour of Code and Computer Science Education Week Advisory and Review Committees.

The [Advisory Committee](<%= resolve_url('/advisory-committee') %>) is composed of representatives from K-12, academia, nonprofits, for-profits, and international organizations. This committee guides the strategy for the Hour of Code campaign.

The [Review Committee](<%= resolve_url('/review-committee') %>) is composed of 15 educators across K-12 grade bands that assess and recommend activities using the Advisory Committee's rubric. These educators review student-led activities and teacher-led lesson plans submitted by hundreds of activity partners, evaluating the activities' educational value, ability to engage learners, and potential appeal to diverse sets of students.

Both committees' work and dedication have contributed to the success of the Hour of Code and its vision of offering an introduction to computer science for every student.

#  Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

<HR>

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

<HR>

# Curriculum and Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

<HR>

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

<HR>

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>
