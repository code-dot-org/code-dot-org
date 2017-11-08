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

# Bir saat kodu oluşturduğunuz için teşekkürler!

Bilgisayar eğitimini öğrenmek isteyen öğrencilere yaptığınız yardım için teşekkür ederiz. Profesyonel bir şekilde hazırladığımız paketi ücretsiz olarak vermek istiyoruz. </strong>FREEPOSTERS</0> Promosyon kuponunuzdur ücretsiz posterinizi almak için kodu kullanınız. (Not: gönderdiğimiz posterleri ücretsiz kullana bilirsiniz. Almak için sevkiyat ve kargo ücretini sizin ödemeniz gerekli. Posterler Amerika'dan kargolandığı için, Kanada ve diğer ülkelere kargo ücreti oldukça fazla olabilir. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<br /> **Kod Saati projesi <%= campaign_date('full')%> tarihine kadar sürecektir. Yeni uygulamalar ve diğer güncellemeler hakkında sizinle irtibat halinde olacağız. Bu arada, şimdi neler yapabilirsiniz? **

## 1. Okuldakilere ve tanıdıklarınıza Kod Saati'ni duyurun

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](<%= resolve_url('/promote/resources#sample-emails') %>) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Yeni beceriler öğrenmek için okulda olmana gerek yok. Invite a local politician or policy maker to visit your school for the Hour of Code. Bu senin bölgenin bir saat mesafesinde bilgisayar bilimleri desteği oluşturmana yardım edebilir.

Kendi etkinliklerin için posterler, afişler, çıkartmalar, videolar ve daha fazlasını kullan.

## 1. Size yardımcı olacak kendi dilinizde konuşan yerel gönüllüler bulun.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## Kodlama yapmak istediğiniz saatinizi planlayın

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](<%= resolve_url('/how-to') %>).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org sitesi hiçbir ücret ödemeden size, okulunuza veya öğrencilere 25 bilgisayar dillerinin tam eğitimini[bilgisayar giriş dili dersi](https://code.org/educate/curriculum/cs-fundamentals-international)size ücretsiz sunuyor. <% end %>

<%= view 'popup_window.js' %>