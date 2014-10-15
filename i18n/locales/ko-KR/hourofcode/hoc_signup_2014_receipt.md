* * *

from: '"Hadi Partovi (Code.org)" hadi_partovi@code.org' subject: Thanks for signing up to host an Hour of Code! view: none theme: none view: none theme: none

* * *

<% hostname = CDO.canonical_hostname('hourofcode.com') %>

# Hour of Code! 행사를 개최하는데 가입해 주셔서 감사합니다.

**모든**Hour of Code 개최자는 10GB의 Dropbox 공간이나 $10 상당의 Skype 머니를 드립니다. [자세히](http://<%= hostname %>/prizes)

<% if @country == 'us' %>

여러분의 [학교 전체를 참여](http://<%= hostname %>/whole-school) 시켜 학교별 상품을 받을 수 있는 기회를 얻어보세요.

<% end %>

## 1. 전세계로 전파하기

여러분의 친구들에게 #HourOfCode 를 이야기해 주세요.

<% if @country == 'us' %>

## 2. 여러분의 모든 학교에 Hour of Code 를 요청하세요.

[이메일 보내기](http://<%= hostname %>/resources#email) 또는 [교장선생님에게 이 안내자료를 전달해 주세요.](http://<%= hostname %>/files/schools-handout.pdf) 학교가 등록되면, [$10,000 상당의 학교 상품을 위해,](http://<%= hostname %>/prizes) 그리고 지역의 다른 학교들과 경쟁하고 비교해 보세요.

<% else %>

## 2. 여러분의 모든 학교에 Hour of Code 를 요청하세요.

[이메일 보내기](http://<%= hostname %>/resources#email) 또는 [교장선생님에게 이 안내자료를 전달해 주세요.](http://<%= hostname %>/files/schools-handout.pdf)

<% end %>

## 3. 여러분의 직장 상사에게 함께 할 수 있도록 요청해 보세요.

[이메일 보내기](http://<%= hostname %>/resources#email) 직장 상사 또는 회사대표에게 [이 안내자료를 전달해 주세요.](http://<%= hostname %>/resources/hoc-one-pager.pdf).

## 4. Hour of Code를 소속 단체나 조직에 안내해 주세요.

지역 소모임과 함께 하세요 - 보이스카웃, 교회, 대학, 각종 단체 등. 또는 지역 주민을 위해 Hour of Code "블록 파티"를 열어 주세요.

## 5. 지역 의원 등에게 Hour of Code 를 지원해달라고 요청하세요.

[Send this email](http://<%= hostname %>/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](http://<%= hostname %>/resources/hoc-one-pager.pdf) and invite them to visit your school.

<% if @country == 'ro' %>

Multumim ca ne-ai anuntat despre evenimentul tau! Anunta-ne daca doresti informatii suplimentare sau daca ai intrebari. Hai sa facem istorie impreuna!

Echipa Hour of Code Romania hoc@adfaber.org

<% end %>

* * *

Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't like these emails? [Unsubscribe](%= unsubscribe_link %).

![](<%= tracking_pixel %>)