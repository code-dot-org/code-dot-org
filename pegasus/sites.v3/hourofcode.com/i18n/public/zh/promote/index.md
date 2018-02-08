---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%> "#HourOfCode"%

# 發動你的社區來參與編程一小時活動

## 1.廣為宣傳

告訴你的朋友 ** #HourOfCode **!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 請你的學校提供全校性的一小時玩程式活動

[發送這封電子郵件](<%= resolve_url('/promote/resources#sample-emails') %>) 給你的校長並讓學校的每個班級來報名。

## 3. 請你的上司一同參與

[發送這封電子郵件](<%= resolve_url('/promote/resources#sample-emails') %>) 給您的經理或公司的首席執行官。

## 4. 在你的社群推廣一小時玩程式活動

[招聘本地小組](<%= resolve_url('/promote/resources#sample-emails') %>) — — 男孩/女孩童子軍俱樂部、 教會、 大學、 退伍軍人團體、 工會或甚至一些朋友。 你不必在學校學習新的技能。 為你的活動使用這些[海報、 橫幅、 貼紙、 視頻以及更多](<%= resolve_url('/promote/resources') %>)。

## 5. 詢問當地的政府機構以支持一小時玩程式活動

[發送信件](<%= resolve_url('/promote/resources#sample-emails') %>)給您當地的代表、市議會或學校董事會，並邀請他們來為參觀你們學校的一小時玩程式活動。 它能為你在你領域的計算機科學找到一小時之外的支持。

<%= view :signup_button %>