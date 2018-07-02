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
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %> "#HourOfCode"%

# 謝謝您報名舉辦一小時玩程式活動！

為了感謝的您幫助，使學生們開始學習計算機科學成為可能，我們想為您的課堂提供一套免費的具有各種重要例題的專業印刷海報。 在結賬時使用**免單劵**。 （注意：這只能用於最後的物品清單，而您需要支付運費。 由於這些海報從美國出口，如果發往加拿大或者世界各地運費將會相當高。 我們知道這可能不在您的預算中, 我們鼓勵您為您的教室打印 [ PDF 文件 ](https://code.org/inspire)。   
<br /> <button> 獲取海報</ button> </a> 使用提供代碼FREEPOSTERS</p> 

<p>
  <% if @country == 'us' %> 感謝ozobot，德克斯特行業，littleBits和奇幻工房的慷慨相助，超過100多間教室將被選定為他們的班級得到機器人或電路！ 為了有資格獲得一套, 請務必完成從 Code.org 發送後的《編程一小時》的調查。 Code.org 將選擇獲獎的教室。 同時檢查一部分機器人和電子設備的活動。 請注意，這只對美國的學校開放。 <% end %>
</p>

<p>
  <br /> <strong>在《編程一小時》項目運行期間。我們將在新的課程和其它令人興奮的更新推出時與您聯繫。您現在可以做些什麼呢？ </strong>
</p>

<h2>
  1. 在您的學校和社區傳播這則信息
</h2>

<p>
  告訴您的朋友們您剛剛加入了<strong>編程一小時的活動</strong>的相關信息。
</p>

<p>
  <%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> 鼓勵他人與我們的示例電子郵件一起參與<a href="%= resolve_url('/promote/resources#sample-emails')%">. </a>聯繫您的校長, 挑戰您學校的每一個教室來註冊。 招募當地團體---男孩/女孩童子軍俱樂部, 教會, 大學, 退伍軍人團體, 工會, 甚至一些朋友。 你不必在學校學習新的技能。 邀請當地的政治家或者決策者來參觀您們學校的《編程一小時》活動。 它能為你在你領域的計算機科學找到一小時之外的支持。
</p>

<p>
  為你的活動使用這些<a href="%= resolve_url('/promote/resources') %">海報、 橫幅、 貼紙、 視頻以及更多</a>。
</p>

<h2>
  2. 尋找當地的志工來協助活動。
</h2>

<p>
  <a href="%= codeorg_url('/volunteer/local') %">Search our volunteer map</a> for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.
</p>

<h2>
  3. 計劃您的《編程一小時》
</h2>

<p>
  為您的課堂選擇一項<a href="https://hourofcode.com/learn">《編程一小時》活動</a>並<a href="%= resolve_url('/how-to') %">查看基本指南</a>。
</p>

<h1>
  《編程一小時》以外的更多內容
</h1>

<p>
  <% if @country == 'us' %> 《編程一小時》只是一個開始。 無論您是管理者、老師還是倡導者，我們都有<a href="https://code.org/yourschool">專業開發、課程以及一些其它資源來幫助您將計算機科學課堂帶入您的學校或者推廣您的宣傳。 </a>如果您已經從事計算機科學教育，在CS教育週期間使用這些資源來爭取您的政府、家長和社區的支持。
</p>

<p>
  您有很多選擇適合您的學校。 大多數的組織提供《編程一小時》教程也提供有課程和專業發展。 如果您發現一個您喜歡的課程，去了解更多。 為了幫助您入門, 我們重點介紹了一些 <a href="https://hourofcode.com/beyond"> 課程提供商將幫助您或您的學生超過一小時. </a>
</p>

<p>
  <% else %> 《編程一小時》只是一個開始。 大多數提供《編程一小時》課程的組織也有更多的課程可供進一步學習。 為了幫助您入門, 我們重點介紹了一些 <a href="https://hourofcode.com/beyond"> 課程提供商將幫助您或您的學生超過一小時. </a>
</p>

<p>
  Code.org 還提供完整的<a href="https://code.org/educate/curriculum/cs-fundamentals-international"> 計算機科學入門課程</a>, 免費為您或您的學校翻譯成超過25種的語言。 <% end %>
</p>

<p>
  <%= view 'popup_window.js' %>
</p>