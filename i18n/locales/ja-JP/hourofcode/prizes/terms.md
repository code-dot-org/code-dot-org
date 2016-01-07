* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 賞品 - 利用規約

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. 1 主催者当たり 1 回のみ利用可能となります。

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. 学校全体でHour of Codeに参加をされる場合、各教職員は、主催者として資格を受けるため個別での登録をお願いします。

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## クラス全員分のノートパソコン (またはその他技術のために使用できる $10,000) :

この賞は K-12 アメリカの公立学校のみ対象です。 To qualify, your entire school must register for the Hour of Code by November 16, 2015. アメリカ国内で、各州それぞれ１つ学校が選ばれ、クラス全員にコンピューターが与えられます。 Code.org will select and notify winners via email by December 1, 2015.

明確いたします、これは、宝くじや、懸賞コンテストではありません。

1) 金銭の伴う賭けや危険が伴う申請は適用外です- Code.orgや他の団体への支払いなどなしで、どんな学校でも教室でも参加できます。

2） 生徒と先生が共に協力して取り組んだ学校全体、もしくは教室全体でHour of Codeに参加した学校の中から選ばれ、勝者となるでしょう。 

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## ゲストで演説される方とのビデオ会話:

賞品は米国およびカナダのK-12の教室に限っております。 Code.org は独自で学校を選考し、web会話の時間帯を提供し、コンピューターに詳しい先生と共に詳細の設定を行います。 学校全体でこの賞品の対象となるための申請をする必要はありません。 Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>