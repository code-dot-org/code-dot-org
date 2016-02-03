* * *

title: <%= hoc_s(:title_how_to) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# How to teach one Hour of Code in after-school

## 1) 登録

  * 以下の期間に[Hour of Code](%= resolve_url('/') %)のイベントを開催するために、登録を行う: <%= campaign_date('short') %>.
  * あなたの[Hour of Codeのイベント](%= resolve_url('/promote') %)を宣伝して、他の人を巻き込む。

## 2) 以下の、ビデオを視聴する <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) チュートリアルを選択する:

We’ll host a variety of [fun, hour-long tutorials](%= resolve_url('https://code.org/learn') %) for participants all ages, created by a variety of partners. *新しいチュートリアルは、<%= campaign_date('full') %>までに順次公開されます。*[まずは、現在公開されているチュートリアルを試してみましょう。](%= resolve_url("https://code.org/learn") %)

**すべてのHour of Codeのチュートリアルは、以下の様に構成されています：**

  * Require minimal prep-time for organizers
  * 自分のペースで自分のレベルにあったものに取り組める、自習式の教材

[![](/images/fit-700/tutorials.png)](%= resolve_url('https://code.org/learn') %)

## 4) どんな環境が必要かプランを立てる

Hour of Codeは、インターネットに接続されたコンピュータで最もやりやすいように構成されています。一方で、それぞれの生徒にコンピュータがある必要は**ありません**。もしコンピュータが準備できない場合、コンピュータなしでもHour of Codeができるチュートリアルも準備しています。

  * チュートリアルを、生徒のデバイス上でテストしましょう。ブラウザー上で、音声や映像がしっかり流れるか確認しましょう。
  * Provide headphones, or ask participants to bring their own, if the tutorial you choose works best with sound.
  * **十分な数のデバイスがないですか？**[ペアプログラミング](https://www.youtube.com/watch?v=vgkahOzFH2Q)の出番です。 子供たちがパートナーを組むと、主催者にあまり頼らずにお互い助け合いながら進めることができます。 さらに、彼らはコンピュータサイエンスが一人だけでやるものではないことに気づくでしょう。
  * **Have low bandwidth?** Plan to project videos onto a big screen, so everyone isn't downloading their own videos. Or try the unplugged / offline tutorials.

![](/images/fit-350/group_ipad.jpg)

## 5) 最初に、Hour of Codeの意義を伝えましょう

まず、コンピュータサイエンスがどのように我々の生活にインパクトを与えているのか伝えましょう。

**以下の映像を見せることも非常に効果的です:**

  * オリジナルのCode.orgはビル・ゲイツ、マーク・ザッカーバーグ、NBAスターのクリス・ボッシュが出演されているビデオをリリースしています。 (それらは [1 分](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 分](https://www.youtube.com/watch?v=nKIu9yen5nc), そして[9分](https://www.youtube.com/watch?v=dU1xS07N-FA) バージョンがあります。)
  * [Hour of Code 2015年度版のビデオ](https://www.youtube.com/watch?v=7L97YMYqLHc)か、<% if @country == 'uk' %> [2013年度版のビデオ](https://www.youtube.com/watch?v=FC5FbmsH4fw)をみる。 <% else %> <% end %>
  * [アメリカのオバマ大統領が生徒たちにコンピュータサイエンスを学ぶよう呼びかけてる映像もあります。](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * その他の映像は[こちら](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are both brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

  * Explain ways technology impacts our lives, with examples both boys and girls will care about (Talk about apps and technology that is used to save lives, help people, connect people etc).
  * List things that use code in everyday life.
  * 女子生徒にコンピュータサイエンスに[興味を持たせる工夫を見てみる](%= resolve_url('https://code.org/girls') %).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

**もっと多くのアイデアがほしい？** 経験豊富な先生達の[ベストプラクティス](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)を見てみましょう。

## 6) プログラミング(コードの時間）！

**参加者をガイドする**

  * 黒板に、チュートリアルへのリンクを書きましょう。リンクは、[こちら](%= resolve_url('https://code.org/learn') %)から取得できます。

**When someone comes across difficulties it's okay to respond:**

  * 私もわからないから、一緒にやってみよう。
  * コンピュータは、思った通りに動くとは限らないんだよ
  * プログラミングを学ぶということは、新しい言葉を学ぶことと同じなんだ。すぐにペラペラにはなれないよ。

**早く終わってしまった生徒はどうすれば良い？**

  * Encourage participants to try another Hour of Code activity at [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %)
  * Or, ask those who finish early to help others who are having trouble.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) クロージング

  * [認定書](%= resolve_url('https://code.org/certificates') %)を印刷して、配布しましょう。
  * [Hour of Codeをやったよ！](%= resolve_url('/promote/resources#stickers') %)のステッカーを印刷して配布する。
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your students.
  * Hour of Codeのイベントの様子を撮影した写真や映像をソーシャルメディア上で共有しましょう。 #HourOfCodeハッシュタグを使って、 @codeorgに連絡をすれば、あなたの取り組みをハイライトすることができます！

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Hour of Codeに関する先生向けのその他の資料:

  * Use this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx) to organize your Hour of Code.
  * Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers. 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
  * Hour of Codeの[よくある質問](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)を読みましょう。 <% end %>

## Hour of Codeを終えたら？

Hour of Codeは、あくまでコンピュータやアプリケーションがどうやって作られているのかを理解する最初の一歩にすぎません。 To continue this journey: - The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](%= resolve_url('https://code.org/learn/beyond') %).
  * [Attend](%= resolve_url('https://code.org/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>