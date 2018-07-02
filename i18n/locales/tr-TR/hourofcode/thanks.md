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
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Bir saat kodu oluşturduğunuz için teşekkürler!

Bilgisayar eğitimi almak isteyen öğrencilere yaptığınız yardım için teşekkür ederiz. Profesyonel bir şekilde hazırladığımız paketi ücretsiz olarak vermek istiyoruz. </strong>FREEPOSTERS</0> Promosyon kuponunuzdur, posterinizi ücretsiz almak için kodu kullanınız. (Not: gönderdiğimiz posterleri ücretsiz kullanabilirsiniz. Almak için sevkiyat ve kargo ücretini sizin ödemeniz gerekli. Posterler Amerika'dan kargolandığı için, Kanada ve diğer ülkelere kargo ücreti oldukça fazla olabilir. Bunun, bütçenize göre olmayabileceğini düşünüyoruz ve sınıfınız için  PDF dosyalarını </ 0> basmanızı öneriyoruz.)   
<br /> [<button>Poster edinin</button>](https://store.code.org/products/code-org-posters-set-of-12) Bedava poster için teklif kodunu kullanınız</p> 

<% if @country == 'us' %> Ozobot, Dexter Industries, littleBits ve Wonder Workshop sayesinde, derslerde kullanılması amacıyla robot veya devre gönderilecek, bunun için100'den fazla sınıf seçilecek! Bir set almaya hak kazanmak için, Kodlamadan sonra Code.org tarafından gönderilecek anketi doldurmayı unutmayın. Code.org, kazanan derslikleri seçecek. Bu arada bazı robotların devre faaliyetlerine göz atın. Lütfen bunun yalnızca bizim okullarımız için açık olduğunu unutmayın. <% end %>

<br /> **Kod Saati projesi <%= campaign_date('full')%> tarihinde son bulacaktır. Yeni uygulamalar ve diğer güncellemeler hakkında sizinle irtibat halinde olacağız. Bu arada, şuan sizin için ne yapabiliriz? **

## 1. Okuldakilere ve tanıdıklarınıza Kod Saati'ni duyurun

Kodlama Saati organizasyonuna katıldınız. Arkadaşlarınızı**#HourOfCode** etiketi ile haberdar edebilirsiniz

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Başkalarını, [ örnek e-postalarımızla katılmaya teşvik edin](%= resolve_url('/promote/resources#sample-emails') %) Yöneticinizle iletişime geçin ve okuldaki tüm sınıflara başvurmak için kayıt olun. Yakın çevrenizdeki gruplara haber verin — öğrenci kulüpleri, dernekler, üniversiteler, sendikalar ve hatta arkadaş gruplarınız. Yeni nitelikler öğrenmek için okulda olmana gerek yok. Yerel bir politikacı veya politika üreticisini, Kod Saati için okulunuzu ziyaret etmesi için davet edin. Bu, bilgisayar bilimlerini bir saatlik mesafede desteklemene yardım eder.

Bu [ poster, afiş, çıkartma, video ve daha fazlasını](%= resolve_url('/promote/resources') %) etkinlik için kullan.

## 1. Size yardımcı olacak kendi dilinizde konuşan yerel gönüllüler bulun.

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## Kodlama yapmak istediğiniz saatinizi planlayın

Sınıfınız için bir [Kodlama Saati etkinliği](https://hourofcode.com/learn) seçin ve [bu kullanma kılavuzunu inceleyin](%= resolve_url('/how-to') %).

# Kod saatinin ötesine gidin

<% if @country == 'us' %> Kod saati sadece başlangıçtır. Bir yönetici, öğretmen veya avukat iseniz, bilgisayar bilimi derslerini okulunuza getirmenize veya olanaklarınızı genişletmenize yardımcı olacak kaynaklara, meslek gelişimine ve öğretim programına [’a sahibiz.](https://code.org/yourschool) Halihazırda bilgisayar bilimi öğretiyorsanız, yöneticinizden, velilerden ve toplumdan destek almak için CS eğitim haftası boyunca bu kaynakları kullanın.

Okulunuza uygun birçok seçeneğiniz var. Kod saatini sunan öğretici kuruluşların çoğun da müfredat ve profesyonel gelişim mevcut vardır. Eğer istediğiniz bir ders bulursanız, ilerleme isteyebilirsiniz. Başlamanız yardımcı olmak için, sizin veya öğrencilerinizin bir saatten daha da öte gitmenize yardım edecek, bir dizi [müfredat sağlayıcılarını vurguladık](https://hourofcode.com/beyond)

<% else %> Kod saati sadece başlangıçtır. Hour of Code sunan kuruluşların çoğunun ayrıca ilerlemeye hazır müfredatları vardır. Başlamanız yardımcı olmak için, sizin veya öğrencilerinizin bir saatten daha da öte gitmenize yardım edecek, bir dizi [müfredat sağlayıcılarını vurguladık](https://hourofcode.com/beyond)

Code.org sitesi hiçbir ücret talep etmeden, okulunuza veya öğrencilere 25 bilgisayar dillerinin tam eğitimini[bilgisayar giriş dili dersini](https://code.org/educate/curriculum/cs-fundamentals-international)size ücretsiz sunuyor. <% end %>

<%= view 'popup_window.js' %>