---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Melibatkan komuniti anda dalam Hour of Code

## 1. Sebarkan berita ini

Beritahu rakan anda mengenai **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Minta seluruh sekolah anda untuk menawarkan suatu sesi Hour of Code

[Hantarkan e-mel ini](%= resolve_url('/promote/resources#sample-emails') %) kepada pengetua anda dan mencabar setiap kelas di sekolah anda untuk mendaftarkan diri.

## 3. Ajak majikan anda untuk melibatkan diri

[Hantarkan e-mel ini](%= resolve_url('/promote/resources#sample-emails') %) kepada pengurus atau Ketua Pegawai Eksekutif syarikat anda.

## 4. Mempromosikan Hour of Code dalam komuniti anda

[Merekrutkan suatu kumpulan tempatan](%= resolve_url('/promote/resources#sample-emails') %)— kelab pengakap lelaki/perempuan, gereja, universiti, kumpulan veteran, kesatuan buruh, ataupun beberapa orang rakan. Anda tidak perlu untuk berada di sekolah untuk mempelajari kemahiran baru. Gunakan [poster, sepanduk, pelekat, video dan sebagainya](%= resolve_url('/promote/resources') %) ini untuk acara anda sendiri.

## 5. Minta pegawai tempatan yang dilantik untuk menyokong Hour of Code

[Hantarkan e-mel ini](%= resolve_url('/promote/resources#sample-emails') %) kepada wakil-wakil tempatan anda, majlis perbandaran, atau lembaga sekolah dan menjemput mereka untuk melawati sekolah anda bagi acara Hour of Code. Ini boleh membantu membina sokongan terhadap sains komputer di kawasan anda yang melebihi masa satu jam.

<%= view :signup_button %>