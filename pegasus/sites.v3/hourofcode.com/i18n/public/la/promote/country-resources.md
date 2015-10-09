---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---

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

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Prueba los tutoriales:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Todos los tutoriales de la Hora de Código:**

  * Require minimal prep-time for organizers
  * Son de auto aprendizaje, lo que permite a los estudiantes trabajar a su propio ritmo y habilidad

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Anticipa tus requerimientos de hardware - las computadoras son opcionales

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Pruebe los tutoriales en las computadoras o dispositivos de los estudiantes.** Cerciórese que los tutoriales funcionen correctamente (con audio y video).
  * **Previsualice la página de felicitaciones** para ver lo que los estudiantes verán al terminar. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Planeé de acuerdo a la tecnología que tiene disponible

  * **¿No tiene dispositivos suficientes?** use [programación en parejas](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **¿Tiene un ancho de banda limitado?** Muestre los videos al frente del salón de clase, para evitar que cada estudiante descargue el video. O pruebe con los tutoriales desconectados/fuera de línea.

## 4) Motive a los estudiantes - muestre un video

Muestran a los estudiantes un video inspiracional para dar comienzo a la Hora de Código. Ejemplos:

  * El vídeo original de lanzamiento de Code.org, con Bill Gates, Mark Zuckerberg y la estrella de la NBA Chris Bosh (Hay versiones de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) y [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [El presidente Obama anima a todos los estudiantes a aprender Ciencias de la Computación](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Emociona a los estudiantes - Dales una introducción corta**

<% else %>

# Próximamente recursos adicionales!

<% end %>

<%= view :signup_button %>