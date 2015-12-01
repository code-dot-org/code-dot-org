* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Codeの粗品

<% if @country == 'la' %>

# 各主催者に送られる粗品

Hour of Codeイベントの各主催者は、10GB分のDropboxのスペースが"Thank you"ギフトとして授与されます。

<% else %>

## すべての主催者に対する賞品

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

![画像](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![画像](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![画像](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![画像](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![画像](/images/fit-175/Hadi-Partovi.jpg)  
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

# よくある質問

## 誰が"Thank you"ギフトを授与される権利があるのですか？

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## なにか、ギフトを受け取るにあたり登録の期限はありますか？

はい。<%= campaign_date('start_long') %>よりも**前に**、登録をしていただく必要があります。

## いつ、"Thank you"ギフトを受け取ることができますか？

コンピュータサイエンス教育週間(<%= campaign_date('full') %>)が終わった後で、我々の方から次のステップをご案内させていただきます。

## 全ての"Thank you"ギフトを受け取ることができるのですか？

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## 1万ドル相当のハードウェアの懸賞に申し込むには学校全体での参加が必要ですか？

はい。 Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

この賞は K-12 アメリカの公立学校のみ対象です。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

## なぜ1万ドルのハードウェア賞は公立学校だけが対象なのですか？

私たちは公立と私立の先生を同じように手助けしたいと思っていますが、これは結局はロジスティックスの問題に帰着します。 私たちは、[DonorsChoose.org](http://donorschoose.org)と提携して、クラスルーム賞の資金を管理していますが、この団体は米国のK-12公立高校のみを対象としているためです。 DonorsChoose.orgによると、公立学校用のデータへのアクセスのほうがより正確かつ一貫的に可能とのことです。

## ハードウェア賞への応募締切はいつですか？

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

## もしHour of Codeイベントを、コンピュータサイエンス教育週間(<%= campaign_date('short') %>)で行えなかった場合でも、粗品を受け取る権利はありますか？

はい。

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## ゲストで演説される方とのビデオ会話:

賞品は米国およびカナダのK-12の教室に限っております。 Code.org は独自で学校を選考し、web会話の時間帯を提供し、コンピューターに詳しい先生と共に詳細の設定を行います。 学校全体でこの賞品の対象となるための申請をする必要はありません。 Both public and private schools are eligible to win.

<% end %>

## 私は米国外に住んでますが、粗品への応募資格はありますか？

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>