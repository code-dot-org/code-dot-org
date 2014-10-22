* * *

title: ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación!

**CADA** organizador de la Hora de Programación, recibirá 10 GB de espacio en Dropbox ó $10 de crédito en Skype como agradecimiento. [Detalles](/prizes)

<% if @country == 'us' %>

Logra que [todos en tu escuela participen](/us/prizes) para tener la oportunidad de ganar grandes premios para toda la escuela.

<% end %>

## 1. Corre la voz

Dile a tus amigos acerca de la #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Envía este correo electrónico](/resources#email) o [dale está información al director de la escuela](/files/schools-handout.pdf). Una vez que tu escuela esté inscrita, [ participará para ganar $10,000 válidos en tecnología para tu escuela](/prizes) y retará a otras escuelas en tu área a que se inscriban.

<% else %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Envía este correo](/resources#email) o entrega este [panfleto](/files/schools-handout.pdf) al director de tu escuela.

<% end %>

## 3. Haz una donación generosa

[Dona a nuestra campaña de crowdfunding](http://code.org/donate). Para enseñar a 100 millones de niños, necesitamos tu apoyo. Acabamos de lanzar la que podría ser la [más grande campaña de crowdfunding en educación](http://code.org/donate) en la historia. Cada dólar que aportes será reciprocado por los principales [donantes](http://code.org/about/donors) de Code.org, duplicando tu impacto.

## 4. Pídele a tu compañía que se involucre

[Envía este correo](/resources#email) a tu gerente, o al CEO. O [hazles llegar este panfleto](/resources/hoc-one-pager.pdf).

## 5. Promociona la Hora de Programación en tu comunidad

Recluta a un grupo local --club de boy scouts, Iglesia, universidad, grupo de veteranos, o sindicato. U organiza una "Fiesta" de la Hora de Programación en tu colonia.

## 6. Pídele a un funcionario electo local que apoye la Hora de Código

[Envía este correo](/resources#politicians) a tu alcalde, concejo municipal o junta escolar. O [dales este panfleto](/resources/hoc-one-pager.pdf) e invítalos a visitar tu escuela.

<%= view 'popup_window.js' %>