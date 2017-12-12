---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav
social:
  "og:title": <%= hoc_s(:meta_tag_og_title) %>
  "og:description": <%= hoc_s(:meta_tag_og_description) %>
  "og:image": http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": http://<%=request.host%>
  "twitter:card": player
  "twitter:site": '@codeorg'
  "twitter:url": http://<%=request.host%>
  "twitter:title": <%= hoc_s(:meta_tag_twitter_title) %>
  "twitter:description": <%= hoc_s(:meta_tag_twitter_description) %>
  "twitter:image:src": http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# អរគុណសំរាប់ការចុះឈ្មេាះក្នុងការធ្វើជាម្ចាស់ផ្ទះ ម៉ោងសំរាប់កូដ

ជាការអរគុណសំរាប់​ជំនួយរបស់​អ្នក​ ដែល​ធ្វើ​អោយ​សិស្សានុសិស្សអាច​ចាំផ្ដើម​រៀន​វិទ្យាសាស្រ្ត​កុំព្យូទ័រ ពួក​យើង​មាន​សេចក្ដី​សោមន្សរីករាយ​នឹង​ប្រគល់​ជូន​លោក​អ្នក​នៅបដា​មួយដែល​បង្ហាញពីគំរូរម៉ូដែល​ចំរុះ សំរាប់ថ្នាក់​រៀន​របស់​អ្នក ប្រើកូដដែល​ផ្លល់អោយ​នេះ **FREEPOSTERS** ពេល​ចាក​ចេញ. ចំណាំ: វាអាចប្រើបាននៅពេលដែលការផ្គត់ផ្គង់ចុងក្រោយហើយអ្នកនឹងត្រូវការចំណាយលើការដឹកជញ្ជូន Since these posters ship from the United States, shipping costs can be quite high if shipping to Canada and internationally. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org will select the winning classrooms. In the meantime, check out some of the robotics and circuits activities. Please note that this is only open for US schools. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. ផ្សព្វផ្សាយពាក្យនៅក្នុងសាលារៀននិងសហគមន៍របស់អ្នក

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](%= resolve_url('/promote/resources#sample-emails') %) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Invite a local politician or policy maker to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 2. ស្វែងរកអ្នកស្ម័គ្រចិត្ដក្នុងតំបន់ដើម្បីជួយអ្នកជាមួយនឹងព្រឹត្តិការណ៍របស់អ្នក។

[Search our volunteer map](%= resolve_url('https://code.org/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. រៀបចំម៉ោងម៉ោងរបស់អ្នក

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# ទៅហួសម៉ោង​កូដ

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>