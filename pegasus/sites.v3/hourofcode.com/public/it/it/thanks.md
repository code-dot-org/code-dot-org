<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Grazie per aver deciso di ospitare un evento dell'Ora del Codice!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. Diffondi la notizia

Dì ai tuoi amici dell'#HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## Chiedi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](http://hourofcode.com/files/schools-handout.pdf). Una volta che la tua scuola è a bordo, [partecipa per vincere $10.000 in strumenti tecnologici per la tua scuola](/prizes) (solo per gli Stati Uniti) e sfida le altre scuole della tua zona a salire a bordo.

<% else %>

## Chiedi a tutta la tua scuola di offrire ai vostri studenti un'Ora del Codice

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](http://hourofcode.com/files/schools-handout.pdf) to your principal.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Recluta un gruppo locale — un gruppo di boy scout, la tua chiesa, l'università o un sindacato. Oppure organizza una "festa di quartiere" per un'Ora del Codice.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>