<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Hour of Code 이벤트를 운영해 주시기 위해 등록해 주시는 것에 감사드립니다.

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. 전세계로 전파하기

여러분의 친구들에게 #HourOfCode 를 이야기해 주세요.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 요청하세요.

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>). 여러분의 학교가 등록되면, [$10,000 상당의 학교 상품](/prizes)을 얻을 수 있는 기회를 얻게됩니다. 같은 지역의 학교들과 경쟁해 보세요.

<% else %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 열어달라고 요청하세요.

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>) to your principal.

<% end %>

## 3. 기부를 부탁드립니다.

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 3. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 4. Hour of Code를 소속 단체나 조직에 안내해 주세요.

지역 소모임과 함께 하세요 - 보이스카웃, 교회, 대학, 각종 단체 등. 또는 지역 주민을 위해 Hour of Code "블록 파티"를 열어 주세요.

## 6. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>