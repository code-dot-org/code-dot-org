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

## Vidéos <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Essayez les tutoriels:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Tous les tutoriels Heure de Code:**

  * Require minimal prep-time for organizers
  * Sont guidés, permettant aux élèves de travailler à leur rythme et à leur niveau

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Planifier vos besoins en matériel - les ordinateurs sont facultatifs

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Testez les tutoriels sur les ordinateurs ou matériel des élèves.** Assurez-vous que tout fonctionne correctement (avec son et vidéo).
  * **Prévisualisez la page de félicitation** Pour voir ce que les élèves verront lorsqu'ils auront fini. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Planifiez à l'avance vos ressources réseau et matériel disponible

  * **Vous n'avez pas assez de matériel ?** Faites de la [programmation en binôme](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Vous avez une connexion internet lente ?** Prévoyez de montrer les vidéos devant toute la classe, ainsi, les élèves n'auront pas à les télécharger. Ou essayez les tutoriels sans connexion requise.

## 4) Inspirez les élèves - montrez leur une video

Montrez aux élèves une vidéo inspirante pour démarrer l'Heure de Code. Exemples :

  * La vidéo originale du lancement de Code.org, avec Bill Gates, Mark Zuckerberg et la star du NBA Chris Bosh (Il y a une version [d'1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [de 5 minutes](https://www.youtube.com/watch?v=nKIu9yen5nc), et [de 9 minutes](https://www.youtube.com/watch?v=dU1xS07N-FA) )
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Le président Obama fait appel à tous les étudiants pour apprendre l'informatique](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Augmentez l'intérêt de vos élèves - faites leur une petite introduction**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>