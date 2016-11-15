---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Bir Kodlama Saatine ev sahipliği yapmak için kaydolduğunuz için teşekkürler!

Dünya'nın her yerinden öğrencilerin *tüm hayatlarını değiştirebilecek* bir Kodlama Saati öğrenmelerini sağlayabilirsiniz. Yeni öğreticiler ve diğer ilginç güncellemeler hakkında sizi haberdar edeceğiz. Şimdi neler yapıyorsun?

## 1. Organizasyonu yayın

Sen Kodlama Saati hareketine katıldın. Arkadaşlarına **#HourOfCode** etiketi ile haber ver!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 1. Etkinliğiniz için size yardımcı olacak yerel gönüllüler bulun.

Öğrencilerinize bilgisayar bilimindeki tüm olasılıklar hakkında ilham verebilecek, sınıfınızı ziyaret edebilecek veya uzaktan video chat yapabilecek gönüllüleri bulmak için [gönüllü haritamızda arama yapın](https://code. org/volunteer/local).

## Tüm okulun Kodlama Saati'ne katılmasını isteyin

Müdürünüze [bu maili gönderin](<%= resolve_url('/promote/resources#sample-emails') %>) ve tüm sınıfların kayıt olması için mücadele edin.

## İş vereninizden de etkinliğe dahil olmasını rica edin

Şirket CEO'nuza veya yöneticinize [bu maili gönderin.](<%= resolve_url('/promote/resources#sample-emails') %>).

## 5. Kodlama Saati'ni çevrenize tanıtın

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 5. Yerel yönetim idarelerinden Kodlama Saatini desteklemelerini isteyin

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

## 8. Go beyond an Hour of Code

Ready to go beyond an hour? Check out [our full courses and teacher resources](<%= resolve_url('https://code.org/teach')%>) including professional learning opportunities for elementary, middle and high school teachers.

<%= view 'popup_window.js' %>