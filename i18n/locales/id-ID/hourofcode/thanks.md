* * *

title: Terima kasih telah mendaftar sebagai penyelenggara Hour of Code! layout: wide

social: "og:title": "<%= hoc\_s(:meta\_tag\_og\_title) %>" "og:description": "<%= hoc\_s(:meta\_tag\_og\_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/srH1OEKB2LE"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc\_s(:meta\_tag\_twitter\_title) %>" "twitter:description": "<%= hoc\_s(:meta\_tag\_twitter\_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv\_load\_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc\_s(:twitter\_default\_text)} twitter[:hashtags] = 'HourOfCode' unless hoc\_s(:twitter\_default\_text).include? '#HourOfCode' %>

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