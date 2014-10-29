* * *

title: ¡Gracias por inscribirte para participar de la Hora del Código! layout: wide

Código HTML. No se traduce.

Código HTML. No se traduce.

* * *

Código HTML. No se traduce.

Código HTML. No se traduce. Código HTML. No se traduce.

# ¡Gracias por inscribirte para participar de la Hora del Código!

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. Corré la voz

Comentale a tus amigos acerca de #LaHoraDelCodigo.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pedile a toda tu escuela que participe de la Hora del Código

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>). Una vez que tu escuela esté inscrita, [participará por $10,000 en tecnología para tu escuela](/prizes) e invitará a otras escuelas de tu área a que se inscriban.

<% else %>

## 2. Pedile a toda tu escuela que participe de la Hora del Código

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>) to your principal.

<% end %>

## 3. Hacé una generosa donación

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Pedile a tu empresa que participe

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promocioná la Hora del Código en tu comunidad

Reclutá a un grupo local, por ejemplo, un club de boy scouts, una Iglesia, una universidad, o un sindicato. Organiza una Hora del Código como un evento comunitario.

## 6. Pedile a un funcionario local que apoye la Hora del Código

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>