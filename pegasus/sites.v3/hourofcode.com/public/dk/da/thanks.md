<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Tak fordi du vil arrangere Hour of Code!

**ALLE** der arrangerer Hour of Code får 10 GB lagerplads på Dropbox eller Skype-kredit til en værdi af 10 dollars som tak. [ Detaljer](<%= hoc_uri('/prizes') %>)

## 1. Spred budskabet

Fortæl dine venner om #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Spørg om hele din skole kan deltage i Hour of Code

[ Send denne e-mail](<%= hoc_uri('/resources#email') %>) eller [dette materiale](/resources/hoc-one-pager.pdf) til din lære eller skoleleder.

<% else %>

## 2. Spørg om hele din skole kan deltage i Hour of Code

[ Send denne e-mail](<%= hoc_uri('/resources#email') %>) eller giv [dette handout](/resources/hoc-one-pager.pdf) dette handout</a> til din skoleleder.

<% end %>

## 3. Giv et bidrag

[Donér til vores crowdfunding kampagne.](http://<%= codeorg_url() %>/donate) For at undervise 100 millioner børn, har vi brug for din støtte. Vi har netop lanceret den [ største uddannelse crowdfunding kampagne](http://<%= codeorg_url() %>/ donere) i historien. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Få din arbejdsgiver involveret

[ Send denne e-mail](<%= hoc_uri('/resources#email') %>) din manager eller direktør. Eller [give dem dette materiale](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Reklamér for Hour of Code i dit lokalområde

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Bed en lokal politiker om at støtte Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>