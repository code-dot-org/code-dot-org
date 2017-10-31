---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# 推廣一小時玩程式活動

## 舉辦一場「一小時的程式設計課程」活動？<a href="<%= resolve_url('/how-to') %>參閱活動指引</a>

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## 在你的學校張貼這些海報。

<%= view :promote_posters %>

<a id="social"></a>

## 在社群網絡媒體張貼訊息。

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## 使用一小時玩程式的標志來傳播

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[下載高解析度版本](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. 任何參考自「一小時玩程式」的內容都不應該標榜是你自己的，因為一小時玩程式是個草根運動（grassroots movement）。
    
    - 正例：「加入在 ACMECorp.com 的一小時玩程式™ 活動」。 
    - 反例：「試試 ACME 公司的一小時玩程式」。
2. 當你的網站或是應用程式提到「一小時玩程式」時，在最顯眼的地方使用「TM」上標字。
3. 在頁面（或在頁腳）加入以下的文字，包括 CSEdWeek 和 Code.org 的 web 網站︰
    
    *「Hour of Code™ 是在計算機科學教育週 [csedweek.org] 以及 Code.org [code.org] 推行的全國性活動，旨在幫助將數以百萬計的學生在一小時中認識計算機科學與編程。」*

4. 不要使用「Hour of Code」作為你的 app 名稱。

<a id="stickers"></a>

## 列印這些貼紙給你的學生

（貼紙的直徑 1 英寸，每張紙 63 張貼紙）  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## 發送這些電子郵件協助推廣一小時玩程式活動

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

電腦到處都是，正在改變這個星球上的每個行業。 但不到 50% 的學校有計算機科學課程。 Good news is, we’re on our way to change this! 如果你去年聽說過一小時玩程式（Hour of Code）活動，你也許知道它創下了些紀錄。 超過 1 億名學生已經體驗過一小時玩程式課程。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 100 多個夥伴加入共同支持此運動。 Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

讓活動傳承下去，舉辦一場活動，邀請當地學校加入，或者你自己試試一小時玩程式課程 — 每個人都能在學習這些基礎中得到些什麼。

從 http://hourofcode.com/ 開始<%= @country %>

<a id="media-pitch"></a>

### 邀請大眾媒體參加您的活動：

**標題** 本地學校參與讓學生認識計算機科學的任務。

電腦到處都有，正在改變地球上的任何產業，但只有不到一半的學校有教電腦科學。 在計算機科學課堂和科技產業中女孩和少數族群的人數嚴重偏低。 好消息是我們正在改變此狀況。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 100 多個夥伴加入共同支持此運動。 世界上的每個 Apple 商店都舉辦過一小時玩程式活動。 Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. 請加入我們的行列。

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### 告訴家長關於您學校的活動：

**Subject line:** Our students are changing the future with an Hour of Code

親愛的家長們，

我們生活在一個被科技環繞的世界。 而且我們知道我們的學生無論選擇長大後進入什麼領域，他們取得成功的能力都日漸取決於理解科技運作的原理。

但只有很小的一部分的人在學習科技是 **如何** 運作的。所有的學校只有不到一半教計算機科學。

這就是為什麼我們整個的學校加入史上最大的學習活動： 在計算機科學教育週期間 (<%= campaign_date('full') %>) 的一小時玩程式活動。 全世界已經有超過 1 億名學生體驗了一小時玩程式課程。

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. 持續為學生引進編程活動，我們希望一小時玩程式活動愈來愈茁壯。 我鼓勵你擔任志工，透過社群平台傳播這個消息。並請考慮在社群內舉辦更多的一小時玩程式活動。

這是一個改變 [城市名稱] 教育未來的機會。

請參閱 http://hourofcode.com/<%= @country %> 的詳細資訊，並幫助傳播這個訊息。

誠摯地邀請您，

您們的校長

<a id="politicians"></a>

### 邀請當地行政長官參加您的學校活動：

**Subject line:** Join our school as we change the future with an Hour of Code

親愛的 [市長/縣長/代表/議員姓氏]：

你知道在美國電腦工作的薪資是排名第1嗎？ 全美國有超過 500,000 個電腦工作職缺，但去年只有 42,969 個計算機科學畢業生進入工作職場。

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

這就是為什麼我們整個的學校加入史上最大的學習活動： 在計算機科學教育週期間 (<%= campaign_date('full') %>) 的一小時玩程式活動。 全世界已經有超過 1 億名學生體驗了一小時玩程式課程。

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. 我們要確保我們的學生都在創造技術的未來 — 而不只是消費它。

請聯繫我：[電話號碼或電子郵件地址]。靜候佳音。

誠摯地邀請您，

[NAME], [TITLE]

<%= view :signup_button %>