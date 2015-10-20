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

<%= view :signup_button %>

# Obrigado por se cadastrar para concorrer a US$10.000 em hardware

Agora, sua escola está concorrendo para ganhar um conjunto de notebooks (ou US$10.000 em outras tecnologias). Vamos analisar sua inscrição e anunciar os vencedores em dezembro.

## 1. Divulgue

Conte para seus amigos sobre a #HoraDoCodigo.

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie esse e-mail](<%= resolve_url('/promote/resources#email') %>) para seu diretor.

## 3. Peça para seu empregador para participar

[Envie esse e-mail](<%= resolve_url('/promote/resources#email') %>) para seu gerente ou CEO.

## 4. Promova a Hora do Código em sua comunidade

Reúna um grupo local — clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou sedie uma "festa" da Hora do Código na sua vizinhança. [Envie esse e-mail](<%= resolve_url('/promote/resources#email') %>).

## 5. Peça que um representante político apoie a Hora do Código

[Envie esse e-mail](<%= resolve_url('/promote/resources#politicians') %>) para o prefeito, para a Câmara Municipal, ou para o conselho escolar e convide-os a visitar sua escola para acompanhar a Hora do Código.

<%= view :signup_button %>