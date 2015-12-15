---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Kurzinfos und hilfreiche Statistiken

## Use this short blurb in newsletters

### Bring computer science to your school. Start with an Hour of Code

Computer sind überall, aber weniger Schulen unterrichten Informatik als vor 10 Jahren. Good news is, we’re on our way to change this. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infografiken

<%= view :stats_carousel %>

