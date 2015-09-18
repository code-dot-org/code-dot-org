* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

<%= view :signup_button %>

# Obrigado por se inscrever para sediar a Hora do Código!

Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode *mudar suas vidas*, no período de <%= campaign_date('full') %>.

Entraremos em contato para falar sobre prêmios, novos tutoriais e outras atualizações a partir de setembro. Então, o que você pode fazer agora?

## 1. Cadastre-se para sediar

Qualquer pessoa, em qualquer lugar, pode sediar uma Hora do Código. [Cadastre-se](%= resolve_url('/') %) para receber atualizações e se qualificar para os prêmios.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Divulgue

Conte para seus amigos sobre a #HoraDoCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](%= resolve_url('/resources/promote#sample-emails') %) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem.

## 4. Peça para seu empregador participar

[Envie esse e-mail](%= resolve_url('/resources/promote#sample-emails') %) para seu gerente ou CEO.

## 5. Promova a Hora do Código em sua comunidade

[Recrute um grupo da região](%= resolve_url('/resources/promote#sample-emails') %)— clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou sedie uma "festa" da Hora do Código na sua vizinhança.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](<%= resolve_url('/resources/promote#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código.

<%= view 'popup_window.js' %>

<%= view :signup_button %>