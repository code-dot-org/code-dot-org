* * *

title: <%= hoc_s(:title_country_resources) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1） チュートリアルを試す。

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**すべてのHour of Codeのチュートリアルは、以下の様に構成されています：**

  * Require minimal prep-time for organizers
  * 自分のペースで自分のレベルにあったものに取り組める、自習式の教材。

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2）必要なハードウェア（コンピューター機器）のプラン - コンピューターはなくても大丈夫でです。

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **生徒のPCもしくは他のデバイス上でチュートリアルをテストしてみてください。** 正しく機能する(音響や、ビデオを含めて)ことをご確認ください。
  * **お祝いのページをプレビューしてください** どの生徒がどこまで完了しているかを確認するときに 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## IT環境がきちんと整うよう事前に計画してください。

  * **PCと周辺機器は十分ありますか?** 使う [ペアプログラミング](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **ネット通信速度が遅い？**教室の前で生徒全員でビデオを鑑賞するようにしてください。そうすれば各自が個別にビデオをダウンロードする必要はありません。もしくは 電源なし/オフラインでのチュートリアルを試してください。

## 生徒達を刺激してください-彼らにビデオを見せてください。

生徒達にHour of Codeのキックオフ用の感動的なビデオを見せましょう。例:

  * オリジナルのCode.orgはビル・ゲイツ、マーク・ザッカーバーグ、NBAスターのクリス・ボッシュが出演されているビデオをリリースしています。 (それらは [1 分](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 分](https://www.youtube.com/watch?v=nKIu9yen5nc), そして[9分](https://www.youtube.com/watch?v=dU1xS07N-FA) バージョンがあります。)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [アメリカのオバマ大統領が生徒たちにコンピュータサイエンスを学ぶよう呼びかけてる映像もあります。](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**あなたの生徒たちを興奮させます - 短いイントロを紹介する。**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>