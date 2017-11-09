---
title: '<%= hoc_s(:title_how_to_promote) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Get your community involved in the Hour of Code

## 1. Organizasyonu yayın

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Tüm okulun bir Kodlama Saati talep etmesini sağlayın

Müdürünüze [bu maili gönderin](<%= resolve_url('/promote/resources#sample-emails') %>) ve tüm sınıfların kayıt olması için mücadele edin.

## 3. İşvereninizin de katılmasını rica edin

Şirket CEO'nuza veya yöneticinize [bu maili gönderin.](<%= resolve_url('/promote/resources#sample-emails') %>).

## 4. Kodlama Saati'ni çevrenize tanıtın

yerel bir grup,kız ya da erkek izci kulübü,kilise,üniversite,gaziler grubu,işçi sendikası hatta bazı arkadaşlar. Yeni beceriler öğrenmek için okulda olmana gerek yok. Kendi etkinliklerin için posterler, afişler, çıkartmalar, videolar ve daha fazlasını kullan.

## 5. Yerel yönetim idarelerinden Kodlama Saatini desteklemelerini rica edin

Bu e-postayı yerel temsilcilere, belediye meclisine ve okul yönetimine gönder ve onları kod saati için okuluna davet et. Bu senin bölgenin bir saat mesafesinde bilgisayar bilimleri desteği oluşturmana yardım edebilir.

<%= view :signup_button %>