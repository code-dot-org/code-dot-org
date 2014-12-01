<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



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

## 3. Haz una donación generosa

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. *Every* dollar will be matched [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Pídele a tu compañía que se involucre

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf).

## 5. Promociona la Hora de Código en tu comunidad

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 6. Solícita a un funcionario de tu gobiero local que apoye la Hora de Código

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](http://hourofcode.com/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>