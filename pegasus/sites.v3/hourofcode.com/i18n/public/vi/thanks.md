<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Cảm ơn bạn đã đăng ký để tổ chức Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Truyền tải thông điệp

Nói với bạn bè của bạn về #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Đề nghị trường của bạn tổ chức Hour of Code

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Xin phép ông chủ của bạn để tham gia

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Quảng bá chương trình "Hour of Code" trong cộng đồng của bạn

Lập thành các nhóm tại địa phương - nhóm các bạn sinh viên đại học, nhóm những người lớn tuổi, nhóm những người trong độ tuổi lao động. Hoặc tổ chức một sự kiện Hour of Code "block party" cho những người hàng xóm của bạn.

## xin phép chính quyền đìa phương để xác nhận hỗ trợ cho sự kiện "Hour of Code"

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>