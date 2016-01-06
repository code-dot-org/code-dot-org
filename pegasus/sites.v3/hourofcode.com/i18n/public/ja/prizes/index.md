---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---


# 2015 Hour of Code prizes

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# 各主催者に送られる粗品

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank-you gift!

<% else %>

## すべての主催者に対する賞品

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# よくある質問

## Who is eligible to receive the all organizer thank-you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank-you gift?

You must sign up **before** <%= campaign_date('start_long') %> in order to be eligible to receive the all organizer thank-you gift.

## When will I receive my thank-you gift?

We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options?

No. Thank-you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## 1万ドル相当のハードウェアの懸賞に申し込むには学校全体での参加が必要ですか？

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](<%= resolve_url('/prizes/hardware-signup') %>). Every teacher participating will need to [sign up](<%= resolve_url('/') %>) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

この賞は K-12 アメリカの公立学校のみ対象です。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

## なぜ1万ドルのハードウェア賞は公立学校だけが対象なのですか？

We would love to help teachers in public and private schools alike, but at this time, it comes down to logistics. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## ハードウェア賞への応募締切はいつですか？

To qualify, you must complete the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

<% end %>

## If my whole school can’t do the Hour of Code during Computer Science Education Week (<%= campaign_date('short') %>), can I still qualify for prizes?

Yes, in the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) include the dates that your whole school is participating.

## 私は米国外に住んでますが、賞への応募資格はありますか？

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift. The $10K hardware prize is US only.

<% end %> 