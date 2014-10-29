<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Obrigado por inscrever-se para sediar a Hora do Código!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. Espalhe a notícia

Fale aos seus amigos sobre o #HoraDoCódigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>). Quando toda a escola estiver participando, [inscreva-se para ganhar US$10.000 em tecnologia para sua escola](/prizes) e desafie outras escolas de sua região a participar.

<% else %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>) to your principal.

<% end %>

## 3. Faça uma doação generosa

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Peça para seu empregador participar

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promova a Hora do Código em sua comunidade

Reúna um grupo local — clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou ofereça uma "festa" Hora do Código para sua vizinhança.

## 6. Peça a um representante político para apoiar a Hora do Código

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>