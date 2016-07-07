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

# Grazas por rexistrarte para realizar unha Hora do Código!

Ti estas a facer posible que os estudantes de todo o mundo aprendan unha Hora do Código que pode *cambiar resto das suas vidas*, dende o < % = 7 ao 13_de Decembro('completo') % &gt. We'll be in touch about new tutorials and other exciting updates. ¿Qué podes facer agora?

## 1. Corre a voz

Xa te uniches ao movemento da Hora do Código. Dillo os teus amigos con **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 1. Atope un voluntario local para axudarlle co seu evento.

[Procure o noso mapa de voluntarios](https://code.org/volunteer/local) para ver os voluntarios que poden visitar a aula ou a vídeo conversa de xeito remoto e así animar os seus alumnos sobre a amplitude de posibilidades que ten a ciencia informática.

## 3. Pídelle á túa escola que acolla unha Hora do Código

[Envía este correo electrónico](<%= resolve_url('/promote/resources#sample-emails') %>) ó teu director e desafía a cada clase da túa escola a apuntarse.

## 4. Pídelle á túa empresa que participe

[Envía este correo electrónico](<%= resolve_url('/promote/resources#sample-emails') %>) ó teu xerente ou CEO.

## 5. Promociona a Hora do Código na túa comunidade

[Recluta un grupo local](<%= resolve_url('/promote/resources#sample-emails') %>)-nen@s das asociacións locais, igrexa, universidade, grupos de veteranos, sindicatos e incluso ós amigos. Non tes que estar no colexio para aprender novas habilidades. Usa estes [posters, banners, stickers, videos e máis](<%= resolve_url('/promote/resources') %>) para o teu propio evento.

## 6. Pídelle a un representante político local que apoie a Hora do Código

[Envía este correo electrónico](<%= resolve_url('/promote/resources#sample-emails') %>) ós teus representantes locais, concello ou xunta escolar e invítatos a visitar a túa escola para a Hora do Código. Pode axudar a dar apoio a que a Informática por mais dunha hora.

## 7. Planifique a súa Hora do Código

Escolla unha actividade da Hora do Código e [vexa esta guía práctica](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>