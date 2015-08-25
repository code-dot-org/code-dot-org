<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Corre la voz

Dile a tus amigos acerca de la #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Pregunta a tu empleador para estar involucrado

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## Promueve "Una Hora de Código" dentro de tu comunidad

Reclutar a un grupo local — chico/chica scouts club, iglesia, Universidad, grupo de veteranos o sindicato. O host una hora de código "block party" de su vecindario.

## 5. Pídele a un funcionario electo local que apoye la Hora del Código.

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>