* * *

Título: Obrigado por se inscrever para sediar a Hora do Código! layout: amplo

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# Obrigado por se inscrever para sediar a Hora do Código!

**TODO** organizador da Hora do Código receberá 10 GB de espaço no Dropbox ou US$10 de crédito no Skype como agradecimento. [Detalhes](<%= hoc_uri('/prizes') %>)

## 1. Divulgue

Fale aos seus amigos sobre o #HoraDoCódigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie este e-mail](<%= hoc_uri('/resources#email') %>) ou [este folheto](/resources/hoc-one-pager.pdf) para seu diretor.

<% else %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie este e-mail](<%= hoc_uri('/resources#email') %>) ou entregue [este folheto](/resources/hoc-one-pager.pdf) </a> para seu diretor.

<% end %>

## 3. Faça uma doação generosa

[Doe para nossa campanha de "crowdfunding".](http://<%= codeorg_url() %>/donate) Para ensinar 100 milhões de crianças, precisamos do seu apoio. Acabamos de lançar a [maior campanha de crowdfunding para educação](http://<%= codeorg_url() %>/donate) da história. Para *cada* dólar doado, nossos principais [doadores](http://<%= codeorg_url() %>/about/donors) darão mais um, dobrando o impacto da sua contribuição.

## 4. Peça para seu empregador participar

[Envie este e-mail](<%= hoc_uri('/resources#email') %>) para seu gerente ou CEO. Ou [entregue a eles este folheto](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promova a Hora do Código em sua comunidade

Reúna um grupo local — clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou sedie uma "festa dos blocos" da Hora do Código na sua vizinhança.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](<%= hoc_uri('/resources#politicians') %>) para seu prefeito, Câmara municipal ou conselho escolar. Ou [entregue a eles este folheto](http://hourofcode.com/resources/hoc-one-pager.pdf) e convide-os para visitar sua escola.

<%= view 'popup_window.js' %>