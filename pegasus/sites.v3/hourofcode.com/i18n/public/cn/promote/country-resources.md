---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---


<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## 视频 <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
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

## 试用教程

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**编程一小时全部教程：**

  * Require minimal prep-time for organizers
  * 可允许学生按照他们自己的进度和能力水平自学

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2)计划你的硬件需求- 电脑可自选

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **在学生的计算机或设备测试教程，**确保它们正常工作（声音和视频）。
  * **预览恭喜页面**查看学生在完成之后会看到什么。 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3)针对现有技术做好提前规划

  * **没有足够的设备？**采用[配对编程](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning)。 When participants partner up, they help each other and rely less on the teacher.
  * **宽带较低？**可计划在全班面前进行视频演示，这样就不是每个学生都在各自下载视屏，或或尝试不插电/离线教程。

## 4) 鼓励学生-向他们展示视频

向学生展示一个鼓舞人心的视频代码小时揭开序幕。示例：

  * Code.org推出的原始视频有比尔·盖茨，马克·扎克伯格和NBA球星克里斯 - 波什（它们分别为[1分钟](https://www.youtube.com/watch?v=qYZF6oIZtfc)，[5分钟](https://www.youtube.com/watch?v=nKIu9yen5nc)和[9分钟](https://www.youtube.com/watch?v=dU1xS07N-FA)版本）
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [奥巴马总统号召所有对的学生学习计算机科学](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**激发你的学生-给他们做一个简短的介绍**

<% else %>

# Additional resources coming soon!

<% end %>

