---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# Lời giới thiệu và các thống kê hữu ích

## Sử dụng đoạn giới thiệu ngắn trong bản tin

### Mang khoa học máy tính cho trường học của bạn. Bắt đầu với một giờ lập trình.

Máy tính ở khắp mọi nơi, nhưng 10 năm trở lại trước chỉ một số ít các trường học dạy về khoa học máy tính. Tin tốt là chúng tôi đang trên đường thay đổi điều đó. If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

<%= view :signup_button %>