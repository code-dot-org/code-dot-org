<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Hour of Code! 행사를 개최하는데 가입해 주셔서 감사합니다.

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. 널리 알려주세요.

여러분의 친구들에게 #HourOfCode 를 이야기해 주세요.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 여러분의 모든 학교에 Hour of Code 이벤트 행사를 열어달라고 요청하세요.

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. 여러분의 직장 상사에게 함께 참여하도록 요청해 보세요.

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Hour of Code를 소속 단체나 조직에 안내해 주세요.

지역 소모임과 함께 하세요 - 보이스카웃, 교회, 대학, 각종 단체 등. 또는 지역 주민을 위해 Hour of Code "블록 파티"를 열어 주세요.

## 5. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>