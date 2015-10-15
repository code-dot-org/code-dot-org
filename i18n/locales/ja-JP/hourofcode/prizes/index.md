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

# 各主催者に送られる粗品

Hour of Codeを主催していただいた方には 10 GB の Dropbox ストレージを提供します。

<% else %>

## すべての主催者に対する賞品

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

# よくある質問

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## 1万ドル相当のハードウェアの懸賞に申し込むには学校全体での参加が必要ですか？

はい。 Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

この賞は K-12 アメリカの公立学校のみ対象です。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

## なぜ1万ドルのハードウェア賞は公立学校だけが対象なのですか？

私たちは公立と私立の先生を同じように手助けしたいと思っていますが、これは結局はロジスティックスの問題に帰着します。 私たちは、[DonorsChoose.org](http://donorschoose.org)と提携して、クラスルーム賞の資金を管理していますが、この団体は米国のK-12公立高校のみを対象としているためです。 DonorsChoose.orgによると、公立学校用のデータへのアクセスのほうがより正確かつ一貫的に可能とのことです。

## ハードウェア賞への応募締切はいつですか？

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (Dec. 7-13), can I still qualify for prizes?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## 私は米国外に住んでますが、賞への応募資格はありますか？

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>