* * *

Спасибо за то, что вы зарегистрировались как организатор Часа Кода! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Спасибо за регистрацию на проведение Часа Кода!

**КАЖДЫЙ** организатор Часа Кода получит 10 GB места на Dropbox или $10 кредитов в Skype в качестве благодарности. [Подробнее](/prizes)

<% if @country == 'us' %>

Get your [whole school to participate](/us/prizes) for a chance for big prizes for your entire school.

<% end %>

## 1. Распространите новость

Расскажите своим друзьям про #ЧасКода.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Попросите провести Час Программирования в Вашей школе

[Отправьте это сообщение](/resources#email) или [дайте эту листовку директору](/files/schools-handout.pdf). Когда Ваша школа зарегистрируется, [примите участие в конкурсе, чтобы выиграть оборудования на $10 000 для школы](/prizes) и попросите другие школы в вашей местности принять участие.

<% else %>

## 2. Попросите провести Час Программирования в Вашей школе

[Send this email](/resources#email) or [give this handout to your principal](/files/schools-handout.pdf).

<% end %>

## 3. Сделайте щедрое пожертвование

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Привлеките к участию в проекте местный детский клуб, церковь, университет, местную организацию по интересам. Или станьте организатором Часа Кодирования в своем районе.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>