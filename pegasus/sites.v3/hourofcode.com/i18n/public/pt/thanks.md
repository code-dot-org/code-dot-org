---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# Obrigado por se inscrever para sediar a Hora do Código!

Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode *mudar suas vidas*, no período de <%= campaign_date('full') %>. Entraremos em contato para falar dos prêmios, novos tutoriais e outras atualizações. O que você pode fazer agora?

## 1. Divulgue

Você acabou de se juntar ao movimento da Hora do Código. Conte ao seus amigos usando a hashtag **#HoraDoCodigo**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para o seu diretor e incentive todas as salas de aula de sua escola a se cadastrarem. <% if @country == 'us' %> Uma escola sorteada de *cada* Estado dos EUA (e Washington D.C.) ganhará o equivalente a US$10.000 em tecnologia. [Cadastre-se aqui](<%= resolve_url('/prizes/hardware-signup') %>) para participar e [**veja os vencedores do ano passado**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. Peça para seu empregador para participar

[Envie esse e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para seu gerente ou CEO.

## 4. Promova a Hora do Código em sua comunidade

[Reúna um grupo local](<%= resolve_url('/promote/resources#sample-emails') %>)— clube de escoteiros, igreja, universidade, grupo de veteranos, sindicato, ou até mesmo alguns amigos. Você não precisa estar na escola para aprender novas habilidades. Use estes [cartazes, banners, adesivos, vídeos e muito mais](<%= resolve_url('/promote/resources') %>) em seu próprio evento.

## 5. Peça que um representante político apoie a Hora do Código

[Envie este e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) para seu prefeito, Câmara Municipal ou conselho escolar e convide-os para visitar sua escola durante a Hora do Código. Isso pode ajudar a criar um suporte para a ciência da computação em sua área além de uma hora de programação.

<%= view 'popup_window.js' %>