---
title: Obrigado por se inscrever para sediar a Hora do Código! 
layout: wide
---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo'
%>

# Obrigado por inscrever-se para sediar a Hora do Código!

**TODO** organizador da Hora do Código receberá 10 GB de espaço no Dropbox ou US$10 de crédito no Skype como agradecimento. [Detalhes](/prizes)

<% if @country == 'us' %>

Estimule sua [escola inteira a participar](/us/prizes), assim ela terá a oportunidade de ganhar grandes prêmios.

<% end %>

## 1. Espalhe a notícia

Fale aos seus amigos sobre o #HoraDoCódigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie este e-mail](/resources#email) ou [entregue este folheto para seu diretor](/files/schools-handout.pdf). Quando toda a escola estiver participando, [inscreva-se para ganhar US$10.000 em tecnologia para sua escola](/prizes) e desafie outras escolas de sua região a participar.

<% else %>

## 2. Peça para sua escola oferecer uma Hora do Código

[Envie este e-mail](/resources#email) ou entregue [este folheto](/files/schools-handout.pdf) para seu diretor.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

Reúna um grupo local — clube de escoteiros, igreja, universidade, grupo de veteranos ou sindicato. Ou ofereça uma "festa" Hora do Código para sua vizinhança.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>