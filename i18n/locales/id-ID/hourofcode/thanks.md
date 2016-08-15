* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

Anda memungkinkan siswa di seluruh dunia untuk belajar Hour of Code yang dapat *mengubah seluruh hidup mereka*, selama <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. Apa yang dapat Anda lakukan sekarang?

## 1. Sebarkan berita

Anda hanya bergabung dengan gerakan Hour of Code. Beritahu teman Anda dengan **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](%= resolve_url('https://code.org/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Minta seluruh isi sekolah untuk mengikuti Hour of Code

[Kirim email ini](%= resolve_url('/promote/resources#sample-emails') %) kepada kepala sekolah dan tantang setiap kelas di sekolah Anda untuk mendaftar.

## Tanyakan pada bos anda untuk ikut terlibat

[Kirim email ini](%= resolve_url('/promote/resources#sample-emails') %) ke manajer Anda atau CEO perusahaan.

## 5. Promosikan Hour of Code dalam komunitas Anda

[Rekrut kelompok lokal](%= resolve_url('/promote/resources#sample-emails') %) — Pramuka, gereja, Universitas, grup veteran, serikat pekerja, atau bahkan beberapa teman. Anda tidak perlu berada di sekolah untuk belajar keterampilan baru. Gunakan [poster, spanduk, sticker, video ini dan banyak hal lagi](%= resolve_url('/promote/resources') %) untuk acara Anda sendiri.

## 5. Tanyakan pejabat terpilih setempat untuk mendukung Hour of Code

[Kirim email ini](%= resolve_url('/promote/resources#sample-emails') %) ke perwakilan setempat, dewan kota, atau dewan sekolah dan mengundang mereka untuk mengunjungi sekolah Anda untuk Hour of Code. Ini dapat membantu membangun dukungan bagi ilmu komputer di daerah Anda di luar dari sesi satu Hour of Code.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>