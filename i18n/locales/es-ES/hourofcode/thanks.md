* * *

title: ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación!

**CADA** organizador de la Hora de Programación recibirá 10 GB de espacio en Dropbox o $10 de crédito en Skype como agradecimiento. [Detalles](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Haz que [toda tu escuela participe](<%= hoc_uri('/prizes') %>) para tener la oportunidad de ganar grandes premios para la escuela.

<% end %>

## 1. Corre la voz

Dile a tus amigos acerca de la #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) o [este folleto](<%= hoc_uri('/files/schools-handout.pdf') %>). Una vez que tu escuela esté inscrita, [ participará para ganar $10,000 válidos en tecnología para tu escuela](/prizes) y retará a otras escuelas en tu área a que se inscriban.

<% else %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) o entrega [este folleto](<%= hoc_uri('/files/schools-handout.pdf') %>) a tu director.

<% end %>

## 3. Haz una donación generosa

[Dona a nuestra campaña de crowdfunding.](http://<%= codeorg_url() %>/donate) Necesitamos tu apoyo para enseñar a 100 millones de niños. Acabamos de lanzar la que podría ser la [mayor campaña de crowdfunding en educación](http://<%= codeorg_url() %>/donate) de la historia. Cada dólar será igualado por los [donantes](http://<%= codeorg_url() %>/about/donors) principales de Code.org, duplicando tu impacto.

## 4. Pídele a tu compañía que se involucre

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) a tu gerente, o al CEO. O [dales este folleto](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promociona la Hora de Programación en tu comunidad

Recluta a un grupo local --club de boy scouts, Iglesia, universidad, grupo de veteranos, o sindicato. U organiza una "Fiesta" de la Hora de Programación en tu colonia.

## 6. Pídele a un funcionario electo local que apoye la Hora de Código

[Envía este correo electrónico](<%= hoc_uri('/resources#politicians') %>) a tu alcalde, Concejo Municipal o junta escolar. O [dales este folleto](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) e invítalos a visitar tu escuela.

<%= view 'popup_window.js' %>