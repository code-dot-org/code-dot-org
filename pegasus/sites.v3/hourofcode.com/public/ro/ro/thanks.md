<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

Va multumim pentru inregistrare. Daca aveti nevoie de ajutor sau aveti orice intrebare contactati Echipa Hour of Code Romania la adresa: hoc@adfaber.org.

**FIECARE** Organizator Hour of Code va primi 10 GB de spaţiu de Dropbox sau 10 dolari de Skype credit ca multumire. [ Detalii](<%= hoc_uri('/prizes') %>)

## 1. Răspândește vestea

Spune prietenilor tai despre #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. Oferă o donaţie generoasă

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 3. Solicită angajatorului să se implice

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 4. Promovează Hour of Code în jurul tău

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Solicită unui oficial, ales local, sprijinul pentru organizarea Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>