---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

# Hour of Codeのイベントを開催する方法

## 1) 登録

  * 以下の期間に[Hour of Code](<%= resolve_url('/') %>)のイベントを開催するために、登録を行う: <%= campaign_date('short') %>.
  * あなたの[Hour of Codeのイベント](<%= resolve_url('/promote') %>)を宣伝して、他の人を巻き込む。

## 2) 以下の、ビデオを視聴する <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) チュートリアルを選択する:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for students of all ages, created by a variety of partners. *New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.*

**[Student-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/learn") %>)**

  * 先生方が準備に必要な時間を可能な限り短くする
  * 自分のペースで自分のレベルにあったものに取り組める、自習式の教材。

**[Teacher-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/educate/teacher-led") %>)**

  * Are lesson plans that require some advance teacher preparation
  * Are categorized by grade level *and* by subject area (eg Math, English, etc)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) どんな環境が必要かプランを立てる

Hour of Codeは、インターネットに接続されたコンピュータで最もやりやすいように構成されています。一方で、それぞれの生徒にコンピュータがある必要は**ありません**。もしコンピュータが準備できない場合、コンピュータなしでもHour of Codeができるチュートリアルも準備しています。

  * チュートリアルを、生徒のデバイス上でテストしましょう。ブラウザー上で、音声や映像がしっかり流れるか確認しましょう。
  * いくつかのチュートリアルでは、音声が流れます。その場合は、ヘッドフォンもしくはイヤホンを準備するか、生徒に自身のものを持ってきてもらいましょう。
  * **十分な数のデバイスがないですか？**[ペアプログラミング](https://www.youtube.com/watch?v=vgkahOzFH2Q)の出番です。 2人、もしくは3人の生徒をペアにしてデバイスを共有することで、彼らは教えあい、先生への依存を弱くします。 さらに、彼らはコンピュータサイエンスが一人だけでやるものではないことに気づくでしょう。
  * **ネット通信速度が遅い？**教室の前で生徒全員でビデオを鑑賞するようにしてください。そうすれば各自が個別にビデオをダウンロードする必要はありません。もしくは 電源なし/オフラインでのチュートリアルを試してください。

![](/images/fit-350/group_ipad.jpg)

## 5) 実際に、Hour of Codeのイベントを始めましょう

**Invite a [local volunteer](https://code.org/volunteer/local) to inspire your students by talking about the breadth of possibilities with computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code. [Use this map](https://code.org/volunteer/local) to find local volunteers who can visit your classroom or join a video chat with your students.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**以下の映像を見せることも非常に効果的です:**

  * オリジナルのCode.orgはビル・ゲイツ、マーク・ザッカーバーグ、NBAスターのクリス・ボッシュが出演されているビデオをリリースしています。 (それらは [1 分](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 分](https://www.youtube.com/watch?v=nKIu9yen5nc), そして[9分](https://www.youtube.com/watch?v=dU1xS07N-FA) バージョンがあります。)
  * [Hour of Code 2015年度版のビデオ](https://www.youtube.com/watch?v=7L97YMYqLHc)か、<% if @country == 'uk' %> [2013年度版のビデオ](https://www.youtube.com/watch?v=FC5FbmsH4fw)をみる。 <% else %> <% end %>
  * [アメリカのオバマ大統領が生徒たちにコンピュータサイエンスを学ぶよう呼びかけてる映像もあります。](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * その他の映像は[こちら](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**あなた自身、もしくは生徒達、もしくはその両方がコンピュータサイエンスを学んだことがなくても、全く問題はありません。以下のようなアクティビティをやってみると良いでしょう。**

  * なぜ、コンピュータが我々の生活に大きなインパクトを与えているのか、男の子も女の子も興味を持つ分野の実例を交えて（例えば、コンピュータが医療の分野でどの様に使われているのか、人々を助けるためにどんな役割を担っているのか、もしくは人々を国境を超えてつなげるためにどんなアプリケーションが使われているのか）説明してみましょう。
  * 普段のクラスで、コンピュータが使われているシーンをリストアップしてみましょう。
  * 女子生徒にコンピュータサイエンスに[興味を持たせる工夫を見てみる](<%= resolve_url('https://code.org/girls') %>).

**もう少し詳しく知りたいですか？**[こちらのレッスンプラン](/files/EducatorHourofCodeLessonPlanOutline.docx)をダウンロードすることをお勧めします。.

**もっと多くのアイデアがほしい？** 経験豊富な先生達の[ベストプラクティス](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)を見てみましょう。

## 6) プログラミング(コードの時間）！

**生徒に何をするのか指示しましょう**

  * 黒板に、チュートリアルへのリンクを書きましょう。リンクは、[こちら](<%= resolve_url('https://code.org/learn') %>)から取得できます。

**もし生徒があなたに質問をしてきたら、以下の様に返答しても大丈夫です:**

  * 私もわからないから、一緒にやってみよう。
  * コンピュータは、思った通りに動くとは限らないんだよ
  * プログラミングを学ぶということは、新しい言葉を学ぶことと同じなんだ。すぐにペラペラにはなれないよ。

**[Check out these teaching tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**もし生徒がはやく終わってしまったらどうすれば良い？**

  * 生徒は、他のチュートリアルや他のHour of Codeのアクティビティを以下で見ることができます[<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * もしくは、困っている他の生徒を助けてあげるように伝えましょう。

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

  * [認定書](<%= resolve_url('https://code.org/certificates') %>)を印刷して、配布しましょう。
  * [Hour of Codeをやったよ！](<%= resolve_url('/promote/resources#stickers') %>)のステッカーを印刷して配布する。
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your school.
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

  * まずは、[こちらのレッスンプラン](/files/EducatorHourofCodeLessonPlanOutline.docx)をダウンロードしてみることをお勧めします。
  * 過去にHour of Codeを開催した先生方の[ベストプラクティス](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)を見てみましょう。 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * [Hour of Codeの先生向け掲示板](http://forum.code.org/c/plc/hour-of-code)で、アドバイスをもらったり、他の先生からのサポートを得ることができます。 <% if @country == 'us' %>
  * Hour of Codeの[よくある質問](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)を読みましょう。 <% end %>

## Hour of Codeを終えたら？

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

