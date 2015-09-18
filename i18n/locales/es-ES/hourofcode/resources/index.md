* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/es"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDeCódigo' %>

<%= view :resources_banner %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

Estaremos en contacto para informar acerca de premios, nuevos tutoriales y otras novedades interesantes en otoño. Así que, ¿qué puedes hacer ahora?

## 1. Corre la voz

Dile a tus amigos acerca de la #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Pregunta a tu empleador para estar involucrado

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## Promueve "Una Hora de Código" dentro de tu comunidad

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Pídele a un funcionario electo local que apoye la Hora del Código.

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>