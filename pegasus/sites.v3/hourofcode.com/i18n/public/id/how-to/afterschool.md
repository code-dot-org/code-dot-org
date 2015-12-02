---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# How to teach one Hour of Code in after-school

## 1) Daftar

  * Daftar untuk menyelenggarakan [Hour of Code ](<%= resolve_url('/') %>) selama <%= campaign_date('short') %>.
  * Promosikan [Hour of Code](<%= resolve_url('/promote') %>) Anda dan dorong orang lain untuk menyelenggarakan juga.

## 2) Lihat video how-to ini <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Pilih tutorial:

Kita akan menyelenggarakan berbagai [tutorial satu jam yang menyenangkan](<%= resolve_url('https://code.org/learn') %>) bagi siswa dari segala usia, yang dibuat oleh berbagai mitra. *Tutorial baru datang untuk memulai Hour of Code sebelum <%= campaign_date('full') %>.* [Coba tutorial yang ada saat ini.](<%= resolve_url("https://code.org/learn") %>)

**Semua tutorial Hour of Code:**

  * Memerlukan persiapan-waktu minimal untuk penyelenggara
  * Terpandu mandiri - memungkinkan pelajar untuk bekerja sesuai kecepatan dan tingkat keahlian mereka sendiri

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Rencana kebutuhan teknologi Anda - komputer bersifat opsional

Pengalaman terbaik dari Hour of Code adalah dengan menggunakan komputer yang terhubung dengan internet. Anda **tidak** membutuhkan komputer untuk setiap siswa, dan bahkan dapat menyelenggarakan Hour of Code tanpa komputer sama sekali.

  * Uji tutorial pada komputer atau perangkat. Pastikan mereka bekerja dengan baik pada browser dengan suara dan video.
  * Sediakan headphone, atau minta para peserta untuk membawa milik mereka sendiri jika tutorial Anda akan tersaji lebih baik dengan suara.
  * **Tidak memiliki perangkat cukup?** Gunakan [pemrograman berpasangan](https://www.youtube.com/watch?v=vgkahOzFH2Q). Ketika anak-anak bermitra, mereka saling membantu dan mengandalkan peran pendidik yang lebih sedikit. Mereka juga akan melihat ilmu komputer adalah sosial dan kolaboratif.
  * **Memiliki bandwidth rendah?** Rencanakan untuk proyeksikan video ke layar besar, sehingga semua orang tidak men-download video mereka sendiri. Atau coba tutorial unplugged / offline.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspirasi partisipan untuk memulai Hour of Code Anda

Mulai Hour of Code Anda dengan menginspirasi siswa dan diskusikan bagaimana ilmu komputer dapat memberikan dampak pada setiap bagian dari kehidupan kita.

**Tampilkan video inspiratif:**

  * Video orginal peluncuran Code.org, yang menampilkan Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (Ada versi [1 menit](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 menit](https://www.youtube.com/watch?v=nKIu9yen5nc), dan [9 menit](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * [Video peluncuran Hour of Code 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), atau <% if @country == 'uk' %> [Video Hour of Code 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Video Hour of Code 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Presiden Obama menyerukan semua pelajar untuk belajar ilmu komputer](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Temukan lebih banyak video inspiratif [di sini](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Tidak apa-apa jika Anda baru dalam ilmu komputer. Berikut adalah beberapa ide untuk memperkenalkan kegiatan Hour of Code Anda:**

  * Jelaskan cara teknologi memberi dampak pada kehidupan kita, dengan contoh-contoh yang diminati oleh anak-anak (Bicarakan tentang apps dan teknologi yang digunakan untuk menyelamatkan nyawa, membantu orang, menghubungkan orang dll).
  * Daftarkan hal yang menggunakan kode dalam kehidupan sehari-hari.
  * See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls') %>).

**Butuh bimbingan lebih lanjut?** Download [template rencana pembelajaran ini](/files/AfterschoolEducatorLessonPlanOutline.docx).

**Butuh lebih banyak ide pengajaran?** Periksa [praktek-praktek terbaik](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) dari pendidik yang berpengalaman.

## 6) Code!

**Arahkan peserta langsung ke aktivitas**

  * Tulis link tutorial di papan tulis. Temukan link yang tercantum di [informasi untuk tutorial yang dipilih](<%= resolve_url('https://code.org/learn') %>) di bawah jumlah peserta.

**Ketika seseorang datang ketika kesulitan, tidak apa-apa untuk menanggapi:**

  * "Saya tidak tahu. Mari kita memikirkan hal ini bersama-sama."
  * "Teknologi tidak selalu bekerja dengan cara yang kita inginkan."
  * "Belajar untuk program adalah seperti mempelajari suatu bahasa baru; Anda tidak akan lancar segera."

**Apa yang harus dilakukan jika seseorang selesai lebih awal?**

  * Dorong para peserta untuk mencoba kegiatan Hour of Code lain di [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Atau, minta mereka yang selesai lebih awal untuk membantu orang lain yang mengalami masalah.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Rayakan

  * [Cetak sertifikat](<%= resolve_url('https://code.org/certificates') %>) untuk siswa Anda.
  * [Cetak stiker "Aku sejam kode!"](<%= resolve_url('/promote/resources#stickers') %>).
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your students.
  * Bagikan foto dan video acara Hour of Code Anda pada media sosial. Gunakan #HourOfCode dan @codeorg sehingga kita dapat menyoroti keberhasilan Anda juga!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Sumber daya Hour of Code lain untuk pendidik:

  * Gunakan [template rencana pelajaran](/files/AfterschoolEducatorLessonPlanOutline.docx) ini untuk mengatur Hour of Code Anda.
  * Periksa [praktek-praktek terbaik](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) pengajar Hour of Code sebelumnya. 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Kunjungi [Forum Hour of Code](http://forum.code.org/c/plc/hour-of-code) untuk mendapatkan nasihat, wawasan dan dukungan dari penyelenggara lain. <% if @country == 'us' %>
  * Tinjau [FAQ Hour of Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Apa yang selanjutnya dilakukan setelah Hour of Code?

The Hour of Code adalah langkah pertama dalam suatu perjalanan untuk mempelajari lebih lanjut tentang bagaimana teknologi bekerja dan bagaimana untuk membuat aplikasi perangkat lunak. To continue this journey: - The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>