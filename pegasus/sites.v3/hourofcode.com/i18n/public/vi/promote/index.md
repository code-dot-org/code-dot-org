---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Get your community involved in the Hour of Code

## 1. Truyền tải thông điệp

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Đề nghị trường của bạn tổ chức Hour of Code

[Gửi email này](<%= resolve_url('/promote/resources#sample-emails') %>) cho hiệu trưởng của bạn và thách thức mỗi lớp học tại trường học của bạn để đăng ký.

## 3. Xin phép người tổ chức của bạn để tham gia

[Gửi email này](<%= resolve_url('/promote/resources#sample-emails') %>) đến quản lý của bạn hoặc CEO của công ty.

## 4. Quảng bá Hour of Code trong cộng đồng của bạn

[Tuyển dụng một nhóm địa phương](<%= resolve_url('/promote/resources#sample-emails') %>) — hướng đạo câu lạc bộ, nhà thờ, trường đại học, cựu chiến binh nhóm, Liên đoàn lao động, hoặc thậm chí một số người bạn. Bạn không cần phải ở trong trường học để tìm hiểu kỹ năng mới. Sử dụng các [áp phích, biểu ngữ, stickers, video và nhiều hơn nữa](<%= resolve_url('/promote/resources') %>) cho sự kiện của riêng bạn.

## 5. Xin phép chính quyền đìa phương để xác nhận hỗ trợ cho sự kiện "Hour of Code"

[Gửi email](<%= resolve_url('/promote/resources#sample-emails') %>) đến đại diện địa phương, hội đồng thành phố hay hội đồng nhà trường và mời họ đến thăm trường học của bạn cho Hour of Code. Nó có thể giúp xây dựng hỗ trợ cho khoa học máy tính trong khu vực của bạn vượt quá một giờ.

<%= view :signup_button %>