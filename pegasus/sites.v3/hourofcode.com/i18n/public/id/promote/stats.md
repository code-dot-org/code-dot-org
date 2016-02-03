---

title: <%= hoc_s(:title_stats) %>
layout: wide
nav: promote_nav

---


# Blurbs dan Statistik yang berguna

## Gunakan blurb ini di suratkabar

### Bawa ilmu komputer ke dalam sekolahmu. Mulailah dengan Hour of Code

Komputer ada dimana-mana, tetapi sedikit sekolah yang mengajar ilmu komputer dari 10 tahun yang lalu. Kabar baiknya, kita berada pada jalur yang tepat untuk merubah itu. Jika anda pernah mendengar tentang [Hour of Code](<%= resolve_url('/') %>) tahun lalu, Anda mungkin tahu itu merupakan momen bersejarah. Dalam Hour of Code pertama, 15 juta siswa mencoba ilmu komputer. Tahun lalu, jumlahnya bertambah menjadi 60 juta siswa! [Hour of Code](<%= resolve_url('/') %>) adalah satu jam pengantar ilmu komputer, dirancang untuk melawan mitos seputar coding dan menunjukkan bahwa siapa pun bisa belajar dasarnya. [Sign up](<%= resolve_url('/') %>) untuk menjadi penyelenggara Hour of Code ini <%= campaign_date('full') %> selama Pekan Edukasi Ilmu Komputer. Untuk menambahkan sekolah Anda ke peta, pergi ke https://hourofcode.com/<%= @country %>

## Infografis

<%= view :stats_carousel %>

