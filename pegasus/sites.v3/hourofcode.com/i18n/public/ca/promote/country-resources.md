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

## 1) Prova els tutorials:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Tots els tutorials d'Hora de Codi:**

  * Require minimal prep-time for organizers
  * Són autoguiades - permetent que els alumnes treballin al seu propi ritme i nivell d'habilitat

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Planifica les teves necessitats de maquinari - els ordinadors són opcionals

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Prova els tutorials als ordinadors o dispositius dels estudiants.** Assegura't que funcionin correctament (amb so i vídeo).
  * **Revisa la pàgina de felicitació** per comprovar que veuran els alumnes quan finalitzin. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Planifica per avançat en base a la tecnologia disponible

  * **No tens dispositius suficients?** Utilitza [parelles de programació](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Tens poc ampla de banda?** Plantejat mostrar els vídeos a la pantalla de classe, evitaràs que cada estudiant se'ls descarregui. O prova els tutorials sense connexió / offline.

## 4) Anima els estudiants - mostra'ls un vídeo

Ensenya als alumnes un vídeo inspirador per donar inici a l'Hora del Codi. Exemples:

  * El vídeo original de promoció de Code.org, protagonitzat per Bill Gates, Mark Zuckerberg, i l'estrella de la NBA Chris Bosh (Hi ha versions de [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuts](https://www.youtube.com/watch?v=nKIu9yen5nc) i[ 9 minuts)](https://www.youtube.com/watch?v=dU1xS07N-FA)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [El president Obama fent una crida a tots els alumnes a aprendre informàtica](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Entusiasma els teus estudiants - dóna'ls una breu introducció**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>