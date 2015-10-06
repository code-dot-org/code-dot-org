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

## Videoer <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Prøv øvelserne:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Alle Hour of Code øvelser:**

  * Require minimal prep-time for organizers
  * Er selvinstruerende og giver elever lov til at arbejde i deres eget tempo og et passende færdighedsniveau

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Planlæg dit hardware behov - computere er ikke et krav

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Test øvelserne på elevernes computere eller tablets.** Sørg for, at de fungerer korrekt (med lyd og video).
  * **Tjek afslutningssiden** for at se hvad eleverne vil se, når de er færdige. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Planlæg ud fra den teknologi der er til rådighed

  * **Har ikke nok computere og tablets?** Så bruge [parvis programmering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Har du lav båndbredde?** Planlæg at vise videoerne i klassen først, så hver elev ikke behøver at downloade deres egne videoer. Eller prøv de unplugged / offline tutorials.

## 4) Inspirere eleverne - vis dem først en video

Vis eleverne en inspirerende video i begyndelsen af Hour of Code timen. For eksempel:

  * Den oprindelige Code.org indlednings video med Bill Gates, Mark Zuckerberg og NBA stjerne Chris Bosh (der er [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutters](https://www.youtube.com/watch?v=nKIu9yen5nc), og [9 minutters](https://www.youtube.com/watch?v=dU1xS07N-FA) versioner)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Præsident Obama opfordring til alle elever om til at lære at kode](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Opmuntre dine elever - giv dem en kort introduktion**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>