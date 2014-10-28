* * *

title: Thanks for signing up to host an Hour of Code! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Hour of Code 이벤트를 운영해 주시기 위해 등록해 주시는 것에 감사드립니다.

**모든** Hour of Code 조직자들은 10GB의 Dropbox 저장공간 또는 $10 상당의 Skype 크레딧을 감사의 의미로 받게 됩니다. [자세히](/prizes)

<% if @country == 'us' %>

[학교 전체를 참여](/us/prizes)시키고 학교 상품을 받을 기회를 얻으세요.

<% end %>

## 1. 전세계로 전파하기

여러분의 친구들에게 #HourOfCode 를 이야기해 주세요.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 요청하세요.

여러분의 학교장 선생님에게 [이 이메일을 보내거나](/resources#email)[이 유인물](/files/schools-handout.pdf)을 전달해주세요.. 여러분의 학교가 등록되면, [$10,000 상당의 학교 상품](/prizes)을 얻을 수 있는 기회를 얻게됩니다. 같은 지역의 학교들과 경쟁해 보세요.

<% else %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 열어달라고 요청하세요.

[이 이메일이나](/resources#email) [이 유인물을](/files/schools-handout.pdf) 교장선생님께 전달해주세요.

<% end %>

## 3. 기부를 부탁드립니다.

[펀드 모금 클라우딩에 기부해주세요](http://code.org/donate). 1억명의 학생들에게 교육하기 위해 여러분의 도움이 필요합니다. 우리는 역사강 가장 크게 될지 모르는 [교육 클라우드 펀딩](http://code.org/donate)을 시작했습니다. 모든 기부금은, Code.org 의 [주요 기부자](http://code.org/about/donors)에 의한 기부금과 함께 그 의미와 효과를 증대시킬 것입니다.

## 3. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

[이 이메일](/resources#email)을 직장상사나 회사대표에게 보내거나. [이 유인물을 전달해주세요](/resources/hoc-one-pager.pdf).

## 4. Hour of Code를 소속 단체나 조직에 안내해 주세요.

지역 소모임과 함께 하세요 - 보이스카웃, 교회, 대학, 각종 단체 등. 또는 지역 주민을 위해 Hour of Code "블록 파티"를 열어 주세요.

## 6. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

[이 이메일](/resources#politicians)을 지역 시장, 시의회, 학교운영위원회에 보내주세요. 또는 [이 유인물](/resources/hoc-one-pager.pdf)을 보내고, 여러분의 학교에 그들을 초대하세요.

<%= view 'popup_window.js' %>