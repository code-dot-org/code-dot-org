---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# 身の回りの人たちにHour of Codeを広めよう

## 1. みんなに広めよう

友達に**#HourOfCode**を広めよう！

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Hour of Codeを主催するよう学校に交渉してみよう

[このメール](<%= resolve_url('/promote/resources#sample-emails') %>)を校長に送信して、あなたの学校の全てのクラスでHour of Codeのイベントを行うようにお願いしてみましょう。

## 3. 会社の人たちにも働きかけよう

[このメール](<%= resolve_url('/promote/resources#sample-emails') %>)をあなたの上司やCEOに送信しましょう。

## 4. Hour of Codeを、あなたの周りのコミュニティで宣伝しよう

[地元のグループに声かけ](<%= resolve_url('/promote/resources#sample-emails') %>)をしましょう。例えば、ボーイスカウトや大学、教会などのコミュニティもいいかもしれません。 新しいスキルを学ぶ場所は、必ずしも学校である必要はありません。 [これらのポスターやバナー、ステッカーやビデオ](<%= resolve_url('/promote/resources') %>)をイベントで利用しましょう。

## 5. 地元選出の議員にもHour of Codeのサポートをお願いしましょう

[このメール](<%= resolve_url('/promote/resources#sample-emails') %>)を地元選出の議員や教育委員会に送信して、学校で行うHour of Codeのイベントを見学してもらえるようにお願いしましょう。 この取り組みは、コンピュータサイエンス教育に関する活動を長期的に支援することにつながります。

<%= view :signup_button %>