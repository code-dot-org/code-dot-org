<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Bir Kodlama Saatine ev sahipliği yapmak için kaydolduğunuz için teşekkürler!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Organizasyonu yayın

Arkadaşlarınıza #KodlamaSaati 'ni anlatın.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Tüm okulun bir Kodlama Saati talep etmesini sağlayın

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. İşvereninizin de katılmasını rica edin

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Kodlama Saatini üyesi olduğunuz topluluklarda da tanıtın

Yerel grupları da dahil edin. Ya da komşularınız için bir Kodlama Saati partisi düzenleyin.

## 5. Yerel yönetim idarelerinden Kodlama Saatini desteklemelerini rica edin

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>