* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# Obrigado por se inscrever para sediar a Hora do Código!

Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode *mudar suas vidas*, no período de <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. O que você pode fazer agora?

## 1. Divulgue

Você acabou de se juntar ao movimento da Hora do Código. Conte ao seus amigos usando a hashtag **#HoraDoCodigo**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Encontre um voluntário da região para ajudar com o seu evento.

[Procure em nosso mapa de voluntários](%= resolve_url('https://code.org/volunteer/local') %) para ver os voluntários que podem visitar sua sala de aula ou participar de uma videoconferência remota para inspirar seus alunos sobre as várias possibilidades trazidas pela ciência da computação.

## 3. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](%= resolve_url('/promote/resources#sample-emails') %) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem.

## 4. Peça para seu empregador participar

[Envie esse e-mail](%= resolve_url('/promote/resources#sample-emails') %) para seu gerente ou CEO.

## 5. Promova a Hora do Código em sua comunidade

[Reúna um grupo local](%= resolve_url('/promote/resources#sample-emails') %)— clube de escoteiros, igreja, universidade, grupo de veteranos, sindicato, ou até mesmo alguns amigos. Você não precisa estar na escola para aprender novas habilidades. Use estes [cartazes, banners, adesivos, vídeos e muito mais](%= resolve_url('/promote/resources') %) em seu próprio evento.

## 6. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](%= resolve_url('/promote/resources#sample-emails') %) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código. Isso pode ajudá-lo a conseguir suporte para o ensino da Ciência da Computação para além de uma hora.

## 7. Planeje sua Hora do Código

Escolha uma atividade da Hora do Código e [veja esse guia prático](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>