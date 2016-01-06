* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code 상품들

<% if @country == 'la' %>

# 모든 운영자에 대한 상품

학생들을 위해 Hour of Code 행사를 운영하는 모든 교육자들은 감사의 선물로 10GB의 드롭박스 저장 공간을 받게 됩니다.

<% else %>

## 모든 운영자에 대한 상품들

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51개의 학교들은 1학급 분량의 노트북(또는 $10,000 상당의 지원금)을 받게 됩니다.

Sign up for this prize is now closed. Check back to see this year's winners.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="video-chats"></a>

## 30 classrooms will win a video chat with a guest speaker

Lucky classrooms will have the opportunity to talk with guest speakers who will share how computer science has impacted their lives and careers.

[col-33]

![image](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![image](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![image](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![image](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![image](/images/fit-175/Hadi-Partovi.jpg)  
Hadi Partovi   
(Code.org co-founder)   
[Watch live Dec. 11 10 am PST](https://plus.google.com/events/c2e67fd7el3es36sits1fd67prc)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## One lucky classroom will win an exclusive, behind-the-scenes “Making of Star Wars” experience in San Francisco with Disney and Lucasfilm

One lucky classroom will win the grand prize – a trip to San Francisco, CA for an exclusive, behind-the-scenes “Making of Star Wars” experience with the visual effects team who worked on Star Wars: The Force Awakens. The grand prize is courtesy of [ILMxLAB](http://www.ilmxlab.com/), a new laboratory for immersive entertainment, combining the talents of Lucasfilm, Industrial Light & Magic and Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg" />

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## 100 classrooms will win programmable robots including a BB-8 droid robot by Sphero

In honor of Hour of Code tutorial "Star Wars: Building a Galaxy with Code," 100 participating classrooms in the United States or Canada will a set of four Sphero 2.0 robots plus a BB-8™ App-enabled Droid that students can program. Sign up your Hour of Code event to qualify. [Learn more about BB-8 from Sphero](http://sphero.com/starwars) and [about Sphero education](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# 자주 묻는 질문 (FAQ)

## 모든 운영자 감사 선물을 받을 자격이 있는 사람은 누구인가요?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## 모든 운영자 감사 선물을 받기 위한 등록 마감일이 있나요?

여러분이 모든 운영자 감사 선물을 받기 위해서는 <%= campaign_date('start_long') %> **전**에 등록하여야 합니다.

## 언제 저의 감사 선물을 받을 수 있을까요?

컴퓨터과학교육주간 이후 12 월에 연락 드리겠습니다 (< % = campaign_date('full') %>) 선택한 감사 선물을 사용 하는 방법에 대한 다음 단계와 함께.

## 모든 감사의 선물과 교환할 수 있나요?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## $10,000 상당의 지원금을 받기 위해서 학교 전체가 모두 참여해야 할까요?

예 학교 전체가 참여해야 응모 자격이 되는데, 한 분만 [여기를 통해서](%= resolve_url('/prizes/hardware-signup') %) 하드웨어 상품에 응모할 수 있습니다. 참여하는 모든 선생님들은 감사의 선물을 받기 위해서 각 반을 따로 따로[등록](%= resolve_url('/') %) 해야 합니다.

## 누가 $10,000 상당의 하드웨어 상품을 받게 되나요?

미국 K-12 학교만 대상으로 합니다. 응모하려면, Hour of Code 활동을 위한 학교 전체 등록을 2015년 11월16일까지 해야 합니다. 미국의 학교들 중, 주별로 한 학교씩 1학급 분량의 컴퓨터들을 받게 될 것입니다. Code.org 는 2015년12월01일 이전에 해당 학교에 이메일로 알릴 것입니다.

## 왜 공립학교들만 $10,000 상당의 하드웨어 지원금(상품)을 받을 기회가 있나요?

공립학교에 있는 교사와 마찬가지로 사립학교들도 지원하고 싶습니다만, 이번에는 계획/절차적 제약때문에 불가능합니다. [DonorsChoose.org](http://donorschoose.org)와 협력 제휴하여 응모한 학급들에게 지원할 수 있는 상품 펀드모금을 진행하였는데, 그 사용은 미국의 K-12 학교들에만 가능합니다. DonorsChoose.org 에 의하면, 공립학교들만 지속적인 관리/지원, 정확한 데이터 분석등이 가능하다고 합니다.

## 하드웨어 지원금(상품)에 응모하기 위한 응모 기한 마감은 언제까지인가요?

응모하기 위해서는 다음 양식, [하드웨어응모양식](%= resolve_url('/prizes/hardware-signup') %)2015년 11월 16일까지 제출해야 합니다. 미국의 학교들 중, 주별로 한 학교씩 1학급 분량의 컴퓨터들을 받게 될 것입니다. Code.org 는 2015년12월01일 이전에 해당 학교에 이메일로 알릴 것입니다.

## 만약에 컴퓨터과학교육주간(<%= campaign_date('short') %>) 동안에 우리 학교 전체가 참여할 수 없다면, 그래도 상품을 받을 자격이 되나요?

예, 다음 양식 [하드웨어 응모 양식](%= resolve_url('/prizes/hardware-signup') %) 에는 학교 전체가 참여할 수 있는 날짜를 기록하게 되어있습니다.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 초청 연사와 비디오 채팅:

미국과 캐나다의 K(유치원)-12(고등학교)만 대상으로 합니다. Code.org 는 인증받은 학교들 중에서 무작위로 선택하여, 웹 채팅 시간을 할당할 것이며, 그것을 위해 적당한 교사와 함께 기술적인 사항을 준비할 것입니다. 이 상품을 위해 학교 구성원 모두가 등록 확인을 신청할 필요가 없습니다. Both public and private schools are eligible to win.

<% end %>

## 저는 미국 밖에 있습니다. 저도 상품들에 응모할 수 있나요?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>