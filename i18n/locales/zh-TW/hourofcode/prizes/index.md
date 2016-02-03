* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code prizes

<% if @country == 'la' %>

# 給所有組織者的獎勵

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank-you gift!

<% else %>

## Prizes for EVERY organizer

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

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

![圖片](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![圖片](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![圖片](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![圖片](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![圖片](/images/fit-175/Hadi-Partovi.jpg)  
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

# 常見問題與解答

## Who is eligible to receive the all organizer thank-you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank-you gift?

You must sign up **before** <%= campaign_date('start_long') %> in order to be eligible to receive the all organizer thank-you gift.

## When will I receive my thank-you gift?

We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## 是否全校都需要參加才能贏得價值 $10,000 美元的硬體呢？

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

公共 K 12 美國的學校僅限於獎。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. 在每個美國州一所學校將收到一類組的電腦。 Code.org will select and notify winners via email by December 1, 2015.

## 為甚麼價值一萬美元的硬體獎勵只提供給公立學校？

我們很樂意説明教師在公立和私立學校一致好評，但在這個時候，可以歸結為後勤。 我們與 [DonorsChoose.org](http://donorschoose.org) 成為伙伴，管理班級的獎金獎品，其中僅適用于公共，美國 k-12 學校合作。 根據 DonorsChoose.org，該組織能更有效地為公立學校存取一致、 準確的資料。

## 硬件獎申請的截止日期是什麼時候?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. 在每個美國州一所學校將收到一類組的電腦。 Code.org will select and notify winners via email by December 1, 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (<%= campaign_date('short') %>), can I still qualify for prizes?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 視頻聊天的特邀演講者：

K 12 間教室在美國和加拿大只限于獎。 Code.org 將選擇獲獎教室、 網路聊天，為提供一段時間和工作適當的教師，以設置的技術詳細資訊。 你整個的學校不需要申請領取這一獎項。 Both public and private schools are eligible to win.

<% end %>

## 我是美國以外的國家。可以領取獎品?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>