* * *

标题：感谢注册并组织编程一小时！ 布局：宽

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% 脸书网 = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %> - 编程一小时

# 感谢注册并组织编程一小时活动！

**每位**编程一小时组织者将获得10GB Dropbox space或$10 Skype credit 作为感谢。[细节](<%= hoc_uri('/prizes') %>)

## 1. 帮助宣传这个活动

告诉你的朋友关于 #编程一小时

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. 邀请你的学校加入编程一小时

[发送这封邮件](<%= hoc_uri('/resources#email') %>)或[这份材料](/resources/hoc-one-pager.pdf)给你的校长。

<% else %>

## 2. 邀请你的学校加入编程一小时

[发送这封邮件](<%= hoc_uri('/resources#email') %>)或把[这份资料](/resources/hoc-one-pager.pdf)这份资料</a>给你的校长。

<% end %>

## 3. 大规模募捐

[募捐给我们的群众募资活动。](http://<%= codeorg_url() %>/捐赠)为了1教亿儿童学习，我们需要你的支持。 我们刚刚推出了历史上[/约/捐助者">捐赠](http://<%= codeorg_url() %>/捐赠“>最大的教育群众募资活动</a>。 <em>每</em>美元将匹配<a href=)，加倍您的影响力。

## 3.邀请你的上级参加

[发送电子邮件](<%= hoc_uri('/resources#email') %>)给你的经理，或CEO，或者[给他们这个参考资料](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. 向你的社交圈内推广编程一小时

招募本地组织—童子军俱乐部，教堂，大学，退伍军人团体或工会，或组织你的邻居参与编程一小时“街区派对”。

## 6. 邀请当地官员支持编程一小时活动

[发送电子邮件](<%= hoc_uri('/resources#politicians') %>)给市长，市议员，或学校董事会。 或[给他们这个资料](http://hourofcode.com/resources/hoc-one-pager.pdf)，并邀请他们来参观你的学校。

<%= view 'popup_window.js' %>