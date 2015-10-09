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

## Video 's <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Probeer de opdrachten:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Alle Uur Code handleidingen:**

  * Require minimal prep-time for organizers
  * Zijn zelf-sturend, waardoor scholieren op hun eigen tempo en vaardigheidsniveau kunnen werken

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Plan uw hardware benodigdheden - computers zijn optioneel

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Probeer de opdrachten op de computers of apparaten van leerlingen.** Controleer dat ze goed werken (met geluid en video).
  * **Bekijk de felicitatiepagina alvast** om te zien wat leerlingen zien wanneer ze klaar zijn. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Plan vooruit op basis van de beschikbare techniek

  * **Heb je niet genoeg apparaten?** Gebruik [pair programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Weinig bandbreedte?** Toon de video's klassikaal zodat niet iedere leerling ze hoeft te downloaden. Of probeer de unplugged/offline-opdrachten.

## 4) Inspireer leerlingen - laat ze een video zien

Toon leerlingen bij de start van Uur Code een inspirerende video. Voorbeelden:

  * De originele Code.org lanceringsvideo, met Bill Gates, Mark Zuckerberg en NBA ster Chris Bosh (er zijn versies van [1 minuut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuten](https://www.youtube.com/watch?v=nKIu9yen5nc), en [9 minuten](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [President Obama roept alle leerlingen op om te leren programmeren](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Maak je leerlingen enthousiast - geef ze een korte inleiding**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>