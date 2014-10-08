---
title: Terima kasih telah mendaftar sebagai penyelenggara Hour of Code!
layout: wide
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

**SETIAP** Penyelenggara Hour of Code akan mendapatkan 10GB Ruang Dropbox atau $10 kredit skype sebagai rasa terima kasih kami untuk anda [Details](/prizes)

<% if @country == 'us' %>

Dapatkan kesempatan memperoleh hadiah besar dengan [mempartisipasikan sekolah anda](/us/prizes).

<% end %>

## 1. Sebarkan berita

Beritahu temanmu mengenai #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirim email ini](/resources#email) atau [berikan selebaran ini kepada kepala sekolah](/files/schools-handout.pdf). Ketika sekolah anda telah tedaftar, [masuk dan menangkan teknologi senilai $10.000 untuk sekolah anda](/prizes) dan tantang sekolah lain di sekitar anda untuk ikut serta.

<% else %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirim email ini](/resources#email) atau berikan [selebaran ini](/files/schools-handout.pdf) kepada kepala sekolah.

<% end %>

## 3. Tanyakanlah kepada boss anda untuk terlibat

[Kirim email ini](/resources#email) kepada manajer atau CEO anda. Atau [berikan selebaran ini kepada mereka](/resources/hoc-one-pager.pdf).

## 4. Promosikan Hour of Code dalam komunitas Anda

Rekrut kelompok lokal — anak Pramuka, gereja, Universitas, veteran kelompok atau Serikat pekerja. Atau selenggarakan Hour of Code "pesta blok" untuk lingkungan tempat Anda tinggal.

## 5. Tanyakan seorang pejabat terpilih setempat untuk mendukung Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>