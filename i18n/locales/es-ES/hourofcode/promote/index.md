* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<% facebook = {:u=>"http://#{request.host}/es"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDeCódigo' %>

# ¿Cómo participar?

## 1. Regístrese para albergar una Hora de Código

Cualquier persona, en cualquier lugar puede albergar una Hora de Código. [Inscríbase](%= resolve_url('/') %) para recibir actualizaciones y clasificarse para los premios.   


[<button><%= hoc_s(:signup_your_event) %></button>](%= resolve_url('/') %)

## 1. Corre la voz

Dile a tus amigos acerca de **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Pídale a toda su escuela que ofrezca una Hora de Código

[Envíe este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) a su director y desafíe a cada clase de su escuela para que se inscriba. < % si @pais == 'us' %> Una escuela afortunada en *cada* estado de Estados Unidos (y D.C. Washington) va a ganar $10.000 en tecnología. [Regístrese aquí](%= resolve_url('/prizes/hardware-signup') %) para ser elegible y [**ver a los ganadores del año pasado**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Pídele a tu compañía que se involucre

[Envíe este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) a su gerente o director general de la compañía.

## 5. Promociona la Hora de Código en tu comunidad

[Recluta a un grupo local](%= resolve_url('/promote/resources#sample-emails') %): niños /niñas del club scouts, iglesia, Universidad, grupo de veteranos, sindicato o incluso algunos amigos. No tienes que estar en la escuela para aprender nuevas habilidades. Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](%= resolve_url('/promote/resources') %) para su propio evento.

## 5. Pídale a un funcionario electo local que apoye la Hora de Código

[Envíe este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) a sus representantes locales, Concejo Municipal o junta escolar e invítelos a visitar su escuela para la Hora de Código. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

<%= view :signup_button %>