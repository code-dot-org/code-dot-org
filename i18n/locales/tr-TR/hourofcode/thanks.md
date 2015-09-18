* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :signup_button %>

# Bir Kodlama Saatine ev sahipliği yapmak için kaydolduğunuz için teşekkürler!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

Ödüller, yeni öğreticiler ve diğer heyecan verici gelişmelerle ilgili önümüzdeki aylarda iletişim halinde olacağız. Peki, şimdi ne yapabilirsin?

## 1. Organizasyonu yayın

Arkadaşlarınıza #KodlamaSaati 'ni anlatın.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Tüm okulun bir Kodlama Saati talep etmesini sağlayın

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. İşvereninizin de katılmasını rica edin

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 4. Kodlama Saatini üyesi olduğunuz topluluklarda da tanıtın

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Yerel yönetim idarelerinden Kodlama Saatini desteklemelerini rica edin

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>

<%= view :signup_button %>