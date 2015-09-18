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

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Try the tutorials:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Tutti i tutorial dell'Ora del Codice:**

  * Require minimal prep-time for organizers
  * Sono autoesplicativi e permettono agli studenti di lavorare in base al proprio ritmo e al proprio livello di preparazione

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Test tutorials on student computers or devices.** Make sure they work properly (with sound and video).
  * **Preview the congrats page** to see what students will see when they finish. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Plan ahead based on your technology available

  * **Don't have enough devices?** Use [pair programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Hai una ridotta velocità di connessione a Internet?** Mostra tu i video a tutta la classe, in modo da evitare che ogni studente li scarichi. Oppure prova ad usare le lezioni "Senza Rete" (che non necessitano di connessione ad internet).

## 4) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * Il video originale del sito Code.org, in collaborazione con Bill Gates, Mark Zuckerberg e la stella del basket americano Chris Bosh (Ci sono versioni da [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuti](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minuti](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Il video del Presidente Obama che invita gli studenti ad imparare l'informatica](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% else %>

# Ulteriori risorse in arrivo!

<% end %>

<%= view :signup_button %>