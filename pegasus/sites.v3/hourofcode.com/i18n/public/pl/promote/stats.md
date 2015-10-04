---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Notki reklamowe i przydatne statystyki

## Użyj tej krótkiej notki w biuletynach

### Wprowadź informatykę do swojej szkoły. Zacznij z Hour of Code

Komputery są wszędzie, ale obecnie mniej szkół uczy informatyki niż nawet 10 lat temu. Dobrą wiadomością jest to, że jesteśmy na drodze, aby to zmienić. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

<%= view :signup_button %>