* * *

title: Terima kasih telah mendaftar sebagai penyelenggara Hour of Code! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

**EVERY** penyelenggara Hour of Code akan mendapatkan 10GB ruang pada Dropbox atau $10 kredit sebagai rasa terima kasih. [Details](/prizes)

<% if @country == 'us' %>

Dapatkan kesempatan memperoleh hadiah besar dengan [mempartisipasikan sekolah anda](/us/prizes).

<% end %>

## 1. Sebarkan berita

Beritahu temanmu mengenai #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirim email ini](/resources#email) atau [berikan selebaran ini kepada kepala sekolah](/files/schools-handout.pdf). Setelah sekolah anda telah ikut serta, [masuk dan menangkan teknologi bernilai $10,000 untuk sekolah anda](/prizes) dan tantang sekolah lain di daerahmu untuk ikut serta juga.

<% else %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Kirim email ini](/resources#email) atau berikan [selebaran ini](/files/schools-handout.pdf) kepada kepala sekolah.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Rekrut kelompok lokal — anak Pramuka, gereja, Universitas, veteran kelompok atau Serikat pekerja. Atau selenggarakan Hour of Code "pesta blok" untuk lingkungan tempat Anda tinggal.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>