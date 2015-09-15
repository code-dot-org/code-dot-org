* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# Cảm ơn bạn đã đăng ký để tổ chức Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Truyền tải thông điệp

Nói với bạn bè của bạn về #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Đề nghị trường của bạn tổ chức Hour of Code

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Xin phép ông chủ của bạn để tham gia

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 4. Quảng bá chương trình "Hour of Code" trong cộng đồng của bạn

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## xin phép chính quyền đìa phương để xác nhận hỗ trợ cho sự kiện "Hour of Code"

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>