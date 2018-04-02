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
<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Kod Saatı təşkil etmək üçün qeydiyyatdan keçdiyinizə görə təşəkkür!

Tələbələrə kompüter elmini öyrənməyə başlamağa kömək etmək üçün təşəkkür etdiyiniz üçün təşəkkür edirik, biz sizin üçün sinif otağı üçün müxtəlif rol modelləri olan peşəkar çap olunmuş plakatlardan ibarət pulsuz bir dəstə vermək istərdik. Use offer code **FREEPOSTERS** at checkout. (Qeyd: bu məhsullar son zamanlar mövcuddur və göndərmə xərclərini ödəmək lazımdır. Bu plakatlar Amerika Birləşmiş Ştatlarından gedirsə, göndərmə xərcləri Kanada və beynəlxalq səviyyələrdə göndərilməlidir. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<% if @country == 'us' %> Özobot, Dexter Industries, LittleBits və Wonder Workshop-nun səxavətinə görə 100-dən çox sinif otağı robotlar və ya siniflər üçün siniflər seçiləcək! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org qalib sinifləri seçəcək. Bu vaxt, bəzi robot və sxemlərin fəaliyyətlərini nəzərdən keçirin. Bu ABŞ məktəbləri üçün açıqdır. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Məktəbə və cəmiyyətə sözü yaymaq

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](<%= resolve_url('/promote/resources#sample-emails') %>) Contact your principal and challenge every classroom at your school to sign up. Yerli bir qrup - oğlan / qız izci klubu, kilsə, universitet, veteran qrupu, əmək birliyi, hətta bəzi yoldaşları işə götür. Yeni bacarıqları öyrənmək üçün məktəbdə olmalısınız. Invite a local politician or policy maker to visit your school for the Hour of Code. Bölgənizdə bir saatdan artıq olan kompüter biliklərinə dəstək olmağa kömək edə bilər.

Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 2. Tədbirinizə kömək etmək üçün yerli bir könüllü tapın.

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](<%= resolve_url('/how-to') %>).

# Go beyond an Hour of Code

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

Məktəbinizə uyğun bir çox seçim var. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. İstədiyiniz bir dərs taparsanız, daha da irəliləməyi xahiş edin. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>