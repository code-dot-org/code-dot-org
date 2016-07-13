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
%> - 编程一小时

# 感谢注册并组织编程一小时活动！

你在<%= campaign_date('full') %>的帮助会让全世界的学生了解编程一小时，这有可能*改变他们的一生*。 We'll be in touch about new tutorials and other exciting updates. 现在你能做什么？

## 1. 帮助宣传这个活动

你刚刚加入了编程一小时活动。告诉你的朋友关于**#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 找当地的志愿者来帮助你的活动

[搜索我们的志愿者分布图](<%= resolve_url('https://code.org/volunteer/local') %>)。志愿者可以到访您的教室或者通过远程视频聊天，激发你的学生了解计算机科学所能带来的广泛可能性。

## 3. 邀请全校师生尝试编程一小时

[发送这封电子邮件](<%= resolve_url('/promote/resources#sample-emails') %>) 给你的校长并让学校的每个班级来报名。

## 3.邀请你的上级参加

[发送这封电子邮件](<%= resolve_url('/promote/resources#sample-emails') %>) 给您的经理或公司的首席执行官。

## 5. 在你的社区推广《编程一小时》

[招聘本地小组](<%= resolve_url('/promote/resources#sample-emails') %>) — — 男孩/女孩童子军俱乐部、 教会、 大学、 退伍军人团体、 工会或甚至一些朋友。 你不必在学校学习新的技能。 为你的活动使用这些[海报、 横幅、 贴纸、 视频以及更多](<%= resolve_url('/promote/resources') %>)。

## 6. 邀请当地官员支持编程一小时活动

[发送这封电子邮件](<%= resolve_url('/promote/resources#sample-emails') %>) 给您当地的代表、 市议会或学校董事会，并邀请他们来你们学校参观编程一小时。 它能为你在你领域的计算机科学找到一小时之外的支持。

## 7. 计划你的编程一小时

选择一个编程一小时活动并且[回顾本操作指南](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>