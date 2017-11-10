---
title: '<%= hoc_s(:title_signup_thanks) %>'
layout: wide
nav: how_to_nav
social:
  "og:title": '<%= hoc_s(:meta_tag_og_title) %>'
  "og:description": '<%= hoc_s(:meta_tag_og_description) %>'
  "og:image": 'http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png'
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": 'http://<%=request.host%>'
  "twitter:card": player
  "twitter:site": '@codeorg'
  "twitter:url": 'http://<%=request.host%>'
  "twitter:title": '<%= hoc_s(:meta_tag_twitter_title) %>'
  "twitter:description": '<%= hoc_s(:meta_tag_twitter_description) %>'
  "twitter:image:src": 'http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png'
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %> - 编程一小时

# 感谢注册并组织编程一小时活动！

为了感谢的你帮助，使学生们开始学习计算机成为可能，我们想为你的课堂提供一套免费的具有各种重要例题的专业印刷海报。 在结账时使用**免单劵**。 （注意：这只能用于最后的物品清单，而你需要支付运费。 因为这些海报从美国出口，如果发往加拿大或者世界各地运费将会相当高。 We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<br /> **在编程一小时项目运行期间。新的课程和其它令人兴奋的更新推出时我们将与你联系。在这期间，你可以做些什么呢？**

## 1. 传递你在社会和学校中学习的信息。

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> [发送这封电子邮件](%= resolve_url('/promote/resources#sample-emails') %)鼓励他人来参与活动。联系的校长并邀请你学校里的每个班级来报名参与。 从本地组织招募 — — 男孩/女孩童子军俱乐部、 教会、 大学、 退伍军人团体、 工会或甚至一些朋友。 你不必在学校学习新的技能。 邀请当地的政治家或者决策者来参观你们学校的编程一小时活动。 它能为你在你领域的计算机科学找到一小时之外的支持。

为你的活动使用这些[海报、 横幅、 贴纸、 视频以及更多](%= resolve_url('/promote/resources') %)。

## 2. 找当地的志愿者来帮助你的活动

[搜索我们的志愿者分布图](%= resolve_url('https://code.org/volunteer/local') %)寻找可以参观你的课堂或者远程视频聊天的志愿者来激励你的学生们了解到计算机科学带来的多样的可能性。

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# 编程一小时以外的更多内容

<% if @country == 'us' %> 编程一小时活动只是一个开始。 无论你是管理者、老师或是发起者，我们都有[专业发展、课程以及一些其他资源来帮助你将计算机科学课堂带入你的学校或者推广你的宣传。](https://code.org/yourschool)如果你已经从事计算机科学教育，在CS教育周期间使用这些资源来整合你从政府、家长和社区得到的支持。

你有很多选择，以适合你的学校。 大多数的机构提供编程一小时教程包括课程和专业发展方向可用。 如果你发现一个你喜欢的课程，去了解更多。 为了帮助你入门，我们图书了大量的[能帮助你或者你的学生们超越编程一小时的课程提供者](https://hourofcode.com/beyond)。

<% else %> 编程一小时活动只是一个开始。 大多数机构也提供一些可以让你学得更多的编程一小时课程。 为了帮助你入门，我们图书了大量的[能帮助你或者你的学生们超越编程一小时的课程提供者](https://hourofcode.com/beyond)。

Code.org 也免费为您和您的学校提供超过25种语言的全面的[计算机科学介绍](https://code.org/educate/curriculum/cs-fundamentals-international)。 <% end %>

<%= view 'popup_window.js' %>