---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## 在您的學校張貼這些海報

<%= view :promote_posters %>

<a id="social"></a>

## 在社群網絡媒體張貼訊息

[![圖片](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![圖片](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![圖片](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![圖片](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![圖片](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## 發送這些電子郵件協助推廣Hour of Code活動

<a id="email"></a>

## 邀請您的學校、校長或朋友進行註冊：

電腦無處不在但教電腦科學的學校比 10 年前還少。 好消息是我們正在改變此狀況。 If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! 與迪士尼。 Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

讓這個活動傳播出去，舉辦一場活動。邀請當地的學校報名，或者你自己嘗試程式設計一小時--每個人都能從這項基礎學習中獲益。

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## 邀請大眾媒體參加您的活動：

**Subject line:** Local school joins mission to introduce students to computer science

電腦無處不在，但教授電腦科學的學校近10 年日漸委縮 。女孩和少數民族學習人數嚴重的偏低。好消息是，我們正在改變此狀態。

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! 與迪士尼。 Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

我邀請您參加我們的開幕大會，來看孩子們在 [DATE]這一天開始寫程式的活動。

Hour of Code由非營利組織 Code.org 和 超過100 多個夥伴單位舉辦，活動宗旨在讓當代的學生成功地學習 21 世紀關鍵技能。 請加入我們的行列。

**聯絡人：** [您的名字],[職稱], [電話]

**時間：** [您的活動日期和時間]

**地點：** [地址和方向]

保持聯繫、隨時候教。

<a id="parents"></a>

## 告訴家長關於您學校的活動：

親愛的家長，

我們生活在一個被科技包圍的世界。 而且我們知道我們的學生無論選擇甚麼領域作為成年人時的行業，他們取得成功的能力逐漸決於理解科技運作的原理。 但是，我們只有一小部分在學習資訊科學，比十年前研究的學生還少。

這就是為什麼我們整個的學校加入史上最大的學習活動： 小時的過程中代碼的電腦科學教育周 (12 月 7-13). More than 100 million students worldwide have already tried an Hour of Code.

此Hour of Code活動宣示 [SCHOOL NAME] 已經準備教授廿十一世紀的基礎技能。 繼續把程式設計的活動帶給您的學生，我們想讓Hour of Code活動更盛大。 I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

這是一個改變 [城市名稱] 教育未來的機會。

請參閱 http://hourofcode.com/<%= @country %> 的詳細資訊，並幫助傳播這個消息。

此致

您們的校長

<a id="politicians"></a>

## 邀請當地行政長官參加您的學校活動：

親愛的 [市長/縣長/代表/議員姓氏]：

您可知道在今天的經濟，資訊相關工作數量超過學生畢業後進入職場人數，是3件工作比上1位畢業生嗎？ 而且，電腦科學是今日 *每個* 行業的基礎。 Yet most of schools don’t teach it. 在 [學校名稱]，我們正在嘗試去改變此狀。

這就是為什麼我們整個的學校加入史上最大的學習活動： 小時的過程中代碼的電腦科學教育周 (12 月 7-13). More than 100 million students worldwide have already tried an Hour of Code.

我正在寫信邀請你加入我們的程式設計一小時活動並在開幕典禮上講話。 活動預訂於[日期、 時間、 地點]舉辦，並將作出強力的宣示: [縣或城市名稱] 準備好教導我們的學生21 世紀的 關鍵技能。 我們要確保我們的學生都在創造技術的未來 — 而不只是消費它。

請聯繫我: [電話號碼或電子郵件地址]。靜候佳音。

此致， \[姓名\] \[職稱\]

