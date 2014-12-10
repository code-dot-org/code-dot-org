* * *

title: Terima kasih telah mendaftar sebagai penyelenggara Hour of Code! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

**SETIAP** penyelenggara Hour of Code akan menerima 10 GB ruang Dropbox atau $10 kredit dari Skype sebagai terima kasih. </p> 

## 1. Sebarkan berita

Beritahu temanmu mengenai #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirimkan email ini](<%= hoc_uri('/resources#email') %>) atau [selebaran ini](/resources/hoc-one-pager.pdf) kepada kepala sekolah anda.

<% else %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirimkan email ini](<%= hoc_uri('/resources#email') %>) atau berikan [selebaran ini](/resources/hoc-one-pager.pdf) selebaran ini</a> kepada kepala sekolah anda.

<% end %>

## 3. Menyumbangkan dengan murah hati

[Berikanlah sumbangan gerakan crowdfunding kami](http://<%= codeorg_url() %>/donate). Untuk mengaja 100 juta anak, kami ingin bantuan anda. Kami baru saja meluncurkan <a href="http://<%= codeorg_url() %>/ " kampanye pengumpulan dana pendidikan terbesar</a> dalam sejarah. *Setiap* dollar akan disesuaikan dengan [donor-donor](http://<%= codeorg_url() %>/about/donors), itu akan mengadakan dampak.

## Tanyakan pada bos anda untuk ikut terlibat

[Kirimkan ema ini](<%= hoc_uri('/resources#email') %>) kepada manager, atau CEO. Atau [berikan selebaran ini](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promosikan Hour of Code dalam komunitas Anda

Rekrut kelompok lokal — anak Pramuka, gereja, Universitas, veteran kelompok atau Serikat pekerja. Atau selenggarakan Hour of Code "pesta blok" untuk lingkungan tempat Anda tinggal.

## 5. Tanyakan seorang pejabat terpilih setempat untuk mendukung Hour of Code

[Kirimkan email ini](<%= hoc_uri('/resources#politicians') %>) kepada walikota, dewan kota, or dewan sekolah. Atau [berikan mereka handout ini](http://hourofcode.com/resources/hoc-one-pager.pdf) dan undang mereka untuk mengunjungi sekolah Anda.

<%= view 'popup_window.js' %>