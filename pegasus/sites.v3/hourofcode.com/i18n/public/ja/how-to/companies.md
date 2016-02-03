---

title: <%= hoc_s(:title_how_to_companies) %>
layout: wide
nav: how_to_nav

---


# Hour of Codeを企業で開催する方法

**あなたの会社がHour of Code、そしてコンピュータサイエンス教育に貢献できる方法は一つではありません。例えば:**

  * Use our [marketing toolkit](<%= localized_file('/files/HourOfCodeInternalMarketingToolkit.pdf') %>) to create a communications timeline and share promotional content.
  * Asking your CEO to send a company-wide email emphasizing the importance of computer science and encouraging employees to spread the word. [See this email](<%= resolve_url('/promote/resources#sample-emails') %>).
  * Hosting an Hour of Code Happy Hour with coworkers to try the [tutorials](<%= resolve_url('https://code.org/learn') %>).
  * Inviting a local classroom of students or other non profits you partner with to do an Hour of Code at your company’s office.
  * Encouraging **software engineers** at your company to visit a local classroom to help lead an Hour of Code and inspire students to study computer science. [ここから](<%= resolve_url('https://code.org/volunteer/engineer') %>)登録して、学校とつながることができます。
  * For more instructions on connecting your employees with classrooms, use our [guide for corporate partners](<%= localized_file('/files/HourOfCodeGuideForCorporatePartners.pdf') %>)

## Hour of Codeのイベントを、企業で開催する方法

## 1) 登録

  * [<%= campaign_date('short') %>にHour of Code](<%= resolve_url('/') %>)のイベント開催が決まったら、こちらから登録しましょう。
  * [あなたのHour of Codeのイベントを宣伝](<%= resolve_url('/promote') %>)しましょう。
  * あなたの会社の**ソフトウェアエンジニア**の方々に、地域の学校を訪問してHour of Codeのイベントを手助けすることを奨励する。 [ここから](<%= resolve_url('https://code.org/volunteer/engineer') %>)登録して、学校とつながることができます。

## 2) 以下の、ビデオを視聴する <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) チュートリアルを選択する:

様々な年齢を対象として、様々なパートナーから提供された[沢山のチュートリアル](<%= resolve_url('https://code.org/learn') %>)が準備されています。 *新しいチュートリアルは、<%= campaign_date('full') %>までに順次公開されます。*[まずは、現在公開されているチュートリアルを試してみましょう。](<%= resolve_url("https://code.org/learn") %>)

**すべてのHour of Codeのチュートリアルは、以下の様に構成されています：**

  * 準備に必要な時間は、可能な限り短くしています
  * 自習可能な教材です。全ての生徒は、自分のペースやスキルにあわせて進めることができます。

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) どんな環境が必要かプランを立てる

インターネット接続されたコンピューターがHour of Code に取り組む最良の環境です。 一方で、**必ずしも**一人一台のコンピュータは必要ありません。さらに言えば、コンピュータがない環境でもHour of Codeを行うこともできます。

  * 事前に、イベントで利用するデバイスでチュートリアルをテストしておきましょう。音声やビデオの確認も忘れずに。
  * もし、あなたが選択したチュートリアルで音声が必要であれば、ヘッドフォンを生徒に持ってきてもらうことも考えましょう。
  * **十分な数のデバイスがないですか？**[ペアプログラミング](https://www.youtube.com/watch?v=vgkahOzFH2Q)の出番です。 参加者に、二人一組になってもらいましょう。 さらに、彼らはコンピュータサイエンスが一人だけでやるものではないことに気づくでしょう。
  * もしコンピュータがない場合、[アンプラグド・オフラインチュートリアル](<%= resolve_url('https://code.org/learn') %>)を使うことを検討しましょう。 

![](/images/fit-350/group_ipad.jpg)

## 5) 最初に、Hour of Codeの意義を伝えましょう

まず、コンピュータサイエンスがどのように我々の生活にインパクトを与えているのか伝えましょう。 あなたがなぜコンピュータサイエンスの分野で働くことにしたのか、今の会社でどんな仕事をしているのか伝えることも、生徒たちを刺激する一助になるでしょう。

**以下の映像を見せることも非常に効果的です:**

  * オリジナルのCode.orgはビル・ゲイツ、マーク・ザッカーバーグ、NBAスターのクリス・ボッシュが出演されているビデオをリリースしています。 (それらは [1 分](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 分](https://www.youtube.com/watch?v=nKIu9yen5nc), そして[9分](https://www.youtube.com/watch?v=dU1xS07N-FA) バージョンがあります。)
  * [Hour of Code 2015年度版のビデオ](https://www.youtube.com/watch?v=7L97YMYqLHc)か、<% if @country == 'uk' %> [2013年度版のビデオ](https://www.youtube.com/watch?v=FC5FbmsH4fw)をみる。 <% else %> <% end %>
  * [アメリカのオバマ大統領が生徒たちにコンピュータサイエンスを学ぶよう呼びかけてる映像もあります。](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * その他の映像は[こちら](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Hour of Codeを紹介するいくつかの方法:** - テクノロジーが我々の生活にどのようなインパクトを教えているのか、例えばどのように人々の命を救っているのか、人々を助けているのか、そして人々を繋げているのか、説明する。 - もしIT企業で働いている場合、開発に携わっている製品のデモをする。 - もしIT企業ではない場合、どのようにコンピュータを使って仕事を進めているのか、紹介する。 - 会社のソフトウェアエンジニアを招待して、なぜコンピュータサイエンス学ぼうと思ったのか、どんな開発や研究をしているのか話してもらう。 - 女子生徒にどのようにコンピュータサイエンスに興味を持ってもらうかより深く知りたい場合は、[こちら](<%= resolve_url('https://code.org/girls') %>)をご覧ください。.

## 6) プログラミング(コードの時間）！

**参加者をガイドする**

  * 黒板に、チュートリアルへのリンクを書きましょう。リンクは、[こちら](<%= resolve_url('https://code.org/learn') %>)から取得できます。
  * 幼い生徒を相手にする場合、チュートリアルページを先に開いておくか、お気に入りに入れておくことをお勧めします。

**もし参加者が困っていたら、以下のように対応してもらっても全く問題ありません。**

  * 私もわからないから、一緒にやってみよう。
  * コンピュータは、思った通りに動くとは限らないんだよ
  * プログラミングを学ぶということは、新しい言葉を学ぶことと同じなんだ。すぐにペラペラにはなれないよ。

**早く終わってしまった生徒はどうすれば良い？**

  * その他のHour of Codeのチュートリアルを、code.org/learnから試す。
  * もしくは、まだ終わっていない他の生徒を助けてもらう。

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

  * [認定書](<%= resolve_url('https://code.org/certificates') %>)を配布しましょう。
  * [Hour of Codeをやったよ！](<%= resolve_url('/promote/resources#stickers') %>)のステッカーを印刷して配布する。
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

## Hour of Codeを終えたら？

Hour of Codeは、あくまでコンピュータやアプリケーションがどうやって作られているのかを理解する最初の一歩にすぎません。 より深く学びたい生徒には、[こちら](<%= resolve_url('https://code.org/learn/beyond') %>)を紹介しましょう。.

