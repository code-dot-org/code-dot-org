---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Hãy treo những áp phích giới thiệu này trong trường của bạn

<%= view :promote_posters %>

<a id="social"></a>

## Đăng bài này trên phương tiện truyền thông xã hội

[![hình ảnh](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![hình ảnh](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![hình ảnh](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![hình ảnh](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Bất kỳ tham chiếu đến "Giờ mã" nên được sử dụng trong một thời trang không gợi ý rằng nó là tên thương hiệu riêng của bạn, nhưng thay vì tham khảo giờ mã như là một phong trào cơ sở. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Bao gồm các ngôn ngữ trên trang (hoặc trong các chân trang), trong đó có liên kết đến các trang web CSEdWeek và Code.org, nói những điều sau đây:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![hình ảnh](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## gửi những email này để thúc đẩy quảng bá Hour of Code

<a id="email"></a>

## Giới thiệu tới trường học của bạn, nhân viên hoặc bạn bè của bạn để họ đăng ký tham gia:

Máy tính ở khắp mọi nơi, nhưng 10 năm trở lại trước chỉ một số ít các trường học dạy về khoa học máy tính. Tin tốt là chúng tôi đang trên đường thay đổi điều đó. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! và Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Hãy nói ra. Hãy tổ chức một sự kiện. Mời một trường học địa phương đăng nhập. Hoặc tự thử nghiệm Hour of Code -- mọi người đều tìm thấy lợi ích từ những điều cơ bản.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Lôi cuốn truyền thông vào sự kiện:

**Subject line:** Local school joins mission to introduce students to computer science

Máy tính là ở khắp mọi nơi, nhưng rất ít trường dạy về khoa học máy trong hơn 10 năm trước đây. Nữ giới và dân tộc thiểu số bị chèn ép nặng nề . Tin tốt là, chúng tôi đang trên con đường thay đổi điều này.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! và Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Tôi đang viết để mời bạn tham gia chúng tôi kickoff hội nghị này, và xem trẻ em bắt đầu các hoạt động trên [DATE].

Hour of Code được tổ chức bởi tổ chức phi lợi nhuận Code.org và hơn 100 tổ chức khác, tuyên bố thế hệ sinh viên ngày nay sẵn sàng để tìm hiểu các kỹ năng quan trọng cho sự thành công của thế kỷ 21. Xin vui lòng tham gia với chúng tôi.

**Liên hệ:** [TÊN BẠN], [TITLE], điện thoại: (212) 555-5555

**Khi nào:** [NGÀY và GIỜ diễn ra sự kiện]

**Địa điểm:** [ĐỊA CHỈ và CHỈ DẪN]

Tôi hy vọng được giữ liên lạc.

<a id="parents"></a>

## Thông báo cho phụ huynh về sự kiện diễn ra ở trường học:

Các bậc phụ huynh thân mến,

Chúng ta đang được sống trong thế giới của công nghệ. Và chúng ta đều hiểu rằng dù khi lớn lên những đứa trẻ của chúng ta có chọn đi theo chuyên ngành nào thì khả năng thành công của chúng sẽ cao hơn nếu các em có những hiểu biết cơ bản về của công nghệ. Nhưng chỉ một phần nhỏ trong số chúng ta đang học khoa học máy tính, và càng ít học sinh đang học môn khoa học này trong hơn một thập kỉ qua.

Đó là lý do tại sao toàn bộ trường học của chúng tôi đang tham gia vào một sự kiện học tập lớn nhất trong lịch sử: Giờ lập trình, diễn ra trong Tuần Giáo Dục Khoa Học Máy Tính (tháng 12 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Giờ Lập Trình tuyên bố rằng [TÊN TRƯỜNG] sẵn sàng dạy những kĩ năng cơ bản này trong thế kỉ 21. Để tiếp tục mang hoạt động lập trình đến con em của các bạn, chúng tôi muốn làm cho sự kiện Giờ Lập trình với quy mô lớn hơn. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Đây là thời cơ để thay đổi nền giáo dục tương lai ở [THỊ TRẤN/ TÊN THÀNH PHỐ].

Xem chi tiết tại http://hourofcode.com/<%= @country %>, và góp phần lan truyền ra thế giới.

Trân trọng,

Ban tổ chức

<a id="politicians"></a>

## Mời một chính trị gia địa phương tham gia sự kiện ở trường học của bạn:

[Họ của Thị trưởng/Thống đốc/Ban đại diện/thượng nghị sĩ] kính mến:

Ông/bà có biết rằng trong nền kinh tế ngày nay, những công việc liên quan đến máy tính nhiều hơn số sinh viên tốt nghiệp theo tỉ lệ 3:1? Và khoa học máy tính là cơ sở cho *mỗi* nền công nghiệp ngày nay. Yet most of schools don’t teach it. Tại [TÊN TRƯỜNG], chúng tôi đang cố gắng thay đổi điều đó.

Đó là lý do tại sao toàn bộ trường học của chúng tôi đang tham gia vào một sự kiện học tập lớn nhất trong lịch sử: Giờ lập trình, diễn ra trong Tuần Giáo Dục Khoa Học Máy Tính (tháng 12 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Tôi viết thư này kính mời ông/bà tham dự sự kiện Giờ Lập Trình và phát biểu tại lễ khai mạc của chúng tôi. Sự kiện sẽ diễn ra vào [NGÀY, THỜI GIAN, ĐỊA ĐIỂM] và sẽ trịnh trọng tuyên bố rằng [Tiểu bang hoặc tên Thành phố] sẵn sàng dạy cho học sinh thế kỉ 21 những kĩ năng quan trọng này. Chúng tôi muốn chắc chắn rằng học sinh của chúng ta đang đi đầu trong việc sáng tạo ra công nghệ của tương lai--chứ không chỉ sử dụng nó.

Làm ơn liên hệ với chúng tôi theo số [SỐ ĐIỆN THOẠI HOẶC ĐỊA CHỈ EMAIL]. Tôi mong chờ hồi âm của ông/bà.

Trân trọng, [NAME], [TITLE]

