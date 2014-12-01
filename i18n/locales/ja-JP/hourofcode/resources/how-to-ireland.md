* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    1 時間のコーディングの指導方法
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">イベントへの申し込み</button></a>
  </div>
</div>

<font size="4">On December 8th, as part of the global Hour of Code movement Microsoft is seeking to enable as many people as possible in Ireland to have the opportunity to learn how to code.</p> 

<p>
  On 19th November Microsoft will run a training session for people hosting events at its campus in Sandyford from 6pm - 8pm.
</p>

<p>
  This will run through the curriculum which can be delivered for Hour of Code on 8th December. If you would like to register to attend this event please email cillian@q4pr.ie. Places are on a first come first served basis. </font>
</p>

<h2>
  Details of the curriculum can be found <a href="https://www.touchdevelop.com/hourofcode2">here</a>
</h2>

<h2>
  1) Try the tutorials:
</h2>

<p>
  私たちは、様々なパートナー達によって作られた、バラエティに富んだ楽しい、全年齢の生徒のための一時間のチュートリアルを主催します。新しいチュートリアルは12月8-14日のHour of Codeの前にキックオフでお披露目されます。
</p>

<p>
  <strong>すべてのHour of Codeのチュートリアル：</strong>
</p>

<ul>
  <li>
    教員の皆さんは最小限の準備時間を必要とします。
  </li>
  <li>
    自己管理学習は自分のペースで、そして、自分のスキルレベルに見合った取り組み方を可能にします。
  </li>
</ul>

<p>
  <a href="http://<%=codeorg_url() %>/learn"><img src="http://<%= codeorg_url() %>/images/tutorials.png" /></a>
</p>

<h2>
  2) Plan your hardware needs - computers are optional
</h2>

<p>
  The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.
</p>

<ul>
  <li>
    <strong>生徒のPCもしくは他のデバイス上でチュートリアルをテストしてみてください。</strong> 正しく機能する(音響や、ビデオを含めて)ことをご確認ください。
  </li>
  <li>
    <strong>お祝いのページをプレビューしてください</strong> どの生徒がどこまで完了しているかを確認するときに
  </li>
  <li>
    選択したチュートリアルの音響が正しく機能させるため<strong>ヘッドフォンを支給することをお勧めします。</strong>もしくは生徒に自分用のを持ってくるように指示してください。
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>PCと周辺機器は十分ありますか?</strong> 使う <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">ペアプログラミング</a>. 生徒がパートナー同士になることで、お互いを助け合い、教員への依存度が低くなります。 またコンピューター科学にも共存する社会があるということを知る機会ができます。
  </li>
  <li>
    <strong>ネット通信速度が遅い？</strong>教室の前で生徒全員でビデオを鑑賞するようにしてください。そうすれば各自が個別にビデオをダウンロードする必要はありません。もしくは 電源なし/オフラインでのチュートリアルを試してください。
  </li>
</ul>

<h2>
  4) Inspire students - show them a video
</h2>

<p>
  Show students an inspirational video to kick off the Hour of Code. Examples:
</p>

<ul>
  <li>
    オリジナルのCode.orgはビル・ゲイツ、マーク・ザッカーバーグ、NBAスターのクリス・ボッシュが出演されているビデオをリリースしています。 (それらは <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 分</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 分</a>, そして<a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9分</a> バージョンがあります。)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Hour of Codeは2013リリース済みビデオ</a>, もしくは <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Hour of Code 2014 ビデオ</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Hour of Code 2014 ビデオ</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">オバマ大統領が生徒たちにコンピューター科学を学ぶよう呼びかけてる。</a>
  </li>
</ul>

<p>
  <strong>Get your students excited - give them a short intro</strong>
</p>

<p>
  Most kids don’t know what computer science is. Here are some ideas:
</p>

<ul>
  <li>
    女の子と男の子の両方の関心を引く（誰かの命を救うとか、人々を助ける、人とつながるなどの）ことを応用した話を交えて簡単に説明する。
  </li>
  <li>
    トライ：「日常生活の中にあるコンピューター科学を考えてみる：携帯電話、電子レンジ、コンピューター、信号。。。これらを作るのにはコンピューター科学なしではできません。」
  </li>
  <li>
    または、「コンピューター科学は私たちに力をあたえてくれる、人間のアイデアとデジタルツールが融合した芸術です。 コンピューター科学は様々な分野で活躍しています：携帯アプリの制作、不治の病を治したり、アニメ制作、ソーシャルメディアの制作、他の惑星を発掘するロボットの構築、そのほかにもたくさん」
  </li>
  <li>
    コンピューター科学をもっと女の子に興味持ってもらうヒントは <a href="http://<%= codeorg_url() %>/girls">こちら </a>.
  </li>
</ul>

<h2>
  5) Start your Hour of Code
</h2>

<p>
  <strong>Direct students to the activity</strong>
</p>

<ul>
  <li>
    黒板にチュートリアルのリンク先を書きます リンクは<a href="http://<%= codeorg_url() %>あなたの言語のチュートリアル</a>のページで見つけることができます。 <a href=">hourofcode.com/co</a>
  </li>
  <li>
    そのURLからチュートリアルを始めるよう生徒に伝えてください。
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    ”まず3人に聞いてみて、それでもわからなければ私に質問してください”と生徒に伝えましょう。
  </li>
  <li>
    "いいですよ、その調子"と生徒を励ますようにしましょう。
  </li>
  <li>
    "私もわからないので、一緒にやってみましょう"という対応でも構いません。 解決方法がわからなかった場合、”テクノロジーは必ずしも思ったようにはいきません。仲間として一緒に勉強してゆきましょう”という教訓ととらえましょう。 "プログラムの楽手は新しい言語を学ぶようなものです。すぐに流暢にはなせるようにはなりません。"
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>　にある他のチュートリアルや別のHour of Code アクティビティに進んでください
  </li>
  <li>
    もしくは、早く終えてしまった生徒には、困っている他の生徒を助けてあげるように伝えましょう。
  </li>
</ul>

<p>
  <strong>How do I print certificates for my students?</strong>
</p>

<p>
  Each student gets a chance to get a certificate via email when they finish the <a href="http://studio.code.org">Code.org tutorials</a>. You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our <a href="http://<%= codeorg_url() %>/certificates">Certificates</a> page to print as many certificates as you like, in one fell swoop!
</p>

<p>
  <strong>What comes after the Hour of Code?</strong>
</p>

<p>
  The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, <a href="http://uk.code.org/learn/beyond">encourage your children to learn online</a>. <% else %> To continue this journey, find additional resources for educators <a href="http://<%= codeorg_url() %>/educate">here</a>. Or encourage your children to learn <a href="http://<%= codeorg_url() %>/learn/beyond">online</a>. <% end %> <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>
</p>