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

Sebagai bentuk terima kasih atas bantuan Anda yang memungkinkan para siswa mulai belajar ilmu komputer, kami ingin memberi Anda sebuah paket poster cetak profesional yang menampilkan beragam teladan untuk kelas Anda. Gunakan kode penawaran **FREEPOSTERS** saat checkout. (Note: this is only available while supplies last and you'll need to cover shipping costs. Since these posters ship from the United States, shipping costs can be quite high if shipping to Canada and internationally. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Kode.org akan memilih kelas pemenang. Sementara itu, periksa beberapa aktivitas robotika dan sirkuit. Harap dicatat bahwa ini hanya terbuka untuk sekolah AS. <% end %>

<br /> **Jam Kode berjalan selama <%= campaign_date('full') %> dan kami akan menghubungi tutorial baru dan pembaruan menarik lainnya saat mereka keluar. Sementara itu, apa yang bisa kamu lakukan sekarang?**

## 1. Sebarkan informasi ini di sekolah dan komunitas Anda

Anda baru saja bergabung dengan gerakan Hour of Code. Beritahu teman Anda dengan**#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Ajak orang lain berpartisipasi [dengan email contoh kami.](<%= resolve_url('/promote/resources#sample-emails') %>) Hubungi kepala sekolahmu dan tantang setiap kelas di sekolahmu untuk mendaftar. Ajak kelompok masayarakat — Pramuka, kelompok pengajian/gereja, unit mahasiswa, pensiunan atau serikat pekerja. Anda tidak harus bersekolah untuk belajar keterampilan baru. Undang politisi atau pembuat kebijakan untuk mengunjungi sekolah Anda untuk Hour of Code. Ini bisa membantu membangun dukungan untuk ilmu komputer di daerah Anda lebih dari satu jam.

Gunakan [ poster, spanduk, stiker, video, dan lainnya ](<%= resolve_url('/promote/resources') %>) untuk acara Anda sendiri.

## 2. Temukan sukarelawan lokal untuk membantu Anda dengan acara Anda.

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Rencanakan Jam Kode Anda

Pilih sebuah [Hour of Code activity](https://hourofcode.com/learn) untuk kelas Anda dan[review this how-to guide](<%= resolve_url('/how-to') %>)

# Melampaui satu jam kode

<% if @country == 'us' %> Satu Jam Kode hanyalah permulaan. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Sebagian besar organisasi yang menawarkan tutorial Hour of Code juga memiliki kurikulum dan pengembangan profesional yang tersedia. Jika Anda menemukan pelajaran yang Anda sukai, tanyakan tentang melangkah lebih jauh. Untuk membantu Anda memulai, kami telah menyoroti sejumlah [penyedia kurikulum yang akan membantu Anda atau siswa Anda melampaui satu jam.](https://hourofcode.com/beyond)

<% else %> Satu Jam Kode hanyalah permulaan. Sebagian besar organisasi yang menawarkan pelajaran Hour of Code juga memiliki kurikulum yang tersedia untuk melangkah lebih jauh. Untuk membantu Anda memulai, kami telah menyoroti sejumlah [penyedia kurikulum yang akan membantu Anda atau siswa Anda melampaui satu jam.](https://hourofcode.com/beyond)

Code.org juga menawarkan [ kursus sains komputer pengantar ](https://code.org/educate/curriculum/cs-fundamentals-international) yang diterjemahkan ke lebih dari 25 bahasa tanpa biaya kepada Anda atau Anda sekolah. <% end %>

<%= view 'popup_window.js' %>
