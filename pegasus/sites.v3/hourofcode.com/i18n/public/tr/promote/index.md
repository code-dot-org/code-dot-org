---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Topluluğunuzu Kod-Saatine dahil edin

## 1. Organizasyonu yayın

Arkadaşlarına **#HourOfCode**'dan bahset!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Okulunuzun Kod-Saati talep etmesini sağlayın

Müdürünüze [bu maili gönderin](<%= resolve_url('/promote/resources#sample-emails') %>) ve tüm sınıfların kayıt olması için mücadele edin.

## 3. İşvereninizin de katılmasını rica edin

Şirket CEO'nuza veya yöneticinize [bu maili gönderin.](<%= resolve_url('/promote/resources#sample-emails') %>).

## 4. Kod-Saati'ni çevrenize tanıtın

[Yerel bir grup](<%= resolve_url('/promote/resources#sample-emails') %>) — kız ya da erkek izci kulübü, kilise, üniversite, gaziler grubu, işçi sendikası veya bazı arkadaşlar toplayın. Yeni beceriler öğrenmek için okulda olmana gerek yok. Bu [ poster, afiş, çıkartma, video ve daha fazlasını](<%= resolve_url('/promote/resources') %>) etkinlik için kullan.

## 5. Yerel yönetim idarelerinden Kod-Saatini desteklemelerini rica edin

[ Bu e-postayı](<%= resolve_url('/promote/resources#sample-emails') %>) yerel temsilcilere, Belediye Meclisine veya okul yönetimi ne gönder ve okuluna Kod-Saatini ziyaret için davet et. Bu, bilgisayar bilimlerini bir saatlik mesafede desteklemene yardım eder.

<%= view :signup_button %>