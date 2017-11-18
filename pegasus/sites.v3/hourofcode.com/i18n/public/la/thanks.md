---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Código!

Como agradecimiento por ayudar a que los estudiantes puedan comenzar a aprender informática, nos gustaría darle un conjunto gratuito de carteles impresos profesionalmente con diversos modelos para su clase. Utilice el código de oferta **FREEPOSTERS** al finalizar la compra. (Nota: esta última sólo está disponible mientras duren las existencias y usted necesitará cubrir los gastos de envío. Dado que estos carteles se envían desde los Estados Unidos, los costos de envío pueden ser bastante altos si se envían a Canadá e internacionalmente. Entendemos que esto puede no estar dentro de su presupuesto, y le recomendamos que imprima los [archivos PDF](https://code.org/inspire) para su clase.)  
<br /> [<button>Obtener carteles</button>](https://store.code.org/products/code-org-posters-set-of-12) Utilice el código de oferta FREEPOSTERS

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org will select the winning classrooms. In the meantime, check out some of the robotics and circuits activities. Please note that this is only open for US schools. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Corre la voz en tu escuela y comunidad

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](<%= resolve_url('/promote/resources#sample-emails') %>) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. No tienes que estar en la escuela para aprender nuevas habilidades. Invite a local politician or policy maker to visit your school for the Hour of Code. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](<%= resolve_url('/promote/resources') %>) para su propio evento.

## 2. Encuentre un voluntario local para ayudarte con tu evento.

[Search our volunteer map](<%= resolve_url('https://code.org/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Planifique su Hora del Código

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](<%= resolve_url('/how-to') %>).

# Vaya más allá de una Hora de Código

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>