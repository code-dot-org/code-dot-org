* * *

title: Thanks for signing up to host an Hour of Code! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# 謝謝您報名舉辦Hour of Code!

**每一位**一小時程式設計活動的組織者，將會收到 10 GB 的 Dropbox 空間或 Skype 10 美元的額度作為感謝。[ 細節](<%= hoc_uri('/prizes') %>)

## 1.廣為宣傳

告訴你的朋友關於 #HourOfCode 。

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2.要求你的整所學校都提供一小程式設計活動

[發送這封郵件](<%= hoc_uri('/resources#email') %>)或[這份資料](/resources/hoc-one-pager.pdf)給你的校長。

<% else %>

## 2.要求你的整所學校都提供一小程式設計活動

[發送這封郵件](<%= hoc_uri('/resources#email') %>)或把[這份資料](/resources/hoc-one-pager.pdf)這份資料</a>給你的校長。

<% end %>

## 3.慷慨的捐贈

[ 捐贈給我們的募資活動。](http://<%= codeorg_url() %>/ donate)為了教導 1 億名兒童，我們需要您的支援。 我們剛剛推出了歷史上[/關於/捐助者">捐助者](http://<%= codeorg_url() %>/捐贈“>最大的教育群眾募資活動</a>。 <em>每</em>美元將搭配<a href=)，加倍您的影響力。

## 3. 問問你的同事是否想參與

[發送電子郵件](<%= hoc_uri('/resources#email') %>)給你的經理，或CEO，或者[給他們這個參考資料](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 4. 在社區內宣傳一下Hour of Code

招募本地群組—男女童軍,教堂,大學,退伍軍人團體或勞工組織，或為你的鄰居舉辦一場Hour of Code“街區派對”活動。

## 5. 找當地的民選官員支持Hour of Code

[發送電子郵件](<%= hoc_uri('/resources#politicians') %>)給市長，市議員，或學校董事會。 或[給他們這個資料](http://hourofcode.com/resources/hoc-one-pager.pdf)，並邀請他們來參觀你的學校。

<%= view 'popup_window.js' %>