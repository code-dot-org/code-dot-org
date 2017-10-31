---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Quảng bá Hour of Code

## Cách tổ chức Hour of Code? [Xem hướng dẫn](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Hãy treo những áp phích giới thiệu này trong trường của bạn

<%= view :promote_posters %>

<a id="social"></a>

## Đăng bài này trên phương tiện truyền thông xã hội

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Sử dụng biểu tượng Hour of Code để nối ra thế giới

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Tải về phiên bản hi-res](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Bất kỳ tham chiếu đến "Giờ mã" nên được sử dụng trong một thời trang không gợi ý rằng nó là tên thương hiệu riêng của bạn, nhưng thay vì tham khảo giờ mã như là một phong trào cơ sở.
    
    - Ví dụ: "Tham gia trong giờ của mã tại ACMECorp.com". 
    - Ví dụ xấu: "Hãy thử giờ của mã bởi ACME Corp".
2. Sử dụng một superscript "TM" trong những nơi nổi bật nhất bạn đề cập đến "Giờ mã", cả hai trên trang web của bạn và trong phần giới thiệu ứng dụng.
3. Bao gồm các ngôn ngữ trên trang (hoặc trong các chân trang), trong đó có liên kết đến các trang web CSEdWeek và Code.org, nói những điều sau đây:
    
    *"'Hour of Code' là một sáng kiến toàn quốc của máy tính khoa học giáo dục Week[csedweek.org] và Code.org [code.org] để giới thiệu hàng triệu sinh viên đến một giờ của khoa học máy tính và lập trình máy tính."*

4. Không sử dụng "Hour of Code" trong tên ứng dụng.

<a id="stickers"></a>

## In những stickers để cung cấp cho học sinh của bạn

(Dán là 1" đường kính, 63 trên mỗi tờ)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Gửi những email này để thúc đẩy quảng bá Hour of Code

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Máy tính có ở khắp mọi nơi, thay đổi mọi ngành công nghiệp trên hành tinh. Nhưng ít hơn một nửa của tất cả các trường giảng dạy khoa học máy tính. Good news is, we’re on our way to change this! Nếu bạn đã nghe nói về Hour of Code trước đây, bạn có thể biết nó đã làm nên lịch sử. Hơn 100 triệu sinh viên đã cố gắng Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Hơn 100 đối tác đã tham gia hỗ trợ cho sự kiện này. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Hãy nói ra. Hãy tổ chức một sự kiện. Mời một trường học địa phương đăng nhập. Hoặc tự thử nghiệm Hour of Code\--- mọi người đều tìm thấy lợi ích từ những điều cơ bản.

Bắt đầu tại http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Lôi cuốn truyền thông vào sự kiện:

**Chủ đề:**nhiệm vụ của các trường học tham gia là giới thiệu học sinh tìm hiểu khoa học máy tính

Máy tính đang ở khắp mọi nơi, thay đổi mọi ngành công nghiệp trên các hành tinh, nhưng ít hơn một nửa của tất cả các trường giảng dạy khoa học máy tính. Cô gái và dân tộc thiểu số đang bị đánh giá thấp trong các lớp học khoa học máy tính, và trong ngành công nghiệp công nghệ cao. Tin tốt là chúng tôi đang trên đường thay đổi điều đó.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Hơn 100 đối tác đã tham gia hỗ trợ cho sự kiện này. Mỗi cửa hàng của Apple trên thế giới đã tổ chức một Hour of Code. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Xin vui lòng tham gia với chúng tôi.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Thông báo cho phụ huynh về sự kiện diễn ra ở trường học:

**Subject line:** Our students are changing the future with an Hour of Code

Các bậc phụ huynh thân mến,

Chúng ta đang được sống trong thế giới của công nghệ. Và chúng ta đều hiểu rằng dù khi lớn lên những đứa trẻ của chúng ta có chọn đi theo chuyên ngành nào thì khả năng thành công của chúng sẽ cao hơn nếu các em có những hiểu biết cơ bản về của công nghệ.

Nhưng chỉ một phần nhỏ của chúng tôi đang học tập **làm thế nào để làm** các công trình công nghệ. Ít hơn một nửa của tất cả các trường giảng dạy khoa học máy tính.

Đó là lý do tại sao toàn bộ trường học của chúng tôi đang tham gia vào một sự kiện học tập lớn nhất trong lịch sử: Giờ lập trình, diễn ra trong Tuần Giáo Dục Khoa Học Máy Tính (tháng 12). Hơn 100 triệu sinh viên toàn thế giới đã cố gắng Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Để tiếp tục mang hoạt động lập trình đến con em của các bạn, chúng tôi muốn làm cho sự kiện Giờ Lập trình với quy mô lớn hơn. Tôi khuyến khích các bạn hãy tham gia tình nguyện, liên hệ với phương tiện truyền thông địa phương, chia sẻ tin tức trên kênh phương tiện truyền thông xã hội của các bạn và xem xét việc tổ chức thêm sự kiện Giờ Lập Trình ở cộng đồng.

Đây là thời cơ để thay đổi nền giáo dục tương lai ở [THỊ TRẤN/ TÊN THÀNH PHỐ].

Xem chi tiết tại http://hourofcode.com/<%= @country %>, và góp phần lan truyền ra thế giới.

Trân trọng,

Ban tổ chức

<a id="politicians"></a>

### Mời một chính trị gia địa phương tham gia sự kiện ở trường học của bạn:

**Subject line:** Join our school as we change the future with an Hour of Code

[Họ của Thị trưởng/Thống đốc/Ban đại diện/thượng nghị sĩ] kính mến:

Ông/bà có biết rằng máy tính là nguồn #1 của lương tại Mỹ.? Có hơn 500.000 tính toán công việc mở trên toàn quốc, nhưng năm ngoái chỉ 42,969 máy tính khoa học sinh viên tốt nghiệp vào lực lượng lao động.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Đó là lý do tại sao toàn bộ trường học của chúng tôi đang tham gia vào một sự kiện học tập lớn nhất trong lịch sử: Giờ lập trình, diễn ra trong Tuần Giáo Dục Khoa Học Máy Tính (tháng 12). Hơn 100 triệu sinh viên toàn thế giới đã cố gắng Hour of Code.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Chúng tôi muốn đảm bảo rằng học sinh của chúng tôi đang đi đầu trong việc tạo ra các công nghệ của tương lai-không chỉ tiêu thụ nó.

Làm ơn liên hệ với chúng tôi theo số [SỐ ĐIỆN THOẠI HOẶC ĐỊA CHỈ EMAIL]. Tôi mong chờ hồi âm của ông/bà.

Trân trọng,

[NAME], [TITLE]

<%= view :signup_button %>