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

## Videa <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Vyzkoušejte cvičení:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Všechna cvičení Hodiny kódu:**

  * Require minimal prep-time for organizers
  * Řídí se samy, což umožňuje žákům postupovat jejich vlastním tempem a podle jejich úrovně

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Připravte si potřebný hardware – počítače nejsou povinné

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Přezkoušejte cvičení na počítačích a zařízeních studentů.** Ujistěte se, že fungují správně (se zvukem a videem).
  * **Prohlédněte si stránku s certifikátem** abyste sami viděli, co obdrží žáci, když výuku dokončí. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) V závislosti na vámi dostupných počítačích si předem naplánujte

  * **Nemáte dostatek počítačů?** Využijte [programování ve dvojicích](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Máte pomalé připojení?** Naplánujte promítnutí videí před celou třídou, aby si pak studenti nemuseli stahovat každý své vlastní. Nebo zkuste cvičení offline nebo unplugged (bez počítače).

## 4) Inspirujte žáky – promítněte jim video

Ukažte studentům inspirativní video k zahájení hodinu kódu. Příklady:

  * Původní video od Code.org, zobrazující Billa Gatese (Microsoft), Marka Zuckerberga (Facebook) a hvězdu basketbakové ligy NBA Chrise Boshe (délka verzí [1 minuta](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minut](https://www.youtube.com/watch?v=nKIu9yen5nc) a [9 minut](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [President Obama vyzývá studenty, aby se učili informatiku](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Nadchněte své studenty – ukažte jim krátký úvod**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>