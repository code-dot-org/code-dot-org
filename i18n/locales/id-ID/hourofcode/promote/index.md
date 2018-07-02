---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

& lt;%    facebook = {: u => "http: // # {request.host} / us"}

twitter = {: url => "http://hourofcode.com",: related => 'codeorg',: hashtags => '',: text => hoc_s (: twitter_default_text)}    twitter [: hashtags] = 'HourOfCode' kecuali hoc_s (: twitter_default_text) .include? '#HourOfCode' %>

# Mintalah komunitas Anda terlibat dalam Jam Kode

## 1. Sebarkan berita

Beri tahu teman Anda tentang ** #HourOfCode </ strong>!</p> 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Minta seluruh sekolah Anda untuk menawarkan satu Jam Kode

[ Kirimkan email ini ](%= resolve_url('/promote/resources#sample-emails') %) ke kepala sekolah Anda dan tantang setiap kelas di sekolah Anda untuk mendaftar.

## 3. Minta atasan Anda untuk terlibat

[ Kirimkan email ini ](%= resolve_url('/promote/resources#sample-emails') %) ke manajer atau CEO perusahaan Anda.

## 4. Promosikan Jam Kode di komunitas Anda

[ Merekrut grup lokal ](%= resolve_url('/promote/resources#sample-emails') %) - klub pramuka / anak perempuan, gereja, universitas, kelompok veteran, serikat pekerja, atau bahkan beberapa teman. Anda tidak harus bersekolah untuk belajar keterampilan baru. Gunakan [ poster, spanduk, stiker, video, dan lainnya ](%= resolve_url('/promote/resources') %) untuk acara Anda sendiri.

## 5. Minta pejabat terpilih setempat untuk mendukung Hour of Code

[ Kirim email ini ](%= resolve_url('/promote/resources#sample-emails') %) ke perwakilan setempat, dewan kota, atau dewan sekolah Anda dan undang mereka untuk mengunjungi sekolah Anda untuk Jam Kode. Ini bisa membantu membangun dukungan untuk ilmu komputer di daerah Anda lebih dari satu jam.

<%= view :signup_button %>