---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Kêu gọi cộng đồng của bạn tham gia vào Giờ Lập Trình

## 1. Truyền tải thông điệp

Giới thiệu cho bạn bè của bạn về **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Đề nghị trường của bạn tổ chức một Giờ Lập Trình

[Gửi email này](%= resolve_url('/promote/resources#sample-emails') %) cho hiệu trưởng của bạn và thách thức mỗi lớp học tại trường học của bạn để đăng ký.

## 3. Mời người chủ của bạn tham gia

[Gửi email này](%= resolve_url('/promote/resources#sample-emails') %) đến quản lý của bạn hoặc CEO của công ty.

## 4. Quảng bá Giờ Lập Trình trong cộng đồng của bạn

[Tuyển dụng một nhóm địa phương](%= resolve_url('/promote/resources#sample-emails') %) — câu lạc bộ hướng đạo, nhà thờ, trường đại học, nhóm cựu chiến binh, Liên đoàn lao động, hoặc thậm chí vài người bạn. Bạn không cần phải đang học ở trong trường để học những kỹ năng mới. Sử dụng các [áp phích, biểu ngữ, nhãn dán, video và nhiều hơn nữa](%= resolve_url('/promote/resources') %) cho sự kiện của riêng bạn.

## 5. Xin phép chính quyền đìa phương để xác nhận hỗ trợ cho Giờ Lập Trình

[Gửi email này](%= resolve_url('/promote/resources#sample-emails') %) đến đại diện địa phương, hội đồng thành phố hay hội đồng nhà trường và mời họ đến thăm trường học của bạn về Giờ Lập Trình. Điều này có thể giúp xây dựng hỗ trợ cho khoa học máy vi tính trong khu vực của bạn hơn một giờ.

<%= view :signup_button %>