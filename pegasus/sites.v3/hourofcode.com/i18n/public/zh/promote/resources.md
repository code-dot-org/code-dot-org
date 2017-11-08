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

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[下載高解析度版本](http://images.code.org/share/hour-of-code-logo.zip)

**Hour of Code 是個商標。我們不想限制使用，但我們必須確保它被使用時符合一些條件：**

1. 任何參考自「一小時玩程式」的內容都不應該標榜是你自己的，因為一小時玩程式是個草根運動（grassroots movement）。 正例：「加入在 ACMECorp.com 的一小時玩程式™ 活動」。 反例：「試試 ACME 公司的一小時玩程式」。
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

## 邀請您的學校、校長或朋友進行註冊：

電腦到處都是，正在改變這個星球上的每個行業。 但不到 50% 的學校有計算機科學課程。 好消息是我們正在改變此狀況。 如果你去年聽說過一小時玩程式（Hour of Code）活動，你也許知道它創下了些紀錄。 超過 1 億名學生已經體驗過一小時玩程式課程。

透過一小時玩程式活動，計算機科學（computer science）在 Google、MSN、Yahoo 愈來愈普及了！ 與迪士尼。 100 多個夥伴加入共同支持此運動。 世界上的每個 Apple 商店都舉辦過一小時玩程式活動。 歐巴馬總統寫下他的第一行程式碼，成為這個運動的一份子。

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

讓活動傳承下去，舉辦一場活動，邀請當地學校加入，或者你自己試試一小時玩程式課程 — 每個人都能在學習這些基礎中得到些什麼。

從 http://hourofcode.com/ 開始<%= @country %>

<a id="media-pitch"></a>

## 邀請大眾媒體參加您的活動：

**標題** 本地學校參與讓學生認識計算機科學的任務。

電腦到處都有，正在改變地球上的任何產業，但只有不到一半的學校有教電腦科學。 在計算機科學課堂和科技產業中女孩和少數族群的人數嚴重偏低。 好消息是我們正在改變此狀況。

透過一小時玩程式活動，計算機科學（computer science）在 Google、MSN、Yahoo 愈來愈普及了！ 與迪士尼。 100 多個夥伴加入共同支持此運動。 世界上的每個 Apple 商店都舉辦過一小時玩程式活動。 歐巴馬總統寫下他的第一行程式碼，成為這個運動的一份子。

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

我邀請您參加我們的開幕大會，來看孩子們在 [DATE] 這一天開始寫程式的活動。

一小時玩程式是由非營利團體 Code.org 其他的 100 多個單位所共同組織，是個全球運動，宗旨是讓現在的學生具備 21 世紀的關鍵技能。 請加入我們的行列。

**聯絡人：** [您的名字],[職稱], [電話]

**時間：** [您的活動日期和時間]

**地點：** [地址和方向]

保持聯繫、隨時候教。

<a id="parents"></a>

## 告訴家長關於您學校的活動：

親愛的家長們，

我們生活在一個被科技環繞的世界。 而且我們知道我們的學生無論選擇長大後進入什麼領域，他們取得成功的能力都日漸取決於理解科技運作的原理。

但只有很小的一部分的人在學習科技是 **如何** 運作的。所有的學校只有不到一半教計算機科學。

這就是為什麼我們整個的學校加入史上最大的學習活動： 在計算機科學教育週期間 (<%= campaign_date('full') %>) 的一小時玩程式活動。 全世界已經有超過 1 億名學生體驗了一小時玩程式課程。

透過一小時玩程式活動，也等於是向大家宣告，[SCHOOL NAME] 已經準備好要教授這些 21 世紀的基礎技能。 持續為學生引進編程活動，我們希望一小時玩程式活動愈來愈茁壯。 我鼓勵你擔任志工，透過社群平台傳播這個消息。並請考慮在社群內舉辦更多的一小時玩程式活動。

這是一個改變 [城市名稱] 教育未來的機會。

請參閱 http://hourofcode.com/<%= @country %> 的詳細資訊，並幫助傳播這個訊息。

誠摯地邀請您，

您們的校長

<a id="politicians"></a>

## 邀請當地行政長官參加您的學校活動：

親愛的 [市長/縣長/代表/議員姓氏]：

你知道在美國電腦工作的薪資是排名第1嗎？ 全美國有超過 500,000 個電腦工作職缺，但去年只有 42,969 個計算機科學畢業生進入工作職場。

電腦科學今天是 *每個* 行業的基礎。然而大多數學校不會教它。在 [學校名稱]，我們正在嘗試去改變它。

這就是為什麼我們整個的學校加入史上最大的學習活動： 在計算機科學教育週期間 (<%= campaign_date('full') %>) 的一小時玩程式活動。 全世界已經有超過 1 億名學生體驗了一小時玩程式課程。

這封信是想邀請你加入我們的一小時玩程式活動，並為我們做些開場白。 活動預訂於[日期、 時間、 地點] 舉辦，並將作出強力的宣示：[縣或城市名稱] 準備好教導我們的學生21 世紀的關鍵技能了。 我們要確保我們的學生都在創造技術的未來 — 而不只是消費它。

請聯繫我：[電話號碼或電子郵件地址]。靜候佳音。

誠摯地邀請您，[NAME], [TITLE]

<%= view :signup_button %>