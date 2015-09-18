---

title: <%= hoc_s(:title_resources) %>
layout: wide

---

# Recursos da Hora do Código

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

<%= view :resources_banner %>

# Junte-se a nós

## 1. Sign up to host

Anyone, anywhere can host an Hour of Code. [Sign up](<%= resolve_url('/') %>) to recieve updates and qualify for prizes.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Divulgue

Conte para seus amigos sobre a #HoraDoCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your principal to encourage every classroom at your school to sign up.

## 4. Ask your employer to get involved

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your manager or the CEO.

## 5. Promova a Hora do Código em sua comunidade

[Recruit a local group](<%= resolve_url('/resources/promote#sample-emails') %>)— boy/girl scouts club, church, university, veterans group or labor union. Ou sedie uma "festa" da Hora do Código na sua vizinhança.

## 6. Ask a local elected official to support the Hour of Code

[Envie este e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código.

<%= view :signup_button %>