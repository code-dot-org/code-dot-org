* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Como participar?

## 1. Corre a voz

Cóntalle ós teus amigos sobre **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pídelle a todo o teu colexio que ofreza unha Hora do Código

[Envía este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) ó teu director e desafía a cada clase da túa escola a apuntarse. < % si @pais == 'us' %> Un colexio con sorte en *cada* estado dos Estados Unidos (e D.C. Washington) vai gañar $10.000 en tecnoloxía. <% end %>

## 3. Preguntalle a tua empresa para que se implique

[Envía este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) ó teu xerente ou CEO.

## Promove "Unha Hora do Código" dentro da tua comunidade

[Recluta un grupo local](%= resolve_url('/promote/resources#sample-emails') %)-nen@s das asociacións locais, igrexa, universidade, grupos de veteranos, sindicatos e incluso ós amigos. Non tes que estar no colexio para aprender novas habilidades. Usa estes [posters, banners, stickers, videos e máis](%= resolve_url('/promote/resources') %) para o teu propio evento.

## 5. Pídelle a un cargo electo da tua zona que apoie a Hora do Código

[Envía este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) ós teus representantes locais, concello ou xunta escolar e invítatos a visitar a túa escola para a Hora do Código. Pode axudar a dar apoio a que a Informática por mais dunha hora.