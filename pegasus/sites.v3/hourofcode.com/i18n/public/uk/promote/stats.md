---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Цікава статистика

## Використайте ці дані для своїх матеріалів

### Залучіть інформатику до своєї школи. Розпочніть Годиною коду

Комп'ютери поширені повсюдно, але все менше шкіл викладають інформатику, аніж 10 років тому. Хорошою новиною є те, що ми можемо це змінити. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Минулого року число студентів зросло до 60 мільйонів! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. Щоб додати вашу школу на мапу, перейдіть на https://hourofcode.com/<%= @country %>

## Інфографіки

<%= view :stats_carousel %>

<%= view :signup_button %>