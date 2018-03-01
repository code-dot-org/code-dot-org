---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/es"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDeCódigo' %>

# Involucra a tu comunidad en la Hora del Código

## 1. Corre la voz

¡Dile a tus amigos sobre la #HoraDelCódigo!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pide a tu escuela que ofrezca una "Hora del Código"

[Envíe este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) a su director y desafíe a cada clase de su escuela para que se inscriba.

## 3. Pide a tu empresa que se involucre

[Envíe este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) a su gerente o director general de la compañía.

## Promociona la "Hora del Código" dentro de tu comunidad

[Recluta a un grupo local](%= resolve_url('/promote/resources#sample-emails') %): niños /niñas del club scouts, iglesia, Universidad, grupo de veteranos, sindicato o incluso algunos amigos. No tienes que estar en la escuela para aprender nuevas habilidades. Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](%= resolve_url('/promote/resources') %) para su propio evento.

## 5. Pídele a un funcionario local electo que apoye la Hora del Código

[Envíe este correo electrónico](%= resolve_url('/promote/resources#sample-emails') %) a sus representantes locales, Concejo Municipal o junta escolar e invítelos a visitar su escuela para la Hora de Código. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

<%= view :signup_button %>