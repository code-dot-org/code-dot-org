---
title: '<%= hoc_s(:title_signup_thanks) %>'
layout: wide
nav: how_to_nav
social:
  "og:title": '<%= hoc_s(:meta_tag_og_title) %>'
  "og:description": '<%= hoc_s(:meta_tag_og_description) %>'
  "og:image": 'http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png'
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": 'http://<%=request.host%>'
  "twitter:card": player
  "twitter:site": '@codeorg'
  "twitter:url": 'http://<%=request.host%>'
  "twitter:title": '<%= hoc_s(:meta_tag_twitter_title) %>'
  "twitter:description": '<%= hoc_s(:meta_tag_twitter_description) %>'
  "twitter:image:src": 'http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png'
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

Sebagai bentuk terima kasih atas bantuan Anda yang memungkinkan para siswa mulai belajar ilmu komputer, kami ingin memberi Anda sebuah paket poster cetak profesional yang menampilkan beragam teladan untuk kelas Anda. Gunakan kode penawaran **FREEPOSTERS** saat checkout. (Catatan: ini hanya ada selama persediaan masih tersedia dan Anda perlu menanggung biaya pengiriman. Since these posters ship from the United States, shipping costs can be quite high if shipping to Canada and internationally. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<br /> **Hour of Code runs during <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Sebarkan informasi ini di sekolah dan komunitas Anda

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Ajak orang lain berpartisipasi [dengan email contoh kami.](%= resolve_url('/promote/resources#sample-emails') %) Hubungi kepala sekolahmu dan tantang setiap kelas di sekolahmu untuk mendaftar. Ajak kelompok masayarakat — Pramuka, kelompok pengajian/gereja, unit mahasiswa, pensiunan atau serikat pekerja. Anda tidak perlu berada di sekolah untuk belajar keterampilan baru. Undang politisi atau pembuat kebijakan untuk mengunjungi sekolah Anda untuk Hour of Code. Ini dapat membantu membangun dukungan bagi ilmu komputer di daerah Anda di luar dari sesi satu Hour of Code.

Gunakan [poster, spanduk, sticker, video ini dan banyak hal lagi](%= resolve_url('/promote/resources') %) untuk acara Anda sendiri.

## 2. Temukan sukarelawan lokal untuk membantu Anda dengan acara Anda.

[Search our volunteer map](%= resolve_url('https://code.org/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>