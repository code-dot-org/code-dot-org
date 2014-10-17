* * *

title: Thanks for signing up to host an Hour of Code! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Maraming salamat sa pagsama bilang host ng Hour of Code!

**BAWAT** Hour of Code organizer ay makakatanggap ng 10 GB ng Dropbox space o $10 na Skype credit bilang pasasalamat. [Detalye](/prizes)

<% if @country == 'us' %>

Get your [whole school to participate](/us/prizes) for a chance for big prizes for your entire school.

<% end %>

## 1. Ipagkalat ang balita

Sabihin sa iyong mga kaibigan ang tungkol sa #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Sabihin sa inyong buong paaralan na makisali sa Hour of Code

[Send this email](/resources#email) or [give this handout to your principal](/files/schools-handout.pdf). Pag ang inyong paaralan ay nakilahok, [may pagkakataong manalo ng $10,000 halaga ng papremyo para sa inyong paaralan](/prizes) at himukin din ang ibang paaralan sa inyong lugar na sumali.

<% else %>

## 2. Sabihin sa inyong buong paaralan na makisali sa Hour of Code

[Send this email](/resources#email) or give [this handout](/files/schools-handout.pdf) to your principal.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Mag-anyaya ng mga grupo - mga boy scouts, simbayan, unibersidad, mga grupo ng senior citizens o kaya ay magsimula ng pagtitipon tungkol sa Hour of Code sa inyong lugar.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>