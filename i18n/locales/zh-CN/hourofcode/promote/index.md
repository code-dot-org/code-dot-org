---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# 发动你的社区来参与编程一小时活动

## 1. 帮助宣传这个活动

告诉你的朋友 ** #编程一小时 **!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 邀请你的学校加入编程一小时

[发送这封电子邮件](%= resolve_url('/promote/resources#sample-emails') %) 给你的校长并让学校的每个班级来报名。

## 请求你的雇主参与其中

[发送这封电子邮件](%= resolve_url('/promote/resources#sample-emails') %) 给您的经理或公司的首席执行官。

## 4. 在你的社区中推广编程一小时

[招聘本地小组](%= resolve_url('/promote/resources#sample-emails') %) — — 男孩/女孩童子军俱乐部、 教会、 大学、 退伍军人团体、 工会或甚至一些朋友。 你不必在学校学习新的技能。 为你的活动使用这些[海报、 横幅、 贴纸、 视频以及更多](%= resolve_url('/promote/resources') %)。

## 5.邀请当地官员支持编程一小时活动

[发送这封电子邮件](%= resolve_url('/promote/resources#sample-emails') %) 给您当地的代表、 市议会或学校董事会，并邀请他们来你们学校参观编程一小时。 它能为你在你领域的计算机科学找到一小时之外的支持。

<%= view :signup_button %>