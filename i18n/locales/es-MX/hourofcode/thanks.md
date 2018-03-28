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
<% facebook = {:u=>"http://#{request.host}/es"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDeCódigo' %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Código!

Como agradecimiento por ayudar a que los estudiantes puedan comenzar a aprender informática, nos gustaría darle un conjunto gratuito de carteles impresos profesionalmente con diversos modelos para su clase. Utilice el código de oferta **FREEPOSTERS** al finalizar la compra. (Nota: esta última sólo está disponible mientras siga disponible el material y usted necesitará cubrir los gastos de envío. Dado que estos carteles se envían desde los Estados Unidos, los costos de envío pueden ser bastante altos si se envían a Canadá e internacionalmente. Entendemos que esto puede no estar dentro de su presupuesto, y le recomendamos que imprima los [archivos PDF](https://code.org/inspire) para su clase.)  
<br /> [<button>Obtener carteles</button>](https://store.code.org/products/code-org-posters-set-of-12) Utilice el código de oferta FREEPOSTERS

<% if @country == 'us' %> ¡Gracias a la generosidad de Ozobot, Dexter Industries, littleBits y Wonder Workshop, más de 100 clases serán seleccionadas para recibir robots o circuitos para su clase! Para poder recibir un conjunto, asegúrese de completar la encuesta enviada desde Code.org después de la Hora del Código. Code.org seleccionará las clases ganadoras. Mientras tanto, revisa algunas de las actividades de robótica y circuitos. Tenga en cuenta que esto solo está disponible para las escuelas de EE. UU. <% end %>

<br /> **La Hora del código se celebra durante <%= campaign_date('full')%>. Estaremos en contacto con nuevos tutoriales y otras actualizaciones emocionantes a medida que salgan. Mientras tanto, ¿qué puedes hacer ahora?**

## 1. Corre la voz en tu escuela y comunidad

Se acaba de unir al movimiento de la Hora del Código. ¡Díselo a tus amigos con **#HoraDelCódigo**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Anime a otros a participar [con nuestros correos electrónicos de muestra.](%= resolve_url('/promote/resources#sample-emails') %) Póngase en contacto con su director y desafíe a cada aula de su escuela para que se registren. Reclute un grupo local - club de scouts, iglesia, universidad, grupo de veteranos, sindicato o incluso algunos amigos. No tienes que estar en la escuela para aprender nuevas habilidades. Invite a un político local o autoridad a visitar su escuela durante la Hora del Código. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](%= resolve_url('/promote/resources') %) para su propio evento.

## 2. Encuentre un voluntario local para ayudarte con tu evento.

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Planifique su Hora del Código

Elija una [actividad de la Hora del Código](https://hourofcode.com/learn) para su clase y [revisa esta guía práctica](%= resolve_url('/how-to') %).

# Vaya más allá de una Hora de Código

<% if @country == 'us' %> Una Hora de Código es sólo el comienzo. Sea administrador, maestro o abogado, tenemos [desarrollo profesional, plan de estudios y recursos para ayudarte a llevar clases de informática a tu escuela o ampliar tus ofertas.](https://code.org/yourschool) Si ya enseñas informática, usa estos recursos durante la semana de educación en informatica para reunir el apoyo de tu administración, padres y comunidad.

Tienes muchas opciones para adaptarte a tu escuela. La mayoría de las organizaciones que ofrecen tutoriales de la Hora de Código también tienen plan de estudios y desarrollo profesional disponible. Si encuentras una lección que le gusta, pregúnta para ir más allá. Para ayudarlo a comenzar, hemos resaltado un número de [proveedores de planes de estudios que lo ayudarán a usted o a sus alumnos a ir más allá de una hora.](https://hourofcode.com/beyond)

<% else %> Una Hora de Código es sólo el comienzo. La mayoría de las organizaciones que ofrecen clases de Hora del Código también tienen planes de estudios disponibles para ir más allá. Para ayudarlo a comenzar, hemos resaltado un número de [proveedores de planes de estudios que lo ayudarán a usted o a sus alumnos a ir más allá de una hora.](https://hourofcode.com/beyond)

Code.org también ofrece cursos completos de [introducción a la informática](https://code.org/educate/curriculum/cs-fundamentals-international) traducidos a más de 25 idiomas sin ningún coste para usted o su escuela. <% end %>

<%= view 'popup_window.js' %>