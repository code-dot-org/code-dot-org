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

Usted está haciendo posible que los estudiantes de todo el mundo aprendan una Hora del Código que puede *cambiar el resto de sus vidas*, durante <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. ¿Qué puedes hacer ahora?

## 1. Corre la voz

Se acaba de unir al movimiento de la Hora del Código. Díselo a tus amigos con **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Encuentre un voluntario local para ayudarte con tu evento.

[Buscar en nuestro mapa del voluntariado](<%= resolve_url('https://code.org/volunteer/local') %>) para que los voluntarios puedan visitar tu aula o hagan un videochat remotamente para inspirar a tus estudiantes acerca de la amplitud de posibilidades con las Ciencias de la Computación.

## 3. Pídale a toda su escuela que ofrezca una Hora del Código

[Envíe este correo electrónico](<%= resolve_url('/promote/resources#sample-emails') %>) a su director y desafíe a cada clase de su escuela para que se inscriba.

## 4. Pídele a tu compañía que se involucre

[Envíe este correo electrónico](<%= resolve_url('/promote/resources#sample-emails') %>) a su gerente o director general de la compañía.

## 5. Promociona la Hora de Código en tu comunidad

[Recluta a un grupo local](<%= resolve_url('/promote/resources#sample-emails') %>): niños /niñas del club scouts, iglesia, Universidad, grupo de veteranos, sindicato o incluso algunos amigos. No tienes que estar en la escuela para aprender nuevas habilidades. Utilice estos [carteles, pancartas, etiquetas adhesivas, vídeos y más](<%= resolve_url('/promote/resources') %>) para su propio evento.

## 5. Pídale a un funcionario electo local que apoye la Hora de Código

[Envíe este correo electrónico](<%= resolve_url('/promote/resources#sample-emails') %>) a sus representantes locales, Concejo Municipal o junta escolar e invítelos a visitar su escuela para la Hora de Código. Puede ayudar a dar apoyo a las Ciencias de la Computación en su zona más allá de la Hora del Código.

## 7. Planifica tu Hora del Código

Elija una actividad de la Hora del Código y [revise esta guía](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>