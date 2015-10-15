* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code prizes

[col-33]

![](/images/fill-275x200/prize1.jpg)

[/col-33]

[col-33]

![](/images/fill-275x200/prize3.png)

[/col-33]

[col-33]

![](/images/fill-275x200/prize4.png)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'la' %>

# 모든 운영자에 대한 상품

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank you gift!

<% else %>

## Prizes for EVERY organizer

Every educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com or Microsoft’s Windows Store** as a thank you gift!

[col-33]

![](/images/fit-100/amazon_giftcards_crop.png)

[/col-33]

[col-33]

![](/images/fit-100/microsoft_giftcards.png)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# 자주 묻는 질문 (FAQ)

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## $10,000 상당의 지원금을 받기 위해서 학교 전체가 모두 참여해야 할까요?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

미국 K-12 학교만 대상으로 합니다. To qualify, your entire school must register for the Hour of Code by November 16, 2015. 미국의 학교들 중, 주별로 한 학교씩 1학급 분량의 컴퓨터들을 받게 될 것입니다. Code.org will select and notify winners via email by December 1, 2015.

## 왜 공립학교들만 $10,000 상당의 하드웨어 지원금(상품)을 받을 기회가 있나요?

공립학교에 있는 교사와 마찬가지로 사립학교들도 지원하고 싶습니다만, 이번에는 계획/절차적 제약때문에 불가능합니다. [DonorsChoose.org](http://donorschoose.org)와 협력 제휴하여 응모한 학급들에게 지원할 수 있는 상품 펀드모금을 진행하였는데, 그 사용은 미국의 K-12 학교들에만 가능합니다. DonorsChoose.org 에 의하면, 공립학교들만 지속적인 관리/지원, 정확한 데이터 분석등이 가능하다고 합니다.

## 하드웨어 지원금(상품)에 응모하기 위한 응모 기한 마감은 언제까지인가요?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. 미국의 학교들 중, 주별로 한 학교씩 1학급 분량의 컴퓨터들을 받게 될 것입니다. Code.org will select and notify winners via email by December 1, 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (Dec. 7-13), can I still qualify for prizes?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## 저는 미국 밖에 있습니다. 저도 상품들에 응모할 수 있나요?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>