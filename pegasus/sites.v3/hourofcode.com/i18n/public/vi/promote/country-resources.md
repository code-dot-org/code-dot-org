---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Video <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## Hour of Code(アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen></iframe>
<

p>[**Hour of Code(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[Hour of Code Lesson Guide](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<%= localized_image('/images/fit-500x300/corporations.png') %>](<%= localized_file('/files/corporations.pdf') %>)

## 1) Thử thực hành các khóa học:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Tất cả những khóa học Hour of Code:**

  * Require minimal prep-time for organizers
  * Tự điều khiển -cho phép sinh viên làm theo tiến độ và mức kỹ năng mỗi người

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Trang thiết bị, phần cứng - máy tính là tùy chọn không bắt buộc

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * ** Test trên máy tính và thiết bị của học sinh** đảm bảo chúng hoạt động tốt (với cả âm thanh và video).
  * **Xem trước trang thông báo kết quả** để xem những gì học sinh sẽ thấy khi hoàn thành. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Lên kế hoạch dựa trên trang thiết bị công nghệ mà bạn sẵn có

  * **Nếu không đủ thiết bị** học bằng cách [ ghép đôi](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Nếu có kết nối internet chậm** hãy chiếu video lên máy chiếu để mọi người có thể xem cùng lúc. Hoặc thực hành với các khóa học không cần mạng/khóa học offline.

## 4) Truyền cảm hứng cho những người học - Cho chúng xem 1 video

Cho sinh viên một video cảm hứng để kick off Hour of Cord . Ví dụ:

  * Video giới thiệu chính thức của Code.org, đặc biệt là Bill Gates, Mark Zuckerberg,Ngôi sao NBA, Chris Bosh (Độ dài lần lượt [1 phút](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 phút](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 phút](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Tổng thống Obama kêu gọi tất cả học sinh nên học môn tin học](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Làm học sinh thích thú - đưa chúng xem bài giới thiệu ngắn**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>