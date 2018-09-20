---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

Sebagai bentuk terima kasih atas bantuan Anda yang memungkinkan para siswa mulai belajar ilmu komputer, kami ingin memberi Anda sebuah paket poster cetak profesional yang menampilkan beragam teladan untuk kelas Anda. Gunakan kode penawaran **FREEPOSTERS** saat checkout. (Catatan: Penawaran ini hanya tersedia selama masih ada dan anda menanggung ongkos kirim. Karena poster ini dikirim dari Amerika, ongkos kirim bisa mahal jika dikirim ke Kanada dan internasional. Kami memahami bahwa ini mungkin tidak dalam anggaran anda, dan kami mendoorong anda untuk mencetak [PDF files](https://code.org/inspire) untuk kelas anda.)  
<br /> [<button>Dapatkan Poster</button>](https://store.code.org/products/code-org-posters-set-of-12) Gunakan kode penawaran FREEPOSTERS

<% if @country == 'us' %> Terima Kasih untuk kemurahan hati Ozobot, Dexter Industries, littleBits, dan Wonder Workshop, lebih dari 100 kelas akan dipilih untuk menerima robot atau sirkuit untuk kelas mereka! Untuk dapat memenuhi syarat untuk menerima satu set, pastikan untuk mengisi survei yang dikirim dari Code.org Hour of Code. Code.org akan memilih kelas yang menang. Sementara itu, periksa beberapa aktivitas robotika dan sirkuit. Harap dicatat bahwa ini hanya terbuka untuk sekolah di Amerika Serikat. <% end %>

<br /> **Jam Kode berjalan selama <%= campaign_date('full') %> dan kami akan menghubungi tutorial baru dan pembaruan menarik lainnya saat mereka keluar. Sementara itu, apa yang bisa kamu lakukan sekarang?**

## 1. Sebarkan informasi ini di sekolah dan komunitas Anda

Anda baru saja bergabung dengan gerakan Hour of Code. Beritahu teman Anda dengan**#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Ajak orang lain berpartisipasi [dengan email contoh kami.](<%= resolve_url('/promote/resources#sample-emails') %>) Hubungi kepala sekolahmu dan tantang setiap kelas di sekolahmu untuk mendaftar. Ajak kelompok masyarakat — Pramuka, kelompok keagamaan, universitas, pensiunan, serikat pekerja atau bahkan teman - teman. Anda tidak harus sekolah untuk belajar keterampilan baru. Undang politisi atau pembuat kebijakan untuk mengunjungi sekolah Anda untuk Hour of Code. Ini dapat membantu membangun dukungan bagi ilmu komputer di daerah Anda di luar dari sesi satu Hour of Code.

Gunakan [ poster, spanduk, stiker, video, dan lainnya ](<%= resolve_url('/promote/resources') %>) untuk acara Anda sendiri.

## 2. Temukan relawan lokal untuk membantu kegiatan Anda.

[Cari peta relawan kami](<%= resolve_url('https://code. org/volunteer/local') %>) untuk sukarelawan yang dapat mengunjungi kelas atau melakukan video chat untuk menginspirasi siswa Anda tentang kemungkinan yang bermacam - macam dengan ilmu komputer.

## 3. Rencanakan Hour of Code Anda

Pilih sebuah [Aktifitas Hour of Code](https://hourofcode.com/learn) untuk kelas Anda dan[Tinjau Panduan ini](<%= resolve_url('/how-to') %>).

# Setelah Houf of Code

<% if @country == 'us' %> Hour of Code hanyalah permulaan. Apakah anda administrator, guru, advocate, kami memiliki [pengembangan profesional, kurikulum dan sumber untuk membantu anda memperkenalkan kelas ilmu komputer ke sekolah anda.](https://code.org/yourschool) Jika Anda telah mengajar ilmu komputer, gunakan sumber berikut selama CS Education Week untuk mengumpulkan dukungan dari administration, orang tua, dan komunitas.

Kamu memiliki banyak pilihan yang tepat untuk sekolahmu. Sebagian besar organisasi yang menawarkan tutorial Hour of Code juga memiliki kurikulum dan pengembangan profesional yang tersedia. Jika Anda menemukan pelajaran yang Anda sukai, silahkan bertanya lebih lanjut. Untuk membantu Anda memulai, kami telah menyoroti sejumlah [penyedia kurikulum yang akan membantu Anda atau siswa Anda melampaui satu jam.](https://hourofcode.com/beyond)

<% else %> Hour of Code hanyalah permulaan. Sebagian besar organisasi yang menawarkan pelajaran Hour of Code juga memiliki kurikulum lanjutan. Untuk membantu Anda memulai, kami telah menyoroti sejumlah [penyedia kurikulum yang akan membantu Anda atau siswa Anda melampaui satu jam.](https://hourofcode.com/beyond)

Code.org juga menawarkan [ Pengantar Ilmu Komputer ](https://code.org/educate/curriculum/cs-fundamentals-international) yang diterjemahkan ke lebih dari 25 bahasa tanpa biaya kepada Anda atau sekolah Anda. <% end %>

<%= view 'popup_window.js' %>