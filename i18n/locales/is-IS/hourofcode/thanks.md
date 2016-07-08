* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Thanks for signing up to host an Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. What can you do now?

## 1. Spread the word

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](%= resolve_url('https://code.org/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Biddu skólann þinn að bjóða Klukkustund kóðunar

[Sendu þennan tölvupóst](%= resolve_url('/promote/resources#sample-emails') %) til skólastjórans og skoraðu á hvern bekk í skólanum að skrá sig.

## 4. Biddu vinnuveitanda þinn að taka þátt

[Sendu þennan tölvupóst](%= resolve_url('/promote/resources#sample-emails') %) til yfirmanns þíns eða forstjóra.

## 5. Kynntu Klukkustund kóðunar í samfélaginu

[Skráðu hóp í nágrenninu](%= resolve_url('/promote/resources#sample-emails') %)— skátaflokk, kirkjuhóp, háskóla, eldri borgara, stéttarfélag eða bara vinahóp. You don't have to be in school to learn new skills. Notaðu þessi [veggspjöld, borða, límmiða, myndbönd og fleira](%= resolve_url('/promote/resources') %) fyrir þinn eigin viðburð.

## 6. Fáðu kjörinn fulltrúa á svæðinu til að styðja Klukkustund kóðunar

[Sendu þennan tölvupóst](%= resolve_url('/promote/resources#sample-emails') %) til þingmanna, bæjarfulltrúa eða menntamálanefndar og bjóddu þeim að heimsækja skólann þinn á Klukkustund kóðunar. It can help build support for computer science in your area beyond one hour.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>