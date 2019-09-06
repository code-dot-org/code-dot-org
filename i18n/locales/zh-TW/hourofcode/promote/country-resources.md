---
title: <%= hoc_s(:title_country_resources).inspect %>
layout: wide
nav: promote_nav
---

<%= view :signup_button %>

<% if @country == 'la' %>

# 資源

## 我們該如何進行一小時玩程式活動？

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo.png"></a>
<br />西班牙語
</div>

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo-Ingles.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo-Ingles.png"></a>
<br />英語
</div>

<div style="clear:both"></div>

## 所有影片

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>為什麼每個人要學習寫程式？（5 分鐘）</strong></a>

  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

  
[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=_vq6Wpb-WyQ)

<% elsif @country == 'al' %> <iframe width="560" height="315" src="https://www.youtube.com/embed/AtVzbUZqZcI" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Ora E Kodimit (5 min)**](https://www.youtube.com/embed/AtVzbUZqZcI)

<% elsif @country == 'ca' %>

## 影片 <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## Hour of Code(アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Hour of Code(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[一小時玩程式課程指引](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'nl' %>

  
  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/0hfb0d5GxSw" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Friends of Technology Hour of Code（2 分鐘）**](https://www.youtube.com/embed/0hfb0d5GxSw)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'ro' %>

Va multumim pentru inregistrare, daca doriti materiale printate pentru promovarea evenimentului, echipa din Romania vi le poate trimite prin curier. Trebuie doar sa trimiteti un email la HOC@adfaber.org si sa le solicitati.

<% elsif @country == 'uk' %>

# 給組織團體的活動指引

## 用這個手冊來招募團體

[<%= localized_image('/images/fit-500x300/corporations.png') %>](%= localized_file('/files/corporations.pdf') %)

## 1) 試試這個教程：

我們會準備多種有趣的、長達一小時的教程，這些教程是由來自各個領域的夥伴所設計的。新的教程會在下次的一小時玩程式活動，也就是 <%= campaign_date('full') %> 前發佈。 

**所有的一小時玩程式教程：**

- 講師不需太多的備課時間。
- 是自學式的 - 學生能依自己的步調和技能進行。

<a href="https://code.org/learn"><img src="https://code.org/images/tutorials.png"></a>

## 2) 規劃你的硬體需求 — 不一定需要電腦

在一小時玩程式的活動使用有網路的電腦可以有最佳體驗，但不見要人手一台電腦，就算沒有電腦，照樣可以舉辦一小時玩程式活動。

- **在學生端電腦或設備上測試教程。**確保能正常運作（含聲音和影片）。
- **預覽恭喜頁面**，確認學生完成時會看到該頁面。
- **提供耳機**，或請學生帶自己的，如果你選擇的教程一定要有聲音輸出的話。

## 3) 以你現有環境的設備為基礎規畫

- **沒有足夠的設備？**不妨試試[小組編程](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning)。 當參與者成為夥伴，他們可以互相幫忙，減少對講師的依賴。
- **網路頻寬小？**可以用投影機播放影片，如此就學生就不需自己下載觀看。或者嘗試不插電活動 / 離線教程。

## 4) 啟發學生 — 向他們展示一段影片

播放勵志影片給學生觀看以作為一小時玩程式的開場，例如：

- 原 Code.org 的揭幕影片，由微軟總裁比爾蓋茨、 臉書創辦人馬克佐伯克和 NBA 球員克里斯波許代言（有 [1 分鐘](https://www.youtube.com/watch?v=qYZF6oIZtfc)、 [5 分鐘](https://www.youtube.com/watch?v=nKIu9yen5nc) 和 [9 分鐘](https://www.youtube.com/watch?v=dU1xS07N-FA) 版本）
- [2013 一小時玩程式揭幕影片](https://www.youtube.com/watch?v=FC5FbmsH4fw) 或 [2014 一小時玩程式影片](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [美國歐巴馬呼籲所有學生學習計算機科學](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**激勵您的學生 — 給他們一個簡短的介紹**

<% elsif @country == 'pe' %>

# 不公開的活動日程 <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Pedro Pablo Kuczynski. Presidente del Perú 2016-2021**](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# 更多的資源即將到來！

<% end %>