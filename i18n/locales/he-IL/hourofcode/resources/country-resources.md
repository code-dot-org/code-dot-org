* * *

title: <%= hoc_s(:title_country_resources) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Resurse

## Vídeo-uri  <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**De ce toti ar trebui sa invete sa programeze? Participa la Ora de Programare in Romania (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

<% elsif @country == 'uk' %>

# Ghidul pentru Organizatii

## Utilizati acest ghid pentru a recruta corporatii

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Incercati tutorialele:

Vom avea la dispozitie o varietate noua de tutoriale distractive, create de catre o varietate de parteneri. Noile tutoriale vor veni sa darame vechea campanie Hour of Code <%= campaign_date('full') %>.

**Toate tutorialele Hour of Code:**

  * Cele ce impun un timp minim de pregatire pentru organizatori
  * Sunt auto-didacte si le permit elevilor sa lucreze la nivelul lor

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Planuieste de ce dispozitive ai nevoie

Cea mai buna experienta Hour of Code are loc atunci cand ai la dispozitie calculatoare onectate la internet. Dar nu este necesar sa ai cate un calculator pentru fiecare elev, ci poti organiza o Ora de Programare faca niciun calculator.

  * **Testeaza tutorialele pe calculatoarele elevilor tutorials.** Asigurati-va ca functioneaza bine (cu sunet si video)).
  * **Vedeti pagina multumiri**pentru a vizualiza ceea ce elevii vad cand termina tutorialul. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Plan ahead based on your technology available

  * **Don't have enough devices?** Use [pair programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

## 4) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>