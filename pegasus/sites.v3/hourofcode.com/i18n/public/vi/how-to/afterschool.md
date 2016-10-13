---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Làm thế nào để dạy Một Giờ Lập Trình sau giờ học

## 1) Xem video hướng dẫn này <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Chọn bài hướng dẫn:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for participants all ages, created by a variety of partners. [ Thử ngay!](<%= resolve_url("https://code.org/learn") %>)

**Tất cả những khóa học Hour of Code:**

  * Require minimal prep-time for organizers
  * Việc tự điều khiển có cho phép trẻ làm theo trình độ kỹ năng và tốc độ của chúng không?

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 3) Quảng bá lớp Một Giờ Lập Trình của bạn

Quảng bá lớp Một Giờ Lập Trình của bạn [ với các công cụ này ](<%= resolve_url('/promote') %>) và khuyến khích những người khác mở chương trình của riêng họ.

## 4) Lên kế hoạch các yêu cầu công nghệ - máy tính là tùy chọn

Trải nghiệm Một Giờ Lập Trình tốt nhất cần có máy tính được kết nối Internet. Nhưng bạn ** không ** cần mỗi đứa trẻ một máy tính, và bạn thậm chí có thể thực hiện Một Giờ Lập Trình mà chẳng cần đến bất cứ máy tính nào.

**Kế hoạch trước!** Thực hiện các bước dưới đây trước khi chương trình bắt đầu:

  * Test tutorials on student computers or devices. Make sure they work properly on browsers with sound and video.
  * Provide headphones for your class, or ask students to bring their own, if the tutorial you choose works best with sound.
  * **Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Khi học sinh học theo nhóm, chúng sẽ giúp đỡ nhau và sẽ ít phải nhờ tới giáo viên hơn. Chúng cũng sẽ thấy rằng khoa học máy tính có tính xã hội ,hợp tác.
  * **Nếu có kết nối internet chậm** hãy chiếu video lên máy chiếu để mọi người có thể xem cùng lúc. Hoặc thực hành với các khóa học không cần mạng/khóa học offline.

![](/images/fit-350/group_ipad.jpg)

## 5) Khởi động Một Giờ Lập Trình của bạn với video truyền cảm hứng

Khởi động Một Giờ Lập Trình của bạn bằng cách truyền cảm hứng cho những người tham gia và bàn luận về cách mà khoa học máy tính tác động đến mọi lĩnh vực trong cuộc sống của chúng ta.

**Chiếu một video truyền cảm hứng:**

  * Video giới thiệu chính thức của Code.org, đặc biệt là Bill Gates, Mark Zuckerberg,Ngôi sao NBA, Chris Bosh (Độ dài lần lượt [1 phút](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 phút](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 phút](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Tổng thống Obama kêu gọi tất cả học sinh nên học môn tin học](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Find more inspirational video [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

  * Diễn giải cách mà công nghệ tác động lên cuộc sống của chúng ta, với những ví dụ mà các bé trai và bé gái đều quan tâm đến (Nói về các ứng dụng và công nghệ được sử dụng để tiết kiệm cuộc sống, giúp đỡ con người, kết nối con người, v.v.).
  * Lên danh sách những thứ sử dụng mã hóa trong đời sống hằng ngày.
  * Xem những bí kíp làm cho các bé gái quan tâm vào khoa học máy tính [tại đây](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

** Muốn có thêm ý tưởng giảng dạy?** Xem thử [ bài giảng thực tiễn hay nhất ](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) từ những người đào tạo có kinh nghiệm.

## 6) Lập Trình!

**Chỉ dẫn những người tham gia vào các hoạt động**

  * Viết link bài hướng dẫn lên bảng trắng. Tìm link được liệt kê trên [ thông tin cho bài hướng dẫn đã lựa chọn ](<%= resolve_url('https://code.org/learn') %>) theo số lượng người tham gia.

**When someone comes across difficulties it's okay to respond:**

  * "Tôi không biết. Chúng ta sẽ cùng nhau tìm cách giải quyết nhé."
  * "Công nghệ không phải luôn luôn hoạt động theo ý chúng ta muốn."
  * "Học cách sử dụng một chương trình cũng giống như học một ngôn ngữ mới; bạn chưa thể thành thực ngay lập tức."

**Phải làm gì nếu ai đó hoàn thành sớm?**

  * Khuyến khích người tham gia thử hoạt động khác của Một Giờ Lập Trình tại [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Hoặc, yêu cầu những ai hoàn thành sớm giúp những người mà đang gặp khó khăn.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Chúc mừng

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [In giấy chứng nhận ](<%= resolve_url('https://code.org/certificates') %>) cho học sinh của bạn.
  * [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers for your students.
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your school.
  * Chia sẻ hình ảnh và video lớp học Một Giờ Lập Trình của bạn lên các phương tiện truyền thông xã hội. Sử dụng #HourOfCode và @codeorg để chúng tôi cũng có thể ghi nhận thành công của bạn!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Tài liệu Một Giờ Lập Trình khác cho người đào tạo:

  * Sử dụng [ kế hoạch bài giảng mẫu này ](/files/AfterschoolEducatorLessonPlanOutline.docx) để tổ chức Một Giờ Lập Trình của bạn.
  * Xem thử [ bài giảng thực tiễn hay nhất](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) từ những người đào tạo Một Giờ Lập Trình trước đây. 
  * Xem bản thu [ Hướng dẫn Người đào tạo với hội thảo Một Giờ Lập Trình qua mạng](https://youtu.be/EJeMeSW2-Mw).
  * [Tham dự buổi Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) trực tiếp với người sáng lập của chúng tôi, Hadi Partovi để chuẩn bị cho sự kiện Một Giờ Lập Trình.
  * Truy cập [ diễn đàn Một Giờ Lập Trình ](http://forum.code.org/c/plc/hour-of-code) để được nhận tư vấn, cái nhìn sâu sắc và hỗ trợ từ các tổ chức khác. <% if @country == 'us' %>
  * Xem lại [ câu hỏi thường gặp (FAQ) của Một Giờ Lập Trình](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Tiếp sau Một Giờ Lập Trình sẽ là gì?

Một Giờ Lập Trình chỉ là bước đầu tiên trên hành trình học tập nhiều hơn về cách công nghệ hoạt động và cách tạo ra các ứng dụng phần mềm. Để tiếp tục hành trình này:

  * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>