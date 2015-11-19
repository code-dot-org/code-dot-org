---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Como participar

## 1. Cadastre-se para sediar uma Hora do Código

Qualquer pessoa, em qualquer lugar, pode sediar uma Hora do Código. [Cadastre-se](<%= resolve_url('/') %>) para receber atualizações e se qualificar para os prêmios.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Divulgue

Conte aos seus amigos sobre a **#HoraDoCodigo**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem. <% if @country == 'us' %> Uma escola sorteada de *cada* Estado dos EUA (e Washington D.C.) ganhará o equivalente a US$10.000 em tecnologia. [Cadastre-se aqui](<%= resolve_url('/prizes/hardware-signup') %>) para participar e [**veja os vencedores do ano passado**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Peça para seu empregador participar

[Envie esse e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para seu gerente ou CEO.

## 5. Promova a Hora do Código em sua comunidade

[Reúna um grupo local](<%= resolve_url('/promote/resources#sample-emails') %>)— clube de escoteiros, igreja, universidade, grupo de veteranos, sindicato, ou até mesmo alguns amigos. Você não precisa estar na escola para aprender novas habilidades. Use estes [cartazes, banners, adesivos, vídeos e muito mais](<%= resolve_url('/promote/resources') %>) em seu próprio evento.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código. Isso pode ajudar a criar um suporte para a ciência da computação em sua área além de uma hora de programação.

<%= view :signup_button %>