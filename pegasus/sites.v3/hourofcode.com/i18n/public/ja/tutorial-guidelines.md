---

title: <%= hoc_s(:title_tutorial_guidelines) %>
layout: wide

---

# Tutorial guidelines for the Hour of Code™ and Computer Science Education Week

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>).

私たちは魅力的な選択を用意したいと思っていますが、一番の目的はコンピューター科学に馴染みのない、より多くの教員や学生の方々に経験をしてもらいたいという事です。 コーディングやコンピュータープログラミングやコンピューター科学の経験がない利用者に向けたあなたの活動を作るための手引きとしてこの文書を使ってください。

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## 目次:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [チュートリアルを含めるかどうかが評価される方法](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [あなたの活動を計画するための提案](#design)
  * [商標についてのガイドライン](#tm)
  * [トラッキング ピクセル](#pixel)
  * [あなたのチュートリアル、CSEdWeek、Hour of Codeの宣伝](#promote)
  * [障害を持つ学生のための注意](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

例:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. 理想的には、指示やチュートリアルがプログラミングのプラットフォームに統合されて、チュートリアルとプログラミングの間でタブやウィンドウを切り替えずに済む形です。

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Hour of Code の活動を作るための一般的なガイドライン

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * 学生が、友達とまたはオンラインで共有できるものを作るのを励まします。

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**トップに戻る**](#top)

<a id="inclusion"></a>

## チュートリアルを含めるかどうかが評価される方法

コンピューター科学の教育者の委員会が、幅広い教育者の調査結果を含めて、質と量の規準を基に、提出されたものをランク付けします。

**チュートリアルが高く評価される条件:**

  * 高品質
  * designed for beginners - among students AND teachers
  * 1 時間以内の活動として計画されている
  * require no sign up
  * require no payment
  * require no installation
  * 携帯電話やタブレットを含め、多くの OSやデバイスのプラットフォームで動作する
  * 複数の言語で動作する
  * promote learning by all demographic groups (esp. under-represented groups)
  * ピュアな HTML+CSS ウェブデザインに重点を置いていない - （私たちの目標はコンピューター科学であって、HTML のコーディングではありません）

**チュートリアルが低く評価される条件:**

  * 低品質
  * より高度な教育レベルである（初心者向けでない）
  * サポートされている OS やデバイスのプラットフォームが限られている - Web ベースのプラットフォームについては、次の全てをサポートするのを目指すべきです: IE9以上と、最新の Chrome、Firefox、Safari
  * 日本語でのみ動作する
  * reinforce stereotypes that hinder participation by under-represented student groups
  * 授業料を請求する学習プラットフォームへのアップセルとして機能するものである

**チュートリアルがリストに載らない条件:**

  * （およそ）1 時間の活動として計画されていない
  * サインアップが必要である 
  * 支払いが必要である
  * require installation (other than mobile apps)
  * HTML + CSS ウェブデザインのみに重点を置いている
  * 提出期限後に提出されたか、または情報が不完全である（下記参照）

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

最終的に、Hour of Code キャンペーンの目標は学生と先生によるコンピューター科学への参加を拡大させ、コンピューター科学がすべての人が利用可能で「あなたの思うより簡単です」と示す手助けとなることです。いろいろな点で、この目標をよりよく達成するためには、初めてのユーザーにとって最高品質の選択に重点を置きつつ、学生や先生に与える選択肢を少なくそして簡単にすることです。 Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**トップに戻る**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**必要となるもの:**

  * あなたの名前、ロゴ（jpg、png など）
  * HoC 活動のスクリーンショットや市場向け画像の URL。 画像やスクリーンショットは正確に 446×335 の解像度であるべきです。 適切な画像が提供されない場合、我々自身であなたのチュートリアルのスクリーンショットをとるか、またはリストに載せないことがあります。
  * ロゴの URL リンク
  * 活動の名前
  * 活動への URL リンク
  * 先生のメモへの URL リンク（必要ならば。詳細は下記参照）
  * 活動の説明（デスクトップ表示とモバイル表示の両方） 
      * **デスクトップ表示での最大文字数:** 384文字
      * **モバイル表示での最大文字数:** 74文字
      * 説明には、主に学生が主体なのか、または先生の手助けがあるのかを含めてください。 さらに、Hour of Code 活動がコモン・コアや次世代科学スタンダードに取り組んでいるかどうかに興味のある学校もあります。 もし活動が具体的な標準に取り組んでいるのであれば、その情報を含めることを検討してください。
  * テストした/互換性のあるプラットフォームのリスト: 
      * Web based: Which platforms have you tested 
          * OS - Mac・Winとバージョン
          * ブラウザ - IE8、IE9、IE10、Firefox、Chrome、Safari
          * iOS モバイル Safari（携帯対応）
          * Android Chrome（携帯対応）
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * 電力のいらない形
  * サポートされている言語の一覧と適切な形式: 
      * チュートリアルはサポートする言語を 2 文字の言語コードを使って記載すべきです。例えば、ja - 日本語、en - 英語
      * もしさらに特異性が必要であれば、ダッシュを使います。例えば、fr-be - フランス語（ベルギー）または fr-ca - フランス語（カナダ）
      * ***注意: 言語の検出はチュートリアル提供者の仕事です。我々は全てのユーザーを提供された単一の URL にリダイレクトします。*** 
  * オンラインのチュートリアルを提出する場合、それが [COPPA 準拠](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act)かどうかをお知らせください。
  * 目的利用者の推奨学年。学年に適したコンピューター科学の概念については [コンピューター科学教育者協会の K-12 標準](http://csta.acm.org/Curriculum/sub/K12Standards.html) を参照してください。学年レベルの例として挙げられるものは次の通りです: 
      * 小学校: 幼稚園～小2、または小3～5
      * 中等学校: 小6～中2
      * ハイスクール: 中3～高3
      * 全年齢
  * 学年レベルの中には、推奨されるコンピューター科学の知識（初心者、中級、上級）も含めてください。 Hour of Code のウェブサイトは初心者向けの活動を最も目立つように強調表示します。 If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * 技術的要件: 
      * 参加をより正確に追跡するため、各サードパーティーのチュートリアルパートナーに、Hour of Code チュートリアルの最初と最後のページに 1 ピクセルのトラッキング画像を入れていただくようお願いしています。 最初のページには最初の画像を、最後のページには最後の画像を配置してください。 中間のページには配置しないでください）。 詳細については下記のトラッキングピクセルの節を参照してください。 
      * あなたの活動を終えた時には、ユーザーは [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) にリダイレクトされるべきです。そこでユーザーは次のことができます: 
          * Hour of Code を完了したことをソーシャルメディアで共有する
          * Hour of Code を完了した証明書を受け取る
          * Hour of Code 活動への参加率が最も高い国/都市についてのリーダーボードを見る
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) as well. 
  * *（省略可能）* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * オンラインの活動（特にスマートフォン・タブレットのアプリ）について: 
          * ユーザー数
          * タスクを完了した人の数
          * タスクの平均時間
          * 全ユーザーによって書かれたコードの合計行数
          * それ以上の学習へ続けた人の数（タスクを終えて続けてあなたのサイトの追加のタスクへ移ったユーザーとして測定します）
      * オフラインの活動について 
          * 活動の紙バージョンのダウンロード数（該当する場合）

[**トップに戻る**](#top)

<a id="design"></a>

## あなたの活動を計画するための提案

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. いかなる状況下でも Code.org のロゴと名前は使用することは出来ません。 Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**平均的な学生が不自由なく 1 時間以内に終えられるようにしてください。**速くレッスンを進める学生には時間無制限の活動を最後に追加することを検討してください。 ほとんどの子供たちはコンピューター科学やコーディングには全くの初心者であることを忘れないでください。

**先生へのメモを含めましょう。**ほとんどの活動は学生主導であるべきですが、もし先生の手助けや監督をする活動であれば、先生向けの明確で簡潔な指示を、活動とともに提出する別個の URL に先生メモの形式で含めましょう。 初心者なのは学生だけではありません。一部の先生も初心者です。 次のような情報を含めてください:

  * 私たちのチュートリアルはこのようなプラットフォームやブラウザで最もよく動作します
  * Does it work on smartphones? Tablets?
  * ペアプログラミングを推奨しているかどうか 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**活動の最後にフィードバックを組み込みましょう。**（例：「レベルを 10 個完了して、ループについて学びました！　よくできました！」）

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode」や「#CSEdWeek の1つとして #HourofCode を完了しました。 あなたは？ @Scratch」ハッシュタグ **#HourOfCode** を使ってください（H, O, C は大文字）

**Create your activity in Spanish or in other languages besides English.** ]

**社会的に重要な文脈に活動を説明したり結びつけたりしましょう。**コンピュータープログラミングは、それが世界をどのようにしてより良く変えられるかを学生がわかったときに力を発揮します！

**サインアップしなくてもチュートリアルを試せるようにしましょう。**サインアップや支払いが必要なチュートリアルはリストに掲載しません

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * ドライバーは、マウスとキーボードを操作します。
  * ナビゲーターは提案をし、エラーを指摘し、質問をします。 
  * 学生は 1 回のセッションで 2 回以上役割を交代するべきです。

ペアプログラミングの利点:

  * 学生が先生に頼るのではなくお互いを助けあうことができる
  * コーディングは一人だけでの活動ではなく、人とのかかわり合いを必要とするものであることを示す
  * 全ての教室や実習室に 1:1 の体験に十分な数のコンピューターがあるわけではない

[**トップに戻る**](#top)

<a id="tm"></a>

## 商標についてのガイドライン

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

混乱を防ぐために商標「Hour of Code」を保護するというのもその一つです。 チュートリアルパートナーの多くがウェブサイトに「Hour of Code」を使用してきました。 私たちはこの使い方を引き止めるわけではありませんが、いくつかの制限を満たすようにしたいと思っています:

  1. いかなる「Hour of Code」への言及も、それがあなたの独自のブランド名だと示唆する形ではなく、Hour of Code を草の根運動として参照する形で使われるべきです。 Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. ページに（またはフッターに）、CSEdWeek と Code.org へのリンクを含めて次の言葉を含めてください:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

[**トップに戻る**](#top)

<a id="pixel"></a>

## トラッキング ピクセル

参加をより正確に追跡するため、各サードパーティーのチュートリアルパートナーに、Hour of Code チュートリアルの最初と最後のページに 1 ピクセルのトラッキング画像を入れていただくようお願いしています（最初のページには最初の画像を、最後のページには最後の画像を入れてください。 そして中間のページには入れないでください）。

これにより、あなたが直接勧誘して Hour of Code を行うためにあなたのウェブサイトを訪れたユーザーや、先生がホワイト ボード上に直接あなたの URL を入力したときに訪れたユーザーを数えることができます。 このことであなたのチュートリアルの参加者数がより正確になり、ユーザーを惹きつけやすくなります。 もし最後のページにピクセルを組み込めば、チュートリアルの完了率を測定できるようにもなります。

もしあなたのチュートリアルが承認されて最終的なチュートリアルのページに含められたならば、Code.org はチュートリアルに組み込むためのユニークなトラッキングピクセルをあなたに提供します。以下の例を参照してください。

注意: これはインストール可能なアプリ（iOS/Android アプリ、またはデスクトップインストールアプリ）にとっては重要ではありません

AppInventor 用のトラッキングピクセルの例:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**トップに戻る**](#top)

<a id="promote"></a>

## あなたのチュートリアル、CSEdWeek、Hour of Codeの宣伝

私たちはすべての方に、ご自身の 1 時間のチュートリアルをあなたのユーザーに宣伝するようお願いしています。 Please direct them to ***your*** Hour of Code page. ユーザーはチュートリアルについてのあなたからのメールにはおそらく反応してくれるでしょう。 コンピューター科学教育週間の間、国際的な Hour of Code キャンペーンを理由にユーザーに他の人を招待するよう奨励し、参加してもらいましょう。私たちの総参加者が 1 億人に達する手助けをお願いします。

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * ハッシュタグ **#HourOfCode**（H, O, C は大文字）を使って、ソーシャルメディアや従来のメディア、メーリングリストなどで Hour of code を宣伝しましょう
  * 地元のイベントを開催したり、あなたの従業員に地元の学校や地域社会のグループでイベントを開催してもらうようお願いしてみましょう。
  * その他の情報については、リソースキットをご覧ください（近日公開）。

[**トップに戻る**](#top)

<a id="disabilities"></a>

## 障害を持つ学生のための特別な注意

視覚障害者向けに設計されたチュートリアルを作成する場合、スクリーン リーダーで見る人のためにそれを強調したいと思います。 そのようなチュートリアルはまだ受け取ったことがないので、そういった学生に向けた選択肢として含めたいと思います。

[**トップに戻る**](#top)