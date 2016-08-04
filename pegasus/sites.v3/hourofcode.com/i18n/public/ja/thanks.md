---
  title: <%= hoc_s(:title_signup_thanks) %>
  layout: wide
  nav: how_to_nav

  social:
    "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
    "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
    "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
    "og:image:width": 1440
    "og:image:height": 900
    "og:url": "http://<%=request.host%>"

    "twitter:card": player
    "twitter:site": "@codeorg"
    "twitter:url": "http://<%=request.host%>"
    "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
    "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
    "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  ---

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Hour of Codeのイベント主催への登録にご協力頂き大変ありがとうございます！

あなたは、Hour of Codeのイベントを開催し、生徒にコンピュータサイエンスに触れる機会を提供して下さりました。ありがとうございます。<%= campaign_date('full') %> We'll be in touch about new tutorials and other exciting updates. もしお時間があれば、下記の活動を行っていただけると、大変助かります。よろしくお願い致します。

## 1. みんなに広めましょう

Hour of Codeについて、ご友人の方に**#HourOfCode**のハッシュタグを利用して広めてください。!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. 学校全体でHour of Codeを開催できるように働きかける

[このメール](<%= resolve_url('/promote/resources#sample-emails') %>)を校長に送信して、あなたの学校の全てのクラスでHour of Codeのイベントを行うようにお願いしましょう。

## 4. 働いている会社に働きかける

[このメール](<%= resolve_url('/promote/resources#sample-emails') %>)をあなたの上司やCEOに送信しましょう。

## 5. Hour of Codeを、周囲のコミュニティで広める

[地元のグループを勧誘](<%= resolve_url('/promote/resources#sample-emails') %>)しましょう。例えば、ボーイスカウトや大学、教会などのグループです。 新しいスキルを学ぶのは、必ずしも学校である必要はありません。 [これらのポスターやバナー、ステッカーやビデオ](<%= resolve_url('/promote/resources') %>)をイベントで利用しましょう。

## 6. 議員に働きかける

[このメール](<%= resolve_url('/promote/resources#sample-emails') %>)を地元選出の議員や教育委員会に送信して、学校で行うHour of Codeのイベントを見学して頂けるようにお願いしましょう。 この取り組みは、コンピュータサイエンス教育に関する活動を長期的に支援することにつながります。

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>