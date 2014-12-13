* * *

Заглавие: Благодаря, че регистрирахте събитие Часът на кодирането! оформление: широк

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc" Hide context | Edit context Paragraph text XPath: /p[2]

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Благодаря за регистрирането ви като домакин на Часът на кодирането събитие!

**Всеки** организатор на Часът на кодирането ще получи 10 GB Dropbox пространство или $10 на Skype кредит като благодарност. [подробности](<%= hoc_uri('/prizes') %>)

## Разпространи новината

Кажете на приятелите си за #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Попитайте във вашето училище, дали предлага участие в Часът на кодирането

[ Изпратете този имейл](<%= hoc_uri('/resources#email') %>) или [ това изложение](/resources/hoc-one-pager.pdf) на своя директор.

<% else %>

## 2. Попитайте във вашето училище, дали предлага участие в Часът на кодирането

[ Изпратете този имейл](<% = hoc_uri('/resources#email') % >) или да дайте [ това изложение](/resources/hoc-one-pager.pdf) това изложение</a> на своя директор.

<% end %>

## 3. Направете щедро дарение

[Станете спонсор чрез нашата crowdfunding кампания.](http://<%= codeorg_url() %>/donate) За да предоставим обучение на 100 милиона деца, имаме нужда от вашата подкрепа. Ние току-що стартирахме [най-голямата образователна crowdfunding кампания](http://<%= codeorg_url() %>/donate) в историята. *Всеки* долар предоставен на [donors](http://<%= codeorg_url() %>/about/donors), ще удвои на въздействието си.

## 3. Посъветвайте се с вашия работодател за възможно включване

[ Изпратете този имейл](<%= hoc_uri('/resources#email') %>) на вашия ръководител или изпълнителен директор. Или [ му дайте това изложение](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 4. Насърчете включването в Часът на кодирането в рамките на вашата общност

Ангажирайте локална група — момчета или момичета от скаутски клуб, църковна общност, университет, група на ветерани или синдикат. Можете да промотирате Часът на кодирането на "block party" във вашия квартал.

## 5 Ангажирайте местната власт в подкрепа на Часът на Кодирането

[ изпратете този имейл](<%= hoc_uri('/resources#politicians') %>) на кмета, Общинския съвет или училищното настоятелство. Или [ да им дайте това изложение](http://hourofcode.com/resources/hoc-one-pager.pdf) и ги поканете да посетят вашето училище.

<%= view 'popup_window.js' %>