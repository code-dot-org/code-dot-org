* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 獎品-條款及條件

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. 限制每主辦一個救贖。

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. 如果你整個的學校參與代碼小時，每個教育工作者必須單獨註冊作為召集人的資格。

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## 一套筆記型電腦 （或者 10000 美元購買其他技術）：

公共 K 12 美國的學校僅限於獎。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. 在每個美國州一所學校將收到一類組的電腦。 Code.org will select and notify winners via email by December 1, 2015.

為了澄清，這不是一個抽獎或涉及純靠運氣的一場比賽。

1） 那裡沒有金融股權或風險所涉及的應用 — — 任何學校或課堂可參加的情況下，沒有任何付款到 Code.org 或任何其他組織

2） 個勝利者只將整個教室 （或學校） 參與代碼小時涉及的學生和教師的集體技能測試的學校之間選擇。

<% end %>

<%= view :signup_button %>