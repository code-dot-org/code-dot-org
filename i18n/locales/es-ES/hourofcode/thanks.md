* * *

titulo: ¡Gracias por inscribirte para ser anfitrión de una Hora de Código! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/es"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDeCódigo' %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación!

**CADA** organizador de la Hora de Código recibirá 10 GB de espacio en Dropbox o $10 de crédito en Skype como agradecimiento. [Detalles](<%= hoc_uri('/prizes') %>)

## 1. Corre la voz

Dile a tus amigos acerca de la #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) o [este folleto](/resources/hoc-one-pager.pdf) al director de tu escuela.

<% else %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) o [este folleto](/resources/hoc-one-pager.pdf) al director de tu escuela.

<% end %>

## 3. Haz una donación generosa

[Dona a nuestra campaña de crowdfunding.](http://<%= codeorg_url() %>/donate) Para enseñar a 100 millones de niños, necesitamos de tu apoyo. Acabamos de lanzar el [ La mayor campaña de crowdfunding educación](http://<%= codeorg_url() %>/ donar) en la historia. *Cada* dólar a combinarse [ donantes](http://<%= codeorg_url() %>/acerca de/donantes), duplicando su impacto.

## 4. Pídele a tu compañía que se involucre

 a su gerente o el director ejecutivo. O [darles este folleto](http://hourofcode.com/resources/hoc-one-pager.pdf).</p> 

## 5. Promociona la Hora de Código en tu comunidad

Reclutar a un grupo local — chico/chica scouts club, iglesia, Universidad, grupo de veteranos o sindicato. O host una hora de código "block party" de su vecindario.

## 6. Solícita a un funcionario de tu gobiero local que apoye la Hora de Código

 a su alcalde, Concejo Municipal o junta escolar. O [darles este folleto](http://hourofcode.com/resources/hoc-one-pager.pdf) e invitarlos a visitar su escuela.</p> 

<%= view 'popup_window.js' %>