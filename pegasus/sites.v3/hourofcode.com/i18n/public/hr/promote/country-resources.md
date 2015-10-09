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

## Video zapisi <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Isprobajte vodiče:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Svi vodiči Sata Kodiranja:**

  * Require minimal prep-time for organizers
  * Prigodni su za samostalno učenje - dozvoljavajući učenicima da rade vlastitim tempom i na svojoj razini

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Planirajte svoje hardverske potrebe - računala nisu obvezna

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Isprobajte vodiče na računalima i uređajima učenika.** Osigurajte se da ispravno funkcioniraju (zvuk i slika).
  * **Pregledajte stranicu sa čestitkama (certifikatima)** da biste vidjeli što će učenici vidjeti po završetku. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Planirajte unaprijed ovisno o vama dostupnoj tehnologiji

  * **Nemate dovoljno uređaja?** Koristite [programiranje u parovima](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Niska propusnost?** Planirajte prikaz video zapisa u prednjem dijelu učionice, tako da svaki učenik ne mora preuzimati vlastitu kopiju video zapisa. Možete isprobati i vodiče koji ne zahtijevaju upotrebu računala i/ili interneta.

## 4) Nadahnite učenike - pokažite im video zapis

Pokaži studentima inspirativni video da započnete Sat kodiranja. Primjeri:

  * Originalni video zapis kada je Code.org pokrenut, u kome su Bill Gates, Mark Zuckerberg i zvijezda NBA-a Chris Bosh (Možete izabrati verzije u trajanju od [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuta](https://www.youtube.com/watch?v=nKIu9yen5nc) i [9 minuta](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Predsjednik Obama poziva sve učenike da nauče informatiku](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Pobudite zanimanje svojih učenika - dajte im kratak uvod**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>