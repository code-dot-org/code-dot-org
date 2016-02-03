* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Dziękujemy za rejestrację jako organizator Godziny Kodowania!

Właśnie umożliwiasz studentom z całego świata naukę jednej Godziny Kodowania, która może *zmienić resztę ich życia*, podczas <%= campaign_date('full') %>. Będziemy w kontakcie na temat nagród, nowych poradników oraz innych ekscytujących aktualizacji. Co teraz możesz zrobić?

## 1. Rozgłaszaj

Dołączyłeś do ruchu Godziny Kodowania. Przekaż informację swoich przyjaciołom z **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Find a local volunteer to help you with your event.

[Search our volunteer map](%= resolve_url('https://code.org/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Ask your whole school to offer an Hour of Code

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your principal and challenge every classroom at your school to sign up.

## 4. Poproś swojego pracodawcę o przyłączenie się do akcji

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your manager or company's CEO.

## 5. Promote Hour of Code in your community

[Recruit a local group](%= resolve_url('/promote/resources#sample-emails') %)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Nie musisz być w szkole, by nauczyć się nowych umiejętności. Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 6. Poproś władze lokalne o udzielenie wsparcia akcji 'Hour of Code'

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. Może to pomóc w tworzeniu informatyki w twoim obszarze ponad jedną godzinę.

## 7. Plan your Hour of Code

Choose an Hour of Code activity and [review this how-to guide](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>