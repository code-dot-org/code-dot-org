---

title: <%= hoc_s(:title_resources) %>
layout: wide

---

# Recursos da Hora do Código

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

<%= view :resources_banner %>

# Junte-se a nós

## 1. Cadastre-se para sediar

Qualquer pessoa, em qualquer lugar, pode sediar uma Hora do Código. [Cadastre-se](<%= resolve_url('/') %>) para receber atualizações e se qualificar para os prêmios.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Divulgue

Conte para seus amigos sobre a #HoraDoCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem.

## 4. Peça para seu empregador participar

[Envie esse e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para seu gerente ou CEO.

## 5. Promova a Hora do Código em sua comunidade

[Recrute um grupo da região](<%= resolve_url('/resources/promote#sample-emails') %>)— clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou sedie uma "festa" da Hora do Código na sua vizinhança.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código.

<%= view :signup_button %>