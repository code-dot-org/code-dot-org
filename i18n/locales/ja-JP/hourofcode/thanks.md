* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Hour of Codeのイベント主催への登録にご協力頂き大変ありがとうございます！

あなたは、Hour of Codeのイベントを開催し、生徒にコンピュータサイエンスに触れる機会を提供して下さりました。ありがとうございます。<%= campaign_date('full') %> 粗品に関する情報や、新しいチュートリアルについては、追って連絡させていただきます。 もしお時間があれば、下記の活動を行っていただけると、大変助かります。よろしくお願い致します。

## 1. みんなに広めましょう

Hour of Codeについて、ご友人の方に**#HourOfCode**のハッシュタグを利用して広めてください。!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[こちらのメール](%= resolve_url('/promote/resources#sample-emails') %)を校長に送って、その学校でHour of Codeを行えるようにお願いしましょう。 <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. 会社の方々にも働きかける

[こちらのメール](%= resolve_url('/promote/resources#sample-emails') %)を上司やCEOに送りましょう。

## 4. Hour of Codeを、あなたの周りのコミュニティで宣伝

[地域のグループ、例えばボーイスカウトやガールスカウトを勧誘](%= resolve_url('/promote/resources#sample-emails') %)しましょう。 新しいスキルを学ぶのは、必ずしも学校である必要はありません。 [こちらのポスターやバナー、ステッカーやビデオ](%= resolve_url('/promote/resources') %)もご利用ください。

## 5. 地元選出の議員にもHour of Codeのサポートをお願いしましょう

[こちらのメール](%= resolve_url('/promote/resources#sample-emails') %)を県知事や市長、国会議員や教育委員会に送りましょう。 この取り組みは、コンピュータサイエンス教育に関する活動を長期的に支援することにつながります。

<%= view 'popup_window.js' %>