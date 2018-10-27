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

# ¡Gracias por inscribirte para ser anfitrión de una Hora del Código!

<br /> **La Hora de Código se celebra durante <%= campaign_date('full')%>. Estaremos en contacto con nuevos tutoriales y otras actualizaciones emocionantes a medida que salgan. Mientras tanto, ¿qué puedes hacer ahora?**

## 1. Corre la voz en tu escuela y comunidad

Te acabas de unir al movimiento de la Hora de Código. ¡Díselo a tus amigos utilizando **#HoraDeCódigo**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Anima a otros a participar [con nuestros correos electrónicos de muestra.](<%= resolve_url('/promote/resources#sample-emails') %>) Ponte en contacto con tu director y desafía a todas las aulas de tu escuela para que se registren. Recluta un grupo local - club de scouts, iglesia, universidad, grupo de veteranos, sindicato o incluso algunos amigos. No tienes que estar en la escuela para aprender nuevas habilidades. Invita a un político local o autoridad a visitar tu escuela durante la Hora de Código. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](<%= resolve_url('/promote/resources') %>) para su propio evento.

## 2. Encuentra un voluntario local para ayudarte con tu evento.

[Busca en nuestro mapa de voluntarios](<%= codeorg_url('/volunteer/local') %>) a alguien que pueda visitar tu clase o chatear por video remoto para inspirar a tus estudiantes sobre la amplitud de posibilidades de la informática.

## 3. Planifica tu Hora del Código

Elije una [actividad de la Hora de Código](https://hourofcode.com/learn) para tu clase y [revisa esta guía práctica](<%= resolve_url('/how-to') %>).

# Ve más allá de una Hora de Código

<% if @country == 'us' %> Una Hora de Código es sólo el comienzo. Seas administrador, maestro o aliado, tenemos [desarrollo profesional, plan de estudios y recursos para ayudarte a llevar clases de informática a tu escuela o ampliar tus ofertas.](https://code.org/yourschool) Si ya enseñas informática, usa estos recursos durante la semana de educación de ciencias computacionales para obtener el apoyo de la administración, padres y comunidad.

Tienes muchas opciones para adaptarse a las necesidades de tu escuela. La mayoría de las organizaciones que ofrecen tutoriales de la Hora de Código también tienen disponible planes de estudios y desarrollo profesional. Si encuentras una lección que te gusta, pregunta para ir más allá. Para ayudarte a comenzar, hemos resaltado un número de [proveedores de planes de estudios que te ayudarán a ti o a tus alumnos a ir más allá de una hora.](https://hourofcode.com/beyond)

<% else %> Una Hora de Código es sólo el comienzo. La mayoría de las organizaciones que ofrecen lecciones de Hora de Código también tienen planes de estudios disponibles para ir más allá. Para ayudarte a comenzar, hemos resaltado un número de [proveedores de planes de estudios que te ayudarán a ti o a tus alumnos a ir más allá de una hora.](https://hourofcode.com/beyond)

Code.org también ofrece cursos completos de [introducción a la informática](https://code.org/educate/curriculum/cs-fundamentals-international) traducidos a más de 25 idiomas sin ningún costo para ti o tu escuela. <% end %>

<%= view 'popup_window.js' %>