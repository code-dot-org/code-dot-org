---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<%= view :signup_button %>

# Terima kasih telah mendaftar untuk kesempatan memenangkan hadiah hardware $10.000

Seluruh sekolah Anda sekarang masuk untuk memenangkan serangkaian laptop (atau teknologi lain senilai $10.000). Kami akan meninjau aplikasi Anda dan mengumumkan pemenang pada bulan Desember.

## 1. Sebarkan berita

Beritahu temanmu mengenai #HourOfCode.

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirim email ini](<%= resolve_url('/promote/resources#email') %>) ke kepala sekolah Anda.

## 3. Tanyakanlah kepada bos anda untuk terlibat

[Kirim email ini](<%= resolve_url('/promote/resources#email') %>) ke manajer Anda, atau CEO.

## 4. Promosikan Jam Kode di komunitas Anda

Ajak kelompok masayarakat — Pramuka, kelompok pengajian/gereja, unit mahasiswa, pensiunan atau serikat pekerja. Atau selenggarakan "hajatan" Jam Kode untuk masyarakat di lingkunganmu. [Kirim email ini](<%= resolve_url('/promote/resources#email') %>).

## 5. Tanyakan seorang pejabat terpilih setempat untuk mendukung Hour of Code

[Kirim email ini](<%= resolve_url('/promote/resources#politicians') %>) ke Walikota, Dewan kota, atau dewan sekolah dan undang mereka untuk mengunjungi sekolah Anda.

<%= view :signup_button %>