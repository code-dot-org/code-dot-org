* * *

Título: Obrigado por se inscrever para sediar a Hora do Código! layout: amplo

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# Obrigado por se inscrever para sediar a Hora do Código!

Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode *mudar suas vidas*, no período de 7 a 13 de dezembro.

Entraremos em contato para falar sobre prêmios, novos tutoriais e outras atualizações a partir de setembro. Então, o que você pode fazer agora?

## 1. Divulgue

Conte para seus amigos sobre o #HoraDoCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= hoc_uri('/resources#email') %>) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem.

## 3. Peça para seu empregador para participar

[Envie esse e-mail](<%= hoc_uri('/resources#email') %>) para seu gerente ou CEO.

## 4. Promova a Hora do Código em sua comunidade

Reúna um grupo local — clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou sedie uma "festa dos blocos" da Hora do Código na sua vizinhança.

## 5. Peça que um representante político apoie a Hora do Código

[Envie esse e-mail](<%= hoc_uri('/resources#politicians') %>) para o Prefeitura, para a Câmara Municipal, ou para o conselho escolar e convide-os a visitar sua escola para a Hora do Código.

<%= view 'popup_window.js' %>