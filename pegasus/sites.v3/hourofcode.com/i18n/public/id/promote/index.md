---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Bagaimana cara untuk terlibat

## 1. Daftar untuk mengadakan Hour of Code

Siapaun, dimanapun dapat mengadakan Hour of Code. [Daftar](<%= resolve_url('/') %>) untuk mendapatkan update dan memenuhi syarat untuk hadiah.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Sebarkan berita ini

Beritahukan teman mengenai **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Minta seluruh isi sekolah untuk mengikuti Hour of Code

[Kirim email ini](<%= resolve_url('/promote/resources#sample-emails') %>) kepada kepala sekolah dan tantang setiap kelas di sekolah Anda untuk mendaftar. <% if @country == 'us' %> Salah satu sekolah yang beruntung di *setiap* negara Amerika (dan Washington Dc) akan memenangkan teknolgi senilai $10,000. [Daftar di sini](<%= resolve_url('/prizes/hardware-signup') %>) untuk menjadi layak dan [**lihat pemenang tahun lalu**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## Tanyakan pada bos anda untuk ikut terlibat

[Kirim email ini](<%= resolve_url('/promote/resources#sample-emails') %>) ke manajer Anda atau CEO perusahaan.

## 5. Promosikan Hour of Code dalam komunitas Anda

[Rekrut kelompok lokal](<%= resolve_url('/promote/resources#sample-emails') %>) — Pramuka, gereja, Universitas, grup veteran, serikat pekerja, atau bahkan beberapa teman. Anda tidak perlu berada di sekolah untuk belajar keterampilan baru. Gunakan [poster, spanduk, sticker, video ini dan banyak hal lagi](<%= resolve_url('/promote/resources') %>) untuk acara Anda sendiri.

## 5. Tanyakan pejabat terpilih setempat untuk mendukung Hour of Code

[Kirim email ini](<%= resolve_url('/promote/resources#sample-emails') %>) ke perwakilan setempat, dewan kota, atau dewan sekolah dan mengundang mereka untuk mengunjungi sekolah Anda untuk Hour of Code. Ini dapat membantu membangun dukungan bagi ilmu komputer di daerah Anda di luar dari sesi satu Hour of Code.

