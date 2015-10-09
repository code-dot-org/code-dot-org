* * *

title: <%= hoc_s(:title_country_resources) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Materiale video <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Încercaţi Tutorialele:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Toate tutorialele Hour of Code:**

  * Require minimal prep-time for organizers
  * Sunt auto-ghidate - permit elevilor să lucreze individual, în ritmul şi nivelul de pregatire propriu

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Planificati nevoile dumneavoastră hardware - calculatoarele sunt optionale

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Testeaza tutorialele pe computerele sau dispozitivele disponibile.** Asiguraţi-vă că acestea funcţionează corect (cu sunet şi video).
  * **Previzualizați pagina de felicitări** pentru a vedea ce văd elevii atunci când termină. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Fa-ți planul in funcție de tehnologia disponibilă

  * **Nu ai suficiente dispozitive?** Folosește [programarea in echipă](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Conexiune lentă la internet?** Proiectează videclipurile pentru toată clasa, astfel elevii nu vor mai descarca videoclipurile individual. Sau încercaţi tutorialele locale.

## 4) Inspira elevii - Arată-le un video

Aratati-le elevilor un video inspirational pentru a excela in cadrul Hour of Code. Exemple:

  * Videoclipul original al lansării Hour of Code, care îi înfățișează pe Bill Gates, Mark Zuckerberg și starul NBA Chris Bosh ( există versiuni de [1](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5](https://www.youtube.com/watch?v=nKIu9yen5nc) sau [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Videoclipul în care președintele Obama îndeamnă toți elevii să învețe tehnologia computerelor și programare](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Entuziasmeaza-ti elevii - ofera-le o scurta introducere**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>