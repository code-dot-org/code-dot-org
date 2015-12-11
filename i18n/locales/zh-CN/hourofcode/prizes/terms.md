* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 奖品 - 条款和条件

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. 每位组织者仅可以兑换一次。

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. 如果您的整个学校都要参与编程一小时，每位教师都必须单独注册为一名组织者以获得资格。

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## 整个班级的电脑（或者用于其他科技产品的10000美元）：

该奖品仅限于美国K-12学校。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. 在美国各州都将有一所学校收到我们为其班级配备的电脑。 Code.org will select and notify winners via email by December 1, 2015.

声明，这不是一个纯偶然几率的抽奖或比赛。

1）参加没有任何经济利益或风险-任何学校或教室都可以参加，不需要向Code.org或其他组织付款

2）获奖者将只在整个教室（或学校）都参与到编程一小时的学校中选出，要求‘学生和教师’参加集体技能测试。

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 与特邀嘉宾视频聊天：

奖励仅限于美国和加拿大K-12教室。 Code.org会随机选取获奖学校，提供一个网上交谈的时间，并和合适的教师一起敲定技术细节。 赢得奖励并不需要整个学校申请资格。 Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>