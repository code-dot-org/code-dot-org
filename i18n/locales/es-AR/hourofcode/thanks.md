* * *

title: ¡Gracias por inscribirte para participar de la Hora del Código! layout: wide

Código HTML. No se traduce.

Código HTML. No se traduce.

* * *

Código HTML. No se traduce.

Código HTML. No se traduce. Código HTML. No se traduce.

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Programación!

**CADA** organizador de la Hora de Programación recibirá 10 GB de espacio en Dropbox o $10 de crédito en Skype como agradecimiento. [Detalles](<%= hoc_uri('/prizes') %>)

## 1. Corre la voz

Dile a tus amigos acerca de la #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](/resources/hoc-one-pager.pdf) to your principal.

<% else %>

## 2. Pídele a toda tu escuela que ofrezca una Hora de Programación

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](/resources/hoc-one-pager.pdf) this handout</a> to your principal.

<% end %>

## 3. Hacé una generosa donación

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Pedile a tu empresa que participe

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promocioná la Hora del Código en tu comunidad

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Pedile a un funcionario local que apoye la Hora del Código

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>