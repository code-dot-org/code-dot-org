* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# ¿Cómo participar?

## 1. Inscríbete para organizar unha Hora do Código

Calquera, en calquera lugar pode organizar unha Hora do Código. [Inscríbete](%= resolve_url('/') %) para recibir actualizaciones e clasificarse para os premios.   


[<button><%= hoc_s(:signup_your_event) %></button>](%= resolve_url('/') %)

## 2. Corre a voz

Cóntalle ós teus amigos sobre **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Pídelle á túa escola que acolla unha Hora do Código

[Envía este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) ó teu director e desafía a cada clase da túa escola a apuntarse. < % si @pais == 'us' %> Un colexio con sorte en *cada* estado dos Estados Unidos (e D.C. Washington) vai gañar $10.000 en tecnoloxía. [Rexístrese aquí](%= resolve_url('/prizes/hardware-signup') %) para participar e [**ver os gañadores do ano pasado**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Pídelle á túa empresa que participe

[Envía este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) ó teu xerente ou CEO.

## 5. Promociona a Hora do Código na túa comunidade

[Recluta un grupo local](%= resolve_url('/promote/resources#sample-emails') %)-nen@s das asociacións locais, igrexa, universidade, grupos de veteranos, sindicatos e incluso ós amigos. Non tes que estar no colexio para aprender novas habilidades. Usa estes [posters, banners, stickers, videos e máis](%= resolve_url('/promote/resources') %) para o teu propio evento.

## 6. Pídelle a un representante político local que apoie a Hora do Código

[Envía este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) ós teus representantes locais, concello ou xunta escolar e invítatos a visitar a túa escola para a Hora do Código. Pode axudar a dar apoio a que a Informática por mais dunha hora.

<%= view :signup_button %>