---
title: Obrigado por se inscrever para sediar a Hora do Código!
layout: wide
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Obrigado por inscrever-se para sediar a Hora do Código!

**TODO** organizador da Hora do Código receberá 10 GB de espaço no Dropbox ou US$10 de crédito no Skype como agradecimento. [Detalhes](/prizes)

<% if @country == 'us' %>

Estimule sua [escola inteira a participar](/us/prizes), assim ela terá a oportunidade de ganhar grandes prêmios.

<% end %>

## 1. Espalhe a notícia

Fale aos seus amigos sobre a #HoraDoCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie este e-mail](/resources#email) ou [entregue este folheto para seu diretor](/files/schools-handout.pdf). Quando toda a escola estiver participando, [inscreva-se para ganhar US$10.000 em tecnologia para sua escola](/prizes) e desafie outras escolas de sua região a participar.

<% else %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie este e-mail](/resources#email) ou entregue [este folheto](/files/schools-handout.pdf) para seu diretor.

<% end %>

## 3. Peça para seu empregador para participar

[Envie este email](/resources#email) para seu gerente, ou para seu Diretor Executivo. Ou [entregue este folheto a eles](/resources/hoc-one-pager.pdf).

## 4. Promova a Hora do Código em sua comunidade

Reúna um grupo local — clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou ofereça uma "festa" Hora do Código para sua vizinhança.

## 5. Peça a um representante político para apoiar a Hora do Código

[Envie este e-mail](/resources#politicians) para seu prefeito, Câmara Municipal ou conselho escolar. Ou [dê a eles este folheto](/resources/hoc-one-pager.pdf) e convide-os a visitar sua escola.

<%= view 'popup_window.js' %>