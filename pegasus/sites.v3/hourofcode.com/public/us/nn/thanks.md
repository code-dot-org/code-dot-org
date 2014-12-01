<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Takk for at du melde deg som vert for Kodetimen!

**KVAR** arrangør av Kodetimen får som takk anten 10 GB lagringsplass i Dropbox eller Skype-kreditt verd 10 dollar. [ Detaljer](<%= hoc_uri('/prizes') %>)

## Spre bodskapet

Fortel venane dine om #Kodetimen.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Be heile skulen din om å tilby ein Kodetime

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## 2. Be heile skulen din om å tilby ein Kodetime

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. Bidra med midler

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Be arbeidsgjevaren din om å engasjere seg

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## Reklamer for Kodetimen i lokalmiljøet

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Be ein lokalpolitikar om å støtte Kodetimen

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>