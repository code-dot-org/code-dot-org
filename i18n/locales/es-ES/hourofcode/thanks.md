---
title: <%= hoc_s(:title_signup_thanks).inspect %>
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
<% facebook = {:u=>"http://#{request.host}/es"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HoraDeCódigo' %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Código!

<br /> **La Hora del Código transcurre durante <%= campaign_date('full') %> y estaremos en contacto con los nuevos tutoriales y otras actualizaciones interesantes a medida que se publiquen. Mientras tanto, ¿qué puedes hacer ahora?**

## 1. Corre la voz en tu escuela y comunidad

Acabas de unirte al movimiento de la Hora del Código. ¡Diselo a tus amigos con ** #HourOfCode **!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Anima a otros a participar [con nuestros correos electrónicos de muestra.](%= resolve_url('/promote/resources#sample-emails') %) Contacta con tu director y desafía a todos las clases de tu escuela a inscribirse. Recluta un grupo local - club de scouts, iglesia, universidad, grupo de veteranos, sindicato o incluso algunos amigos. No tienes que estar en la escuela para aprender nuevas habilidades. Invita a un político local o autoridad a visitar tu escuela durante la Hora del Código. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](%= resolve_url('/promote/resources') %) para su propio evento.

## 2. Encuentre un voluntario local para ayudarte con tu evento.

[Busque en nuestro mapa de voluntarios](%= codeorg_url('/volunteer/local') %) para que los voluntarios puedan visitar su clase o chatear por video de forma remota para inspirar a sus estudiantes sobre la amplitud de posibilidades de la informática.

## 3. Planifica tu Hora del Código

Elija una [actividad de la Hora del Código](https://hourofcode.com/learn) para su clase y [revisa esta guía práctica](%= resolve_url('/how-to') %).

# Vaya más allá de una Hora de Código

<% if @country == 'us' %> Una Hora de Código es sólo el comienzo. Sea administrador, maestro o abogado, tenemos [desarrollo profesional, plan de estudios y recursos para ayudarlo a llevar clases de informática a su escuela o ampliar sus ofertas.](https://code.org/yourschool) Si ya enseña informática, use estos recursos durante la semana de educación en informatica para reunir el apoyo de su administración, padres y comunidad.

Tienes muchas opciones para adaptarte a tu escuela. La mayoría de las organizaciones que ofrecen tutoriales de la Hora de Código también tienen plan de estudios y desarrollo profesional disponible. Si encuentras una lección que le gusta, pregúnta para ir más allá. Para ayudarte a comenzar, hemos resaltado un número de [proveedores de planes de estudios que te ayudarán a ti o a tus alumnos a ir más allá de una hora.](https://hourofcode.com/beyond)

<% else %> Una Hora de Código es sólo el comienzo. La mayoría de las organizaciones que ofrecen clases de Hora del Código también tienen planes de estudios disponibles para ir más allá. Para ayudarte a comenzar, hemos resaltado un número de [proveedores de planes de estudios que te ayudarán a ti o a tus alumnos a ir más allá de una hora.](https://hourofcode.com/beyond)

Code.org también ofrece cursos completos de [introducción a la informática](https://code.org/educate/curriculum/cs-fundamentals-international) traducidos a más de 25 idiomas sin ningún coste para ti ni para tu escuela. <% end %>

<%= view 'popup_window.js' %>