---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Get your community involved in the Hour of Code

## 1. Sebarkan berita

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirim email ini](<%= resolve_url('/promote/resources#sample-emails') %>) kepada kepala sekolah dan tantang setiap kelas di sekolah Anda untuk mendaftar.

## 3. Tanyakanlah kepada bos anda untuk terlibat

[Kirim email ini](<%= resolve_url('/promote/resources#sample-emails') %>) ke manajer Anda atau CEO perusahaan.

## 4. Promosikan Hour of Code dalam komunitas Anda

[Rekrut kelompok lokal](<%= resolve_url('/promote/resources#sample-emails') %>) — Pramuka, gereja, Universitas, grup veteran, serikat pekerja, atau bahkan beberapa teman. Anda tidak perlu berada di sekolah untuk belajar keterampilan baru. Gunakan [poster, spanduk, sticker, video ini dan banyak hal lagi](<%= resolve_url('/promote/resources') %>) untuk acara Anda sendiri.

## 5. Tanyakan seorang pejabat terpilih setempat untuk mendukung Hour of Code

[Kirim email ini](<%= resolve_url('/promote/resources#sample-emails') %>) ke perwakilan setempat, dewan kota, atau dewan sekolah dan mengundang mereka untuk mengunjungi sekolah Anda untuk Hour of Code. Ini dapat membantu membangun dukungan bagi ilmu komputer di daerah Anda di luar dari sesi satu Hour of Code.

<%= view :signup_button %>