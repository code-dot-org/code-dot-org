<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Gràcies per registrar-se per acollir una Hora de Codi!

**CADA** organitzador de l'Hora de Codi rebrà 10 GB d'espai Dropbox o 10 $ de crèdit Skype com agraïment. [ Dades](<%= hoc_uri('/prizes') %>)

## 1. Corre la veu

Informa als teus amics sobre #HoraDeCodi.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Demana a tothom de la teva escola que ofereixin una Hora de Codi

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## 2. Demana a tothom de la teva escola que ofereixin una Hora de Codi

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. Fes una donació generosa

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Demana a la teva empresa que s'impliqui

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promou l'Hora de Codi a la teva comunitat

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Demana a un funcionari electe local que doni suport a l'Hora de Codi

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>