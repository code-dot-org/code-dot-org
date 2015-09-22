---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

<%= view :signup_button %>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/resources/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## あなたの学校にこのポスターを貼ってください。

<%= view :promote_posters %>

<a id="banners"></a>

## このバナーをあなたのウェブサイトで取り上げてください

[![画像](/images/fit-250/banner1.jpg)](/images/banner1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/banner3.jpg)](/images/banner3.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-500/banner5.jpg)](/images/banner5.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="social"></a>

## ソーシャル メディアに投稿してください

[![画像](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

[![画像](/images/fit-250/mark.jpg)](/images/mark.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/susan.png)](/images/susan.png)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/chris.jpg)](/images/chris.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/marissa.jpg)](/images/marissa.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/ashton.jpg)](/images/ashton.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![画像](/images/fit-250/barack.jpg)](/images/barack.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="stickers"></a>

## Print these stickers to give to your students (Stickers are 1" diameter, 63 per sheet)

[![画像](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Hour of Code を宣伝するためにこれらのメールを送信してください

<a id="email"></a>

## 学校や社長、友達にサインアップするよう頼んでください:

コンピューターはありふれていますが、コンピューター科学を教える学校は10年前より少なくなっています。 良いお知らせは、私たちはこれを変えようとしているということです。 If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! やディズニーのホームページに掲載されました。 Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

みんなに知らせましょう。イベントを開催しましょう。地元の学校にサインアップをお願いしましょう。それか自分で Hour of Code を試しましょう -- 基礎を学ぶことでだれもが恩恵を受けられます。

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## メディアをあなたのイベントへの参加に招待してください:

**Subject line:** Local school joins mission to introduce students to computer science

コンピューターはありふれていますが、コンピューター科学を教える学校は10年前より少なくなっています。女の子と少数派の人々は深刻な過小評価をされました。良いお知らせは、私たちがこれを変えようとしているということです。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! やディズニーのホームページに掲載されました。 Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

[日付]に、はじまりの集会にご出席いただいて子どもたちが活動を始めるのをご覧いただくよう招待いたします。

Hour of Code は非営利の Code.org と他の 100 以上の組織による計画であり、今日の学生の世代が進んで21世紀の成功のための重要な技術を学ぼうとしているという声明であります。 ぜひご参加ください。

**お問い合わせ:** [名前]、[肩書]、携帯: (212) 555-5555

**とき:** [イベントの日時]

**ところ:** [住所と道順]

ご連絡をお待ちしております。

<a id="parents"></a>

## 保護者に学校のイベントについてお知らせしてください:

保護者各位

私たちは技術に囲まれた世界に住んでいます。 そしてご子弟が将来に向けて選ぶ分野にかかわらず、成功する能力がますます技術の仕組みを理解できるか次第になるであろうということを私たちは知っています。 しかし私たちの中でコンピューター科学を学んでいるのはごく一部に過ぎず、それを勉強している学生は10年前よりも少なくなっています。

だからこそ私たちはコンピューター科学教育週間（12月 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Hour of Code は[学校名]がこのような21世紀の基礎的な技術を進んで教育しようとしていることの声明です。 ご子弟へのプログラミング活動のご提供を続けるために、Hour of Code のイベントを巨大にしていきたいと存じております。 I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

[市町村名]の教育の未来を変えるチャンスです。

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

敬具

校長

<a id="politicians"></a>

## あなたの学校のイベントに地元の政治家を招待してください:

[市長/知事/代表者/議員の名前]様

今日の経済でコンピューターを利用する仕事の数が、その分野に進む学生の数の約3倍であることをご存知ですか。 そしてコンピュータ科学が今日の*あらゆる*産業の基盤であることをご存知ですか。 Yet most of schools don’t teach it. [学校名] ではそれを変えようとしています。

だからこそ私たちはコンピューター科学教育週間（12月 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Hour of Code のイベントにご参加いただき、はじまりの集会で講演いただけるようご招待いたします。 集会は[日時]に[場所]で開催いたします。[県や市の名前]が進んで学生たちに重要な 21 世紀の技術を教えようとしていることを強く言明します。 我々の学生たちが、未来の技術をただ使うだけでなくそれを生み出す最前線にいるということを確認したいと存じます。

[電話番号またはメール アドレス] までご連絡ください。お返事をお待ちしております。

敬具 [名前]、[肩書]

<%= view :signup_button %>