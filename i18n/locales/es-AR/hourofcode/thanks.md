* * *

title: ¡Gracias por inscribirte para participar de la Hora del Código! layout: wide

Código HTML. No se traduce.

Código HTML. No se traduce.

* * *

Código HTML. No se traduce.

Código HTML. No se traduce. Código HTML. No se traduce.

# ¡Gracias por inscribirte para participar de la Hora del Código!

**CADA** organizador de la Hora de Programación recibirá 10 GB de espacio en Dropbox o $10 de crédito en Skype como agradecimiento. [Detalles](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Haz que [toda tu escuela participe](<%= hoc_uri('/prizes') %>) para tener la oportunidad de ganar grandes premios para la escuela.

<% end %>

## 1. Corré la voz

Comentale a tus amigos acerca de #LaHoraDelCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pedile a toda tu escuela que participe de la Hora del Código

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) o [este folleto](<%= hoc_uri('/files/schools-handout.pdf') %>). Una vez que tu escuela esté inscrita, [participará por $10,000 en tecnología para tu escuela](/prizes) e invitará a otras escuelas de tu área a que se inscriban.

<% else %>

## 2. Pedile a toda tu escuela que participe de la Hora del Código

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) o entrega [este folleto](<%= hoc_uri('/files/schools-handout.pdf') %>) a tu director.

<% end %>

## 3. Hacé una generosa donación

[Dona a nuestra campaña de crowdfunding.](http://<%= codeorg_url() %>/donate) Necesitamos tu apoyo para enseñar a 100 millones de niños. Acabamos de lanzar la que podría ser la [mayor campaña de crowdfunding en educación](http://<%= codeorg_url() %>/donate) de la historia. Cada dólar será igualado por los [donantes](http://<%= codeorg_url() %>/about/donors) principales de Code.org, duplicando tu impacto.

## 4. Pedile a tu empresa que participe

[Envía este correo electrónico](<%= hoc_uri('/resources#email') %>) a tu gerente, o al CEO. O [dales este folleto](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promocioná la Hora del Código en tu comunidad

Reclutá a un grupo local, por ejemplo, un club de boy scouts, una Iglesia, una universidad, o un sindicato. Organiza una Hora del Código como un evento comunitario.

## 6. Pedile a un funcionario local que apoye la Hora del Código

[Envía este correo electrónico](<%= hoc_uri('/resources#politicians') %>) a tu alcalde, Concejo Municipal o junta escolar. O [dales este folleto](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) e invítalos a visitar tu escuela.

<%= view 'popup_window.js' %>