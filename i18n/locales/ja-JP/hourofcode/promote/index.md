* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# どうやって協力すればいい？

## 1. みんなに広めましょう

友達に**#HourOfCode**を広める!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[このメール](%= resolve_url('/promote/resources#sample-emails') %)を校長に送信して、あなたの学校の全てのクラスでHour of Codeのイベントを行うようにお願いしましょう。 <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. <% end %>

## 3. 会社の方々にも働きかける

[このメール](%= resolve_url('/promote/resources#sample-emails') %)をあなたの上司やCEOに送信しましょう。

## 4. Hour of Codeを、あなたの周りのコミュニティで宣伝

[地元のグループを勧誘](%= resolve_url('/promote/resources#sample-emails') %)しましょう。例えば、ボーイスカウトや大学、教会などのグループです。 新しいスキルを学ぶのは、必ずしも学校である必要はありません。 [これらのポスターやバナー、ステッカーやビデオ](%= resolve_url('/promote/resources') %)をイベントで利用しましょう。

## 5. 地元選出の議員にもHour of Codeのサポートをお願いしましょう

[このメール](%= resolve_url('/promote/resources#sample-emails') %)を地元選出の議員や教育委員会に送信して、学校で行うHour of Codeのイベントを見学して頂けるようにお願いしましょう。 この取り組みは、コンピュータサイエンス教育に関する活動を長期的に支援することにつながります。