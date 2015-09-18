---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

# 宣伝と役に立つ統計データ

## ニュースレター用に以下の宣伝文句をご利用ください

### あなたの学校にもコンピューターサイエンスを導入しましょう。Hour of Codeで始めましょう。

コンピューターはありふれていますが、コンピューター科学を教える学校は10年前より少なくなっています。 良いお知らせは、私たちはこれを変えようとしているということです。 If you heard about the [Hour of Code](<%= resolve_url('/') %>) last year, you might know it made history. In the first Hour of Code, 15 million students tried computer science. Last year, that number increased to 60 million students! The [Hour of Code](<%= resolve_url('/') %>) is a one-hour introduction to computer science, designed to demystify code and show that anybody can learn the basics. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infographics

<%= view :stats_carousel %>

<%= view :signup_button %>