* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premios de la Hora de Código 2015

<% if @country == 'la' %>

# Premios para cada organizador

Cada educador que organice una Hora de Código a los estudiantes recibe 10 GB de espacio en Dropbox como un regalo de agradecimiento!

<% else %>

## Premios para CADA organizador

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 escuelas ganarán computadoras portátiles para toda la clase (o $10,000 para otra tecnología)

Sign up for this prize is now closed. Check back to see this year's winners.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="video-chats"></a>

## 30 classrooms will win a video chat with a guest speaker

Lucky classrooms will have the opportunity to talk with guest speakers who will share how computer science has impacted their lives and careers.

[col-33]

![imagen](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![imagen](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![imagen](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![imagen](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![imagen](/images/fit-175/Hadi-Partovi.jpg)  
Hadi Partovi   
(Code.org co-founder)   
[Watch live Dec. 11 10 am PST](https://plus.google.com/events/c2e67fd7el3es36sits1fd67prc)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## One lucky classroom will win an exclusive, behind-the-scenes “Making of Star Wars” experience in San Francisco with Disney and Lucasfilm

One lucky classroom will win the grand prize – a trip to San Francisco, CA for an exclusive, behind-the-scenes “Making of Star Wars” experience with the visual effects team who worked on Star Wars: The Force Awakens. The grand prize is courtesy of [ILMxLAB](http://www.ilmxlab.com/), a new laboratory for immersive entertainment, combining the talents of Lucasfilm, Industrial Light & Magic and Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg" />

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## 100 classrooms will win programmable robots including a BB-8 droid robot by Sphero

In honor of Hour of Code tutorial "Star Wars: Building a Galaxy with Code," 100 participating classrooms in the United States or Canada will a set of four Sphero 2.0 robots plus a BB-8™ App-enabled Droid that students can program. Sign up your Hour of Code event to qualify. [Learn more about BB-8 from Sphero](http://sphero.com/starwars) and [about Sphero education](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# Preguntas Frecuentes

## ¿Quién es elegible para recibir todos los regalos de agradecimiento de organizador?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## ¿Hay una fecha límite para inscribirse y para recibir el regalo de agradecimiento de organizador?

Tiene que registrarse **antes** < % = campaign_date('start_long') %> para ser elegible y para recibir el regalo de agradecimiento de organizador.

## ¿Cuándo recibiré mi regalo de agradecimiento?

Nosotros nos pondremos en contacto en Diciembre después de la Semana de Educación de Ciencias de la Computación (< % = campaign_date('full') %>) con pasos de cómo canjear su opción de regalo de agradecimiento.

## ¿Puedo canjear todas las opciones de regalo de agradecimiento?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## ¿Es necesario que toda la escuela participe para tener la oportunidad de ganar $10,000 en hardware?

Sí. Toda la escuela tiene que participar para ser elegible para el premio pero sólo una persona necesita inscribirse y entregar el formulario de solicitud de premio de Hardware [aquí](%= resolve_url('/prizes/hardware-signup') %). Cada maestro participante tendrá que [inscribirse en](%= resolve_url('/') %) su aula individualmente para recibir el regalo de agradecimiento del organizador.

## ¿Quién es elegible para ganar $10.000 en hardware?

El premio es para escuelas públicas K-12 en Estados Unidos únicamente. Para competir toda la escuela deberá registrarse para la Hora de Código antes del 16 de noviembre de 2015. Una escuela en cada estado de Estados Unidos podrá ganar un conjunto de computadoras. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1 de Diciembre del 2015.

## ¿Por qué el premio de $10.000 en hardware sólo está disponible para las escuelas públicas?

Nos encantaría ayudar a los profesores en escuelas públicas y privadas por igual, pero en este momento, esto se reduce a la logística. Nos hemos asociado con [DonorsChoose.org](http://donorschoose.org) para la administración de fondos para los premios a las aulas, esta entidad sólo trabaja con escuelas públicas, nivel K-12, en los Estados Unidos. De Acuerdo con DonorsChoose.org, ellos son capaces de acceder a información más precisa y coherente para las escuelas públicas.

## ¿Cuándo es la fecha límite para aplicar al premio de hardware?

Para calificar, usted debe completar el [formulario de solicitud de Hardware](%= resolve_url('/prizes/hardware-signup') %) antes del 16 de noviembre de 2015. Una escuela en cada estado de Estados Unidos podrá ganar un conjunto de computadoras. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1 de Diciembre del 2015.

## Si mi entera escuela no puede hacer la Hora de Código durante la Semana de Educación de Ciencias de la Computación (< % = fecha_campaña('breve') %>), ¿puedo aún calificar para premios?

Sí, en el [formulario de solicitud de Hardware](%= resolve_url('/prizes/hardware-signup') %) incluyen las fechas en las que toda la escuela está participando.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat con un orador invitado:

Este premio está limitado a las aulas K-12 en los Estados Unidos y Canadá únicamente. Code.org seleccionará los grupos ganadores, asignará el horario para la conversación y trabajará con el profesor competente establecer los detalles de la tecnología a usar. No es necesario que toda tu escuela se inscriba para concursar por este premio. Both public and private schools are eligible to win.

<% end %>

## Estoy fuera de los Estados Unidos. ¿Puedo calificar para los premios?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>