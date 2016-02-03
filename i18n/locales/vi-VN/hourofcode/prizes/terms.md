* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Giải thưởng - Các điều khoản và điều kiện khi nhận giải

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Giới hạn chỉ cho một cá nhân/ một tổ chức và duy nhất một tài khoản.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Nếu toàn bộ học sinh/ sinh viên của một trường đều tham gia vào Hour of Code, thì hãy đảm bảo rằng mỗi cá nhân đều có một tài khoản riêng để đảm bảo sự công bằng và điều kiện khi tham gia nhận thưởng.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Giải thưởng 3: Một lớp học được trang bị laptop phục vụ học tập và giảng dạy (hoặc 10.000USD cho một công nghệ khác được triển khai):

Giải thưởng chỉ giới hạn cho hệ thống trường học 12 khối ở Mỹ. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Một lớp học ở bất kì tiểu bang nào của Mỹ sẽ được trang bị máy tính. Code.org will select and notify winners via email by December 1, 2015.

Để rõ ràng, đây không là một mã dự thưởng hoặc cuộc thi phải trả phí.

1) Không có sự đánh cược tiền bạc hay nguy cơ nào khi đăng kí - mọi trường hay lớp học có thể tham gia và không phải trả phí cho Code.org hoặc tổ chức nào khác

2) Nhà vô địch được chọn trong số trường (hoặc lớp học) là thành viên của 'giờ mã hóa' và hoàn thành bài kiểm tra tập thể của học sinh, giáo viên.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Giải thưởng 2: Chat video với người hướng dẫn:

Giải thưởng này chỉ giới hạn cho lớp K-12 ở Mỹ và Canada . Code.org sẽ chọn ra lớp học thắng cuộc , cung cấp thời gian để nói chuyện qua mạng và làm việc với giáo viên phù hợp để thiết lập nên chi tiết kỹ thuật. Trường của bạn không cần đăng kí kiểm tra chất lượng cho giải này Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>