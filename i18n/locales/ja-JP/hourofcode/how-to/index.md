---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Hour of Codeのイベントを開催する方法</h1>

この活動に参加して、生徒たちにはじめてのコンピュータサイエンスを以下のステップで紹介していきましょう。 Hour of Code(アワーオブコード) は、とっても簡単です。はじめての方でもご心配いりません！ If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](%= resolve_url('/learn') %) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](%= resolve_url('/promote/resources') %) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

The best Hour of Code experience includes Internet-connected computers. But you **don’t** need a computer for every child, and you can even do the Hour of Code without a computer at all.

生徒のコンピュータやデバイスでチュートリアルをテストし、サウンドとビデオのブラウザで正しく動作することを確認してください。 **低帯域幅ですか？**クラスの前に動画を表示して、各生徒が自分の動画をダウンロードしないように計画します。 または、プラグイン/オフラインのチュートリアルを試してみてください。

いくつかのチュートリアルでは、音声が流れます。その場合は、ヘッドフォンもしくはイヤホンを準備するか、生徒に自身のものを持ってきてもらいましょう。

**十分な数のデバイスがないですか？**[ペアプログラミング](https://www.youtube.com/watch?v=vgkahOzFH2Q)の出番です。 2人、もしくは3人の生徒をペアにしてデバイスを共有することで、彼らは教えあい、先生への依存を弱くします。 さらに、彼らはコンピュータサイエンスが一人だけでやるものではないことに気づくでしょう。

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**以下の映像を見せることも非常に効果的です:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- 普段のクラスで、コンピュータが使われているシーンをリストアップしてみましょう。
- See tips for getting girls interested in computer science [here](%= codeorg_url('/girls')%).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](%= resolve_url('/learn')%) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- 私もわからないから、一緒にやってみよう。
- コンピュータは、思った通りに動くとは限らないんだよ
- プログラミングを学ぶということは、新しい言葉を学ぶことと同じなんだ。すぐにペラペラにはなれないよ。

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](%= resolve_url('/learn')%).
- もしくは、困っている他の生徒を助けてあげるように伝えましょう。

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](%= codeorg_url('/certificates')%) for your students.
- [Hour of Codeをやったよ！](%= resolve_url('/promote/resources#stickers') %)のステッカーを印刷して配布する。
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your school.
- Hour of Codeのイベントの様子を撮影した写真や映像をソーシャルメディア上で共有しましょう。 #HourOfCodeハッシュタグを使って、 @codeorgに連絡をすれば、あなたの取り組みをハイライトすることができます！

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Hour of Codeに関する先生向けのその他の資料:

- [Hour of Codeの先生向け掲示板](http://forum.code.org/c/plc/hour-of-code)で、アドバイスをもらったり、他の先生からのサポートを得ることができます。 <% if @country == 'us' %>
- Hour of Codeの[よくある質問](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)を読みましょう。 <% end %>

## Hour of Codeを終えたら？

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

- Encourage students to continue to [learn online](%= codeorg_url('/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>