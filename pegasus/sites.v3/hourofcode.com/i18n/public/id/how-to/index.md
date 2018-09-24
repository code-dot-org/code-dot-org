---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### Bergabung dengan gerakan ini untuk memperkenalkan pelajar kepada satu jam pertama ilmu komputer dengan langkah-langkah berikut. Hour of Code mudah dijalankan - bahkan untuk pemula! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. Tonton video how-to ini <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Pilih tutorial untuk jam Anda

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promosikan Jam Kode Anda

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Rencanakan kebutuhan teknologi komputer Anda - bersifat opsional

Pengalaman Jam Pemrograman terbaik memiliki komputer yang terhubung dengan internet. Anda **tidak** memerlukan komputer untuk setiap anak, dan Anda bahkan dapat melakukan Hour of Code tanpa komputer sama sekali.

Pastikan untuk menguji tutorial pada komputer siswa atau perangkat untuk memastikan mereka bekerja dengan baik pada browser dengan suara dan video. **bandwidth rendah?** Tampilkan video di depan kelas, agark setiap siswa tidak perlu mengunduh video mereka sendiri. Atau coba tutorial unplugged / offline.

Sediakan headphone untuk kelas Anda atau minta para siswa untuk membawa headphone mereka sendiri, jika tutorial yang Anda pilih, akan lebih baik dijalankan dengan suara.

** Tidak punya cukup perangkat? </ strong> Gunakan [ pemrograman pasangan ](https://www.youtube.com/watch?v=vgkahOzFH2Q). Ketika pelajar bekerja sama, mereka dapat saling membantu dan dapat mengurangi beban kerja pada guru. Mereka juga akan melihat ilmu komputer bersifat sosial dan kolaboratif.</p> 

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Mulai Jam Anda dari Kode off dengan speaker inspirasi atau video yang

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Tampilkan rekaman gambar yang menginspirasi:**

- Asli Kode.org peluncuran video, menampilkan Bill Gates, Mark Zuckerberg, dan bintang NBA Chris Bosh. (Ada [ 1 menit ](https://www.youtube.com/watch?v=qYZF6oIZtfc), <a href = "https://www.youtube.com/watch?v = nKIu9yen5nc "> 5 menit </a>, dan [ 9 menit ](https://www.youtube.com/watch?v=dU1xS07N-FA) versi yang tersedia)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Jelaskan bagaimana teknologi mempengaruhi kehidupan kita, dengan contoh yang akan diperhatikan anak laki-laki dan anak perempuan (berbicara tentang menyelamatkan nyawa, membantu orang, menghubungkan orang, dll.).
- Sebagai sebuah kelas, daftarkan hal-hal yang menggunakan kode dalam kehidupan sehari-hari.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6. Kode!

**Direct students to the activity**

- Tuliskan link tutorial di papan tulis. Temukan tautan yang tercantum di [ informasi untuk tutorial yang dipilih ](<%= resolve_url('/learn')%>) di bawah jumlah peserta.

**When your students come across difficulties it's okay to respond:**

- "Saya kurang tahu. Mari kita mencari solusinya bersama-sama."
- "Teknologi tidak selalu bekerja dengan cara yang kita inginkan."
- "Belajar untuk pemrograman seperti mempelajari bahasa baru; Anda tidak akan segera menjadi fasih."

**What if a student finishes early?**

- Siswa dapat melihat semua tutorial dan [ mencoba aktivitas Hour of Code lainnya ](<%= resolve_url('/learn')%>).
- Atau, tanyakan pada pelajar yang selesai lebih awal untuk membantu teman kelas mereka yang memiliki kesulitan dengan aktivitas.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Rayakan

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [Cetak stiker "Aku telah menyelesaikan Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) untuk siswa.
- [Pesanan kustom t-shirt](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) untuk sekolah Anda.
- Bagikan foto dan video Jam Pemrograman Anda pada media sosial. Gunakan tautan #HourOfCode dan @codeorg sehingga kami dapat menyoroti keberhasilan Anda juga!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Bahan Jam Pemrograman lainnya untuk para pendidik:

- Kunjungi [Forum Hour of Code untuk Guru](http://forum.code.org/c/plc/hour-of-code) untuk mendapatkan nasehat, wawasan dan dukungan dari pendidik lainnya. <% if @country == 'us' %>
- Tinjau [FAQ Hour of Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Apa yang diharapkan selanjutnya setelah Jam Pemrograman?

Hour of Code adalah langkah pertama dalam suatu perjalanan untuk mempelajari lebih lanjut bagaimana teknologi bekerja dan bagaimana membuat aplikasi perangkat lunak. Untuk melanjutkan perjalanan ini:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>