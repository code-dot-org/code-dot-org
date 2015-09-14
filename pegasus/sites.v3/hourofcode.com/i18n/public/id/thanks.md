<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Terima kasih karena telah mendaftar sebagai penyelengara Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Sebarkan berita

Beritahu temanmu mengenai #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Tawarkan pada seluruh isi sekolah anda untuk mengikuti Hour of Code

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Tanyakanlah kepada bos anda untuk terlibat

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promosikan Hour of Code dalam komunitas Anda

Rekrut kelompok lokal — anak Pramuka, gereja, Universitas, veteran kelompok atau Serikat pekerja. Atau selenggarakan Hour of Code "pesta blok" untuk lingkungan tempat Anda tinggal.

## 5. Tanyakan seorang pejabat terpilih setempat untuk mendukung Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>