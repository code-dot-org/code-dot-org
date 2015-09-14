---
title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav
---

<%= view :signup_button %>

# Blurbs and Useful Stats

## Use this short blurb in newsletters
### Bring computer science to your school. Start with an Hour of Code 
Computers are everywhere, but fewer schools teach computer science than 10 years ago. Good news is, we’re on our way to change this. If you heard about the <a href="<%= resolve_url('/') %>">Hour of Code</a> last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The <a href="<%= resolve_url('/') %>">Hour of Code</a> is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. <a href="<%= resolve_url('/') %>">Sign up</a> to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>


## Infographics

<%= view :stats_carousel %>

<%= view :signup_button %>