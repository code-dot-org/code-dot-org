* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Premios da Hora do Código

<% if @country == 'la' %>

# Premios para cada organizador

Cada profesor que organice unha Hora do Código para os seus estudantes recibirá 10GB de espacio en Dropbox como regalo de agradecemento!

<% else %>

## Prizes for EVERY organizer

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 Colexios poderán gañar un conxunto de portátiles para a súa clase (ou 10.000$ en tecnoloxía)

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

![image](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![image](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![image](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![image](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![image](/images/fit-175/Hadi-Partovi.jpg)  
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

# FAQ

## Quen pode recibir os regalos de agradecemento?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Hai un prazo limite para inscribirse para recibir o regalo de agradecemento como organizador?

Debe rexistrarse **antes** <%= campaign_date('start_long') %> para poder recibir os regalos de agradecemento como organizador.

## Cando recibirei o meu regalo de agradecemento?

Porémonos en contacto en decembro despois da Semana da Educación en Informática (<%= campaign_date('full') %>) para informar dos próximos pasos sobre como recibir o seu regalo de agradecemento.

## Podo canxear tódalas opcións de regalos de agradecemento?

No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Ten que participar todo o colexio para gañar os $10.000 en material?

Si. Todo o teu colexio ten que participar para poder optar ó premio, nembargantes solo unha persona ten que estar rexistrada e cubrir o formulario do Premio Hardware [aquí](%= resolve_url('/prizes/hardware-signup') %). Cada mestre que tome parte terá que [inscribir](%= resolve_url('/') %) á súa clase individualmente para poder recibir o regalo de agradecemento.

## Quen pode gañar os $10.000 en material?

Premio limitado a colexios públicos de ensino básico e medio dos Eua. Para poder participar, o seu colexio enteiro debe rexistrars para a Hora do Código antes do 16 de Novembro de 2015. Un colexio en cada estado recibirá un conjunto de ordenadores para su aula. Code.org seleccionará e notificará ós gañadores por email o día 1 de Decembro de 2015.

## Por que os $10.000 en material soamente están dispoñibles para colexios públicos?

Gustaríanos axudar a mestres de colexios públicos e privados por igual, pero neste intre, a cuestión redúcese a loxística. Témonos aosciado con [DonorsChoose.org](http://donorschoose.org) para administrar as dotacións económicas para as clases, o que únicamente é valido para escolas públicas elementais de EUA. De acordo con DonorsChoose.org, a organización está mellor capacitada para acceder a datos precisos e consistentes, dispoñibles para as escolas públicas.

## Cal é a data límite para solicitar o premio de material?

Para poder optar ó premio, débese completar o [formulario de inscripción ](%= resolve_url('/prizes/hardware-signup') %) antes do 16 de novembro de 2015. Un colexio en cada estado recibirá un conjunto de ordenadores para su aula. Code.org seleccionará e notificará ós gañadores por email o día 1 de Decembro de 2015.

## Se non todo o meu colexio pode participar na Hora do Código durante a Semana da Educación da Informática(<%= campaign_date('short') %>), podo igualmente optar ós premios?

Si, no [formulario de inscripción de material](%= resolve_url('/prizes/hardware-signup') %) débense incluir as datas nas que o colexio ó completo estea a participar.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat with a guest speaker:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

## Estoy fora dos Estados Unidos. Podo optar ós premios?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>