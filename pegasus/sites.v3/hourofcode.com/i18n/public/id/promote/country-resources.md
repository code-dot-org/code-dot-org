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

## 1) Cobalah tutorial:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Semua tutorial Hour of Code:**

  * Memerlukan persiapan-waktu minimal untuk penyelenggara
  * Tutorial mandiri - memungkinkan pelajar untuk bekerja sesuai kecepatan dan tingkat keahlian mereka sendiri

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Rencanakan perangkat yang keras yang anda butuhkan - komputer hanyalah opsional

Pengalaman terbaik dari Hour of Code adalah jika tersedia komputer-komputer yang terkoneksi dengan internet. Tetapi Anda tidak membutuhkan komputer untuk tiap anak, dan Hour of Code tetap dapat dilakukan tanpa komputer sama sekali.

  * **Tes tutorial pada perangkat atau komputer pelajar.** Pastikan itu bekerja dengan baik (dengan suara dan gambar).
  * **Tinjau ulang halaman keberhasilan menyelesaikan tutorial** untuk melihat apa yang pelajar akan lihat ketika menyelesaikannya. 
  * **Sediakan headphone untuk kelas anda**, atau minta pelajar untuk membawanya sendiri jika tutorial bekerja dengan baik jika disertai suaranya.

## 3) Rencanakan kedepan berdasarkan teknologi yang anda punya

  * **Tidak memiliki perangkat yang cukup?** Gunakan [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Ketika peserta berpasangan, mereka saling membantu dan mengandalkan guru lebih sedikit.
  * **Mempunyai bandwidth kecil?** Rencanakan untuk menunjukan video di depan kelas, supaya setiap pelajar tidak mengunduh video mereka sendiri. Atau cobalah tutorial offline atau tanpa komputer.

## 4) Inspirasikan pelajar - tunjukan mereka video

Menunjukkan kepada siswa video inspiratif untuk kick off jam kode. Contoh:

  * Video orginal peluncuran Code.org, yang menampilkan Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (Ada versi [1 menit](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 menit](https://www.youtube.com/watch?v=nKIu9yen5nc), dan [9 menit](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Presiden Obama menyerukan semua pelajar untuk belajar ilmu komputer](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Buat pelajar anda bersemangat - berikan intro singkat**

<% else %>

# Sumber daya tambahan segera hadir!

<% end %>

