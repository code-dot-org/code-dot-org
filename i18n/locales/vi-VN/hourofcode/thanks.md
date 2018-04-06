---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav
social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"
  "twitter:card": nguời chơi
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Cảm ơn bạn đã đăng ký để tổ chức Hour of Code!

Như một lời cảm ơn vì đã giúp thực hiện nó khả thi cho các bạn học sinh nhằm bắt đầu học về công nghệ máy tính, chúng tôi mong muốn gửi đến các bạn một bộ áp phích chuyên nghiệp miễn phí in sẵn có tính năng đa dạng mô hình cho lớp học của bạn. Sử dụng mã khuyến mãi **FREEPOSTERS** lúc thanh toán. (Lưu ý: điều này chỉ có sẵn trong khi nguồn cung cuối và bạn sẽ cần để chi trả cho phí vận chuyển. Kể từ khi những áp phích này giao từ Hoa Kỳ, phí vận chuyển có thể khá cao nếu giao đến Canada và quốc tế. Chúng tôi hiếu điều đó có thể không nằm trong ngân sách chi tiêu của bạn, và chúng tôi khuyến khích các bạn in [tệp tin PDF](https://code.org/inspire) cho lớp học của bạn.)  
<br />[Nhận Áp phích</button>](https://store.code.org/products/code-org-posters-set-of-12) Sử dụng mã khuyến mại FREEPOSTERS

<% if @country == 'us' %> Nhờ lòng hảo tâm của Ozobot, Dexter Industries, littleBits, và Wonder Workshop, hơn 100 lớp học sẽ được chọn để nhẫn rôbốt hoặc bảng mạch cho lớp của mình! Để biết điều kiện để nhận được một bộ, hãy chắc chắn đã hoàn thành các khảo sát được gửi từ Code.org sau Hour of Code. Code.org sẽ lựa chọn lớp học giành chiến thắng. Trong lúc đó, kiểm tra một vài robot và bảng mạch hoạt động. Xin chú ý rằng điều này chỉ mở cho các trường học ở Hoa Kỳ. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Spread the word in your school and community

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](%= resolve_url('/promote/resources#sample-emails') %) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Bạn không cần phải đang học ở trong trường để học những kỹ năng mới. Invite a local politician or policy maker to visit your school for the Hour of Code. Điều này có thể giúp xây dựng hỗ trợ cho khoa học máy vi tính trong khu vực của bạn hơn một giờ.

Sử dụng các [áp phích, biểu ngữ, nhãn dán, video và nhiều hơn nữa](%= resolve_url('/promote/resources') %) cho sự kiện của riêng bạn.

## 2. Tìm một người tình nguyện địa phương để giúp bạn với sự kiện của bạn.

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>