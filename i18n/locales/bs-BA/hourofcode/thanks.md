* * *

title: Thanks for signing up to host an Hour of Code! layout: wide

social: "og:title": "<%= hoc\_s(:meta\_tag\_og\_title) %>" "og:description": "<%= hoc\_s(:meta\_tag\_og\_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/srH1OEKB2LE"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc\_s(:meta\_tag\_twitter\_title) %>" "twitter:description": "<%= hoc\_s(:meta\_tag\_twitter\_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/srH1OEKB2LE?iv\_load\_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920

## "twitter:player:height": 1080

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc\_s(:twitter\_default\_text)} twitter[:hashtags] = 'HourOfCode' unless hoc\_s(:twitter\_default\_text).include? '#HourOfCode' %>

# Hvala za prijavu za domaćina Sata programiranja!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details][1]

 [1]: /prizes

<% if @country == 'us' %>

Get your [whole school to participate][2] for a chance for big prizes for your entire school.

 [2]: /us/prizes

<% end %>

## 1. Reci svima

Tell your friends about the #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pitajte cijelu školu da ugoste Sat programiranja

[Send this email][3] or [give this handout to your principal][4]. Once your school is on board, [enter to win $10,000 worth of technology for your school][1] and challenge other schools in your area to get on board.

 [3]: /resources#email
 [4]: /files/schools-handout.pdf

<% else %>

## 2. Pitajte cijelu školu da ugoste Sat programiranja

[Send this email][3] or give [this handout][4] to your principal.

<% end %>

## 3. Pitajte svog poslodavca da se uključite

[Send this email][3] to your manager, or the CEO. Or [give them this handout][5].

 [5]: /resources/hoc-one-pager.pdf

## 4. Promovirajte Sat programiranja u vašoj zajednici

Recruit a local group — boy scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Pitajte lokalno izabranog u zajednici da podrži Sata programiranja

[Send this email][3] to your mayor, city council, or school board. Or [give them this handout][5] and invite them to visit your school.

<%= view 'popup_window.js' %>