* * *

title: Thanks for signing up to host an Hour of Code! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Hour of Code 이벤트를 운영해 주시기 위해 등록해 주시는 것에 감사드립니다.

**모든** Hour of Code 행사 조직/운영자들은 감사의 표시로 10GB의 Dropbox 저장공간이나 $10 상당의 Skype 크레딧을 받게 됩니다. [상세사항](<%= hoc_uri('/prizes') %>)

## 1. 널리 알려주세요.

여러분의 친구들에게 #HourOfCode 를 이야기해 주세요.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 요청하세요.

[이 이메일을 보내거나](<%= hoc_uri('/resources#email') %>) [이 유인물을](/resources/hoc-one-pager.pdf) 교장 선생님께 전달해 주세요.

<% else %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 열어달라고 요청하세요.

[이 이메일을 보내거나](<%= hoc_uri('/resources#email') %>) [이 유인물과](/resources/hoc-one-pager.pdf) 이 유인물을</a> 교장 선생님께 전달해 주세요.

<% end %>

## 3. 기부를 부탁드립니다.

[우리의 클라우드펀딩 캠페인에 기부해주세요.](http://<%= codeorg_url() %>/donate) 1억명의 아이들에게 교육하기 위해서, 여러분들의 도움이 필요합니다. 우리는 이제 막, 역사상[ 가장 큰 교육적 클라우딩펀딩 캠페인을 시작했습니다](http://<%= codeorg_url() %>/donate). *모든* 기부금들은 [기증자의 의도에 맞게 사용될 것입니다](http://<%= codeorg_url() %>/about/donors), 도움의 효과가 커집니다.

## 4. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

[이 이메일을 보내거나](<%= hoc_uri('/resources#email') %>) [이 유인물을](http://hourofcode.com/resources/hoc-one-pager.pdf) 여러분의 직장 상사, CEO에게 전달해 주세요..

## 5. Hour of Code를 여러분의 소속 단체나 커뮤니티에 홍보해 주세요.

지역 소모임과 함께 하세요 - 보이스카웃, 교회, 대학, 각종 단체 등. 또는 지역 주민을 위해 Hour of Code "블록 파티"를 열어 주세요.

## 6. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

[이 이메일을 ](<%= hoc_uri('/resources#politicians') %>) 여러분의 시장, 시의원, 학교 운영위원회에 보내주세요. 또는 [이 유인물을](http://hourofcode.com/resources/hoc-one-pager.pdf) 보내 여러분의 학교에 초청하세요.

<%= view 'popup_window.js' %>