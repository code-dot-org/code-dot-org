* * *

title: Hour of Code の主催にサインアップ頂きありがとうございます！ layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Hour of Codeのイベント主催への登録にご協力頂き大変ありがとうございます！

**全ての** Hour of Code の主催者は、Dropboxの10 GB容量 か $10 のSkype creditを感謝のしるしとして受領頂けます。 [詳細](<%= hoc_uri('/prizes') %>)

## 1. みんなに広めましょう

友達に #HourOfCodeを教えましょう。

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[このメール](<%= hoc_uri('/resources#email') %>) もしくは [この資料を](/resources/hoc-one-pager.pdf) 校長先生に送ってください。

<% else %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[このメールを送るか](<%= hoc_uri('/resources#email') %>) もしくは、[この資料を](/resources/hoc-one-pager.pdf) </a>校長に渡してください。

<% end %>

## 3. 寄付のお願い

[クラウドファンディングキャンペーンへの寄付をお願いします](http://<%= codeorg_url() %>/donate) 1億人の生徒に教えるためにはあなたのサポートが必要です。 私たちは、[教育に関する最大規模のクラウドファンディングキャンペーン](http://<%= codeorg_url() %>/donate) を立ち上げたばかりです。 *全ての*あなたの1ドルに対して [我々も同額の寄付をするので](http://<%= codeorg_url() %>/about/donors)インパクトは2倍になります。

## 4. 雇用主にも参加するよう聞いてみてください。

あなたのマネージャーやCEOに[このメールを送って](<%= hoc_uri('/resources#email') %>) [この資料を渡してください](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 4. あなたのコミュニティーにもHour of Codeを宣伝しましょう。

ボーイスカウト/ガールスカウト、教会、大学、退役軍人のグループ、労働組合など地域のグループにも募集をかけます。もしくは、近所でHour of Code地域の集いを主催してください。

## 6. Hour of Codeを支援してもらえるよう地元の議員に聞いてみましょう。

[このメールを](<%= hoc_uri('/resources#politicians') %>) 市長、市議会、教育委員会に送ってください。 もしくは、[この資料を渡して](http://hourofcode.com/resources/hoc-one-pager.pdf)あなたの学校に招待してください。

<%= view 'popup_window.js' %>