* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# Como participar

## 1. Divulgue

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](%= resolve_url('/promote/resources#sample-emails') %) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. <% end %>

## 3. Peça para seu empregador para participar

[Envie esse e-mail](%= resolve_url('/promote/resources#sample-emails') %) para seu gerente ou CEO.

## 4. Promova a Hora do Código em sua comunidade

[Reúna um grupo local](%= resolve_url('/promote/resources#sample-emails') %)— clube de escoteiros, igreja, universidade, grupo de veteranos, sindicato, ou até mesmo alguns amigos. Você não precisa estar na escola para aprender novas habilidades. Use estes [cartazes, banners, adesivos, vídeos e muito mais](%= resolve_url('/promote/resources') %) em seu próprio evento.

## 5. Peça que um representante político apoie a Hora do Código

[Envie este e-mail](%= resolve_url('/promote/resources#sample-emails') %) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código. Isso pode ajudá-lo a conseguir suporte para o ensino da Ciência da Computação para além de uma hora.

<%= view :signup_button %>