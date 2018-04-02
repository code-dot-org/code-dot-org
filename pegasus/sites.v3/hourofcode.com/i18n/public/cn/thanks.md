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

# 感谢注册并组织编程一小时活动！

为了感谢您的帮助，使学生们开始学习计算机科学成为可能，我们想为您的课堂提供一套免费的具有各种重要例题的专业印刷海报。 在结账时使用**免单劵**。 （注意：这只能用于最后的物品清单，而您需要支付运费。 由于这些海报从美国出口，如果发往加拿大或者世界各地运费将会相当高。 我们知道这可能不在您的预算中, 我们鼓励您为您的教室打印 [ PDF 文件 ](https://code.org/inspire)。  
<br /> [ <button> 获取海报 </button> ](https://store.code.org/products/code-org-posters-set-of-12) 使用提供代码 FREEPOSTERS

<% if @country == 'us' %> 感谢 Ozobot，德克斯特行业，littleBits 和奇幻工房的慷慨相助，超过100多间教室将获得到机器人或电路！ 为了有资格获得一套, 请务必完成从 Code.org 发送后的《编程一小时》的调查。 Code.org 将选择获奖的教室。 同时检查一部分机器人和电路的活动。 请注意，这只对美国的学校开放。 <% end %>

<br /> **在《编程一小时》项目运行期间，我们将在新的课程和其它令人兴奋的更新推出时与您联系。同时您可以做些什么呢？**

## 1. 在您的学校和社区传播这个信息

告诉您的朋友们您刚刚加入了**编程一小时的活动**和相关信息。

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> 鼓励他人与我们的示例电子邮件一起参与 [. ](<%= resolve_url('/promote/resources#sample-emails')%>)联系您的校长, 挑战您学校的每一个教室来注册。 招募当地团体\---男孩/女孩童子军俱乐部, 教会, 大学, 退伍军人团体, 工会, 甚至一些朋友。 你不必在学校学习新的技能。 邀请当地的政治家或者决策者来参观您们学校的《编程一小时》活动。 它可以帮助您的地区的计算机科学超过一小时支持。

为您的活动使用这些 [ 海报, 横幅, 贴纸, 视频以及更多 ](<%= resolve_url('/promote/resources')%>) 。

## 2. 找当地的志愿者来帮助你的活动

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. 计划您的《编程一小时》

为您的课堂选择一项[《编程一小时》活动](https://hourofcode.com/learn)并[查看基本指南](<%= resolve_url('/how-to') %>)。

# 《编程一小时》以外的更多内容

<% if @country == 'us' %> 《编程一小时》只是一个开始。 无论您是管理者、老师还是倡导者，我们都有[专业开发、课程以及一些其它资源来帮助您将计算机科学课堂带入您的学校或者推广您的宣传。](https://code.org/yourschool)如果您已经从事计算机科学教育，在CS教育周期间使用这些资源来争取您的政府、家长和社区的支持。

您有很多选择适合您的学校。 大多数的组织提供《编程一小时》教程也提供有课程和专业发展。 如果您发现一个您喜欢的课程，去了解更多。 为了帮助您入门, 我们重点介绍了一些 [ 课程提供商将帮助您或您的学生超过一小时. ](https://hourofcode.com/beyond)

<% else %> 《编程一小时》只是一个开始。 大多数提供《编程一小时》课程的组织也有更多的课程可供进一步学习。 为了帮助您入门, 我们重点介绍了一些 [ 课程提供商将帮助您或您的学生超过一小时. ](https://hourofcode.com/beyond)

Code.org 还提供完整的 [ 计算机科学入门课程 ](https://code.org/educate/curriculum/cs-fundamentals-international), 免费为您或您的学校翻译成超过25种的语言。 <% end %>

<%= view 'popup_window.js' %>