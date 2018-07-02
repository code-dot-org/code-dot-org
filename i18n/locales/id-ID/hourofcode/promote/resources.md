---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promosikan Jam Kode

## Hosting Satu Jam Kode? [ Lihat petunjuk panduannya ](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Tempelkan poster-poster ini di sekolah anda

<%= view :promote_posters %>

<a id="social"></a>

## Posting ini di media sosial

[![gambar](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![gambar](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![gambar](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Gunakan logo Hour of Code untuk menyebarkan berita

[![gambar](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Download versi hi-res](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Setiap mereferensikan "Hour of Code" harus tidak mengatakan bahwa nama merek tersebut adalah milik anda, tetapi referensikan Hour of Code sebagai akar/inti dari gerakan/kampanye ini. ** Contoh bagus: "Berpartisipasi dalam Hour of Code™ di ACMECorp.com". Contoh buruk: "Cobalah Hour of Code oleh perusahaan ACME". **
2. Gunakan superscript "TM" di tempat yang paling menonjol yang Anda sebutkan "Jam Kode", baik di situs web Anda maupun di deskripsi aplikasi.
3. Sertakan bahasa pada halaman (atau pada footer), termasuk dalam alamat menuju CSEdWeek dan situs web Code.org, yang memilki tulisan:
    
    *"'Hour of Code™' adalah gerakan global dari Pekan Edukasi Ilmu Komputer [csedweek.org] dan Code.org [code.org] untuk mengenalkan jutaan siswa dengan sesi satu jam dari ilmu komputer dan pemrograman komputer."*

4. Tidak ada penggunaan "Hour of Code" dalam nama aplikasi.

<a id="stickers"></a>

## Cetak stiker ini untuk diberikan kepada siswa Anda

(Stiker berdiameter 1", 63 per lembar)  
[![gambar](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Kirimkan email ini untuk membantu mempromosikan kegiatan Hour of Code

<a id="email"></a>

### Mintalah sekolah, majikan, atau teman Anda untuk mendaftar:

** Subject line: </ 0> Bergabunglah dengan saya dan lebih dari 100 juta siswa untuk Hour of Code</p> 

Komputer ada dimana-mana, mengubah setiap industri di planet ini. Tapi kurang dari separuh sekolah mengajarkan ilmu komputer. Kabar baiknya adalah, kita sedang dalam perjalanan untuk mengubah ini! If you've heard about the Hour of Code before, you might know it made history. Lebih dari 100 juta siswa telah mencoba Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Lebih dari 100 mitra telah bergabung bersama untuk mendukung gerakan ini. Setiap Apple Store di dunia telah menyelenggarakan Hour of Code, dan para pemimpin seperti Presiden Obama dan Perdana Menteri Kanada Justin Trudeau menulis baris kode pertama mereka sebagai bagian dari kampanye.

Tahun ini, mari kita buat lebih besar lagi. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Silakan terlibat dalam acara Hour of Code selama Pekan Pendidikan Ilmu Komputer, <%= campaign_date('full')%>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Mulai di http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Relawan di sekolah:

** Baris subjek: </ strong> Bisakah kami membantu Anda meng-host dan Hour of Code?</p> 

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Organisasi kami / nama saya] ingin membantu [nama sekolah] menjalankan acara Hour of Code. Kami dapat membantu para guru menyelenggarakan Hour of Code di kelas mereka (kami bahkan tidak memerlukan komputer!) Atau jika Anda ingin menjadi tuan rumah sebuah majelis sekolah, kami dapat mengatur agar pembicara berbicara tentang bagaimana teknologi bekerja dan bagaimana rasanya jadilah insinyur perangkat lunak.

Para siswa akan membuat aplikasi atau permainan mereka sendiri yang bisa mereka tunjukkan pada orang tua mereka, dan kami juga akan mencetak sertifikat Kode Hari yang bisa mereka bawa pulang. Dan, ini menyenangkan! Dengan kegiatan interaktif dan langsung, siswa akan belajar keterampilan berpikir komputasi dengan cara yang mudah didekati.

Komputer ada dimana-mana, mengubah setiap industri di planet ini. Tapi kurang dari separuh sekolah mengajarkan ilmu komputer. Kabar baiknya adalah, kita sedang dalam perjalanan untuk mengubah ini! Jika Anda pernah mendengar tentang Hour of Code sebelumnya, Anda mungkin tahu itu membuat sejarah - lebih dari 100 juta siswa di seluruh dunia telah mencoba Hour of Code.

Berkat Hour of Code, ilmu komputer telah berada di homepage Google, MSN, Yahoo!, dan Disney. Lebih dari 100 mitra telah bergabung bersama untuk mendukung gerakan ini. Every Apple Store in the world has hosted an Hour of Code, and even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

Anda dapat membaca lebih lanjut tentang acara di http://hourofcode.com/. Atau, beri tahu kami jika Anda ingin menjadwalkan beberapa waktu untuk membicarakan bagaimana [nama sekolah] dapat berpartisipasi.

Terima kasih!

[Nama anda], [organisasi anda]

<a id="media-pitch"></a>

### Undang media untuk menghadiri acara Anda:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Kabar baiknya, kita berada pada jalur yang tepat untuk merubah itu.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Lebih dari 100 mitra telah bergabung bersama untuk mendukung gerakan ini. Every Apple Store in the world has hosted an Hour of Code. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Please join us.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

[Your Name]

<a id="parents"></a>

### Tell parents about your school's event:

**Subject line:** Our students are changing the future with an Hour of Code

Orang tua yang di hormati

Kita hidup di dunia yang dikelilingi dengan teknologi. Dan kita tahu bahwa bidang apa pun yang dipilih oleh murid-murid kita untuk dijadikan orang dewasa, kemampuan mereka untuk sukses akan semakin bergantung pada pemahaman bagaimana teknologi bekerja.

Tapi hanya sebagian kecil dari kita belajar**bagaimana teknologi ** bekerja. Kurang dari separuh sekolah mengajarkan ilmu komputer.

Itulah sebabnya seluruh sekolah kami bergabung dalam acara pembelajaran terbesar sepanjang sejarah: The Hour of Code, selama Pekan Pendidikan Ilmu Komputer(<%=campaign_date ('full')%>). Lebih dari 100 juta siswa di seluruh dunia telah mencoba Hour of Code.

Hour of code kami membuat pernyataan bahwa [SEKOLAH NAMA] siap untuk mengajarkan keterampilan abad ke-21 yang mendasar ini. Untuk membawa kegiatan pemrograman untuk pelajar Anda, kami ingin membuat acara Hour of Code kami besar. Saya meendukung Anda untuk menjadi sukarelawan, menjangkau media lokal, berbagi berita di saluran media sosial anda dan mempertimbangkan menyelenggarakan Hour of Code di komunitas.

Ini adalah kesempatan untuk mengubah masa depan pendidikan di [TOWN/CITY NAME].

Lihat http://hourofcode.com/<%= @country %> untuk rincian, dan bantuan untuk menyebarkan berita.

Hormat kami,

Kepala sekolah

<a id="politicians"></a>

### Undang politisi lokal ke kegiatan sekolah anda:

** Baris subjek: ** Bergabunglah dengan sekolah kami saat kami mengubah masa depan dengan Jam Kode

Yang terhormat [nama terakhir Mayor/Gubernur/wakil/Senator]:

Tahukah Anda bahwa komputasi adalah sumber upah #1 di A.S.? Ada lebih dari 500.000 pekerjaan komputasi yang dibuka secara nasional, namun tahun lalu hanya 42.969 mahasiswa ilmu komputer yang masuk dalam angkatan kerja.

Ilmu komputer adalah fondasi bagi *setiap* industri saat ini, namun kebanyakan sekolah tidak mengajarkannya. Di [SCHOOL NAME], kami mencoba untuk mengubahnya.

Itulah sebabnya seluruh sekolah kami bergabung dalam acara pembelajaran terbesar sepanjang sejarah: The Hour of Code, selama Pekan Pendidikan Ilmu Komputer(<%=campaign_date ('full')%>). Lebih dari 100 juta siswa di seluruh dunia telah mencoba Hour of Code.

Saya menulis untuk mengundang Anda untuk mengikuti acara Hour of Code kami dan berbicara di majelis kickoff kami. Ini akan berlangsung pada tanggal [TANGGAL, WAKTU, TEMPAT], dan akan membuat pernyataan kuat bahwa [Nama Negara atau Kota] siap untuk mengajarkan keterampilan kritis abad ke-21 siswa kami. Kami ingin memastikan bahwa siswa kami berada di garis depan dalam menciptakan teknologi masa depan-tidak hanya mengonsumsinya.

Silakan hubungi saya di [Nomer Telpon atau EMAIL alamat]. Saya berharap respon balik Anda.

Hormat kami,

[Nama Anda], [Title]

<%= view :signup_button %>