* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

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

<%= view :signup_button %>