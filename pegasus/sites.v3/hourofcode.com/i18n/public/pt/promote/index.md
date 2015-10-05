---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# How to get involved

## 1. Sign up to host an Hour of Code

Qualquer pessoa, em qualquer lugar, pode sediar uma Hora do Código. [Cadastre-se](<%= resolve_url('/') %>) para receber atualizações e se qualificar para os prêmios.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Divulgue

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Peça para seu empregador participar

[Envie esse e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para seu gerente ou CEO.

## 5. Promote Hour of Code in your community

[Recruit a local group](<%= resolve_url('/resources/promote#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/resources/promote') %>) for your own event.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>