* * *

başlık: Bir Kodlama Saatine ev sahipliği yapmak için kaydolduğunuz için teşekkürler! düzen: geniş

sosyal: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/srH1OEKB2LE"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Bir Kodlama Saatine ev sahipliği yapmak için kaydolduğunuz için teşekkürler!

Teşekkür olarak **HER** Kodlama Saati organizatörü 10 GB'lık Dropbox alanı veya 10$'lık Skype kredisi kazanacaktır. [Detaylar](/prizes)

<% if @country == 'us' %>

[Tüm okulunuzu dahil edin](/us/prizes), böylece tüm okul için büyük ödüller elde edebilirsiniz.

<% end %>

## 1. Organizasyonu yayın

Arkadaşlarınıza #KodlamaSaati 'ni anlatın.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Tüm okulun bir Kodlama Saati talep etmesini sağlayın

[Bu e-postayı gönderin](/resources#email) veya [bu el ilanını okul müdürünüze verin](/files/schools-handout.pdf). Tüm okulunuz da katıldığında [okulunuz için 10.000$ değerinde teknoloji ödülünü kazanmak için yarışabilirsiniz](/prizes) ve çevredeki diğer okullara da meydan okuyarak onların da katılmasını sağlayabilirsiniz.

<% else %>

## 2. Tüm okulun bir Kodlama Saati talep etmesini sağlayın

[Bu e-postayı gönderin](/resources#email) veya okul müdürünüze [bu el ilanını](/files/schools-handout.pdf) verin.

<% end %>

## 3. Cömert bir bağış yapın

[Büyük bir topluluğa fayda sağlayan etkinliğimize bağış yapın](http://code.org/donate). 100 milyon öğrenciye ulaşabilmemiz için desteğinize ihtiyacımız var. Tarihin [bir topluluğa fayda sağlayan en büyük eğitim kampanyasını](http://code.org/donate) henüz başlattık. Her dolar Code.org'un büyük [bağışçıları](http://code.org/about/donors) tarafından eşleştirilerek etki iki katına çıkarılacaktır.

## İş vereninizden de etkinliğe dahil olmasını rica edin

[Bu e-postayı](/resources#email) müdürünüze veya şirket CEO'suna yollayın. Ya da [onlara bu el ilanını verin](/resources/hoc-one-pager.pdf).

## 5. Kodlama Saatini çevrenizde destekleyin

Yerel grupları da dahil edin. Ya da komşularınız için bir Kodlama Saati partisi düzenleyin.

## 5. Yerel yönetim idarelerinden Kodlama Saatini desteklemelerini isteyin

[Bu e-postayı](/resources#politicians) belediye başkanınıza, ilçe meclisinize veya okulların idari kadrolarına gönderin. Ya da onlara [bu el ilanını](/resources/hoc-one-pager.pdf) verin ve onları okulunuza davet edin.

<%= view 'popup_window.js' %>