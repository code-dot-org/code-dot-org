* * *

Tiêu đề : Cảm ơn vì bạn đã đăng ký để làm chủ Hour of Code! Khung nhìn : rộng

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Cảm ơn bạn đã đăng ký để làm chủ Hour of Code!

**Mọi**nhà tổ chức Hour of Code sẽ được nhận 10 GB lưu trữ trên Dropbox hoặc $10 tài khoản skype như là món quà cảm ơn. [Chi tiết](/prizes)

<% if @country == 'us' %>

Mang cả [Toàn bộ trường học của bạn tham gia](/us/prizes) để có cơ hội nhận những giải thưởng lớn cho trường của bạn.

<% end %>

## 1. Truyền tải thông điệp

Nói với bạn bè của bạn về #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Đề nghị trường của bạn tổ chức Hour of Code

[Gửi bức thư này](/resources#email) hoặc [Đưa bản viết tay này tới hiệu trưởng nhà trường](/files/schools-handout.pdf). Khi trường của bạn sẵn sàng, [tham gia để ginàh $10,000 giá trị các sản phẩm công nghệ cho trường của bạn](/prizes) và thử thách các trường khác trong khu vực của bạn để tham gia vào chương trình.

<% else %>

## 2. Đề nghị trường của bạn tổ chức Hour of Code

[Gửi bức thư điện tử này](/resources#email) hoặc đưa [bản in này](/files/schools-handout.pdf) tới hiệu trưởng nhà trường.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Lập thành càng nhóm tại địa phương - nhóm các bạn sinh viên đại học, nhóm những người lớn tuổi, nhóm những người trong độ tuổi lao động. Hoặc tổ chức một sự kiện Hour of Code "block party" cho những người hàng xóm của bạn.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>