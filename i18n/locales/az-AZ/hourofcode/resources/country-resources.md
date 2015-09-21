* * *

title: <%= hoc_s(:title_country_resources) %> layout: wide nav: promote_nav

* * *

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

**Bütün Kod Saatı dərslikləri:**

  * Require minimal prep-time for organizers
  * Müstəqil tədris üçün yararlıdır - hər kəsə öz tempi və bacarığına uyğun iş seçməyə imkan verir

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Test tutorials on student computers or devices.** Make sure they work properly (with sound and video).
  * **Preview the congrats page** to see what students will see when they finish. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Plan ahead based on your technology available

  * **Don't have enough devices?** Use [pair programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Şəbəkənizin ötürmə sürəti azdır?** Videoları sinfin qarşısında göstərməyi planlaşdırın ki, hər şagird özü üçün videoları endirməsin, ya da avadanlıqsız, oflayn dərslikləri sınayın.

## 4) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * "Code.org"un Bill Qeyts, Mark Tsukerberq və NBA basketbol ulduzu Kris Boşun iştirakı ilə çəkilmiş ilk açılış videosu (Uzunluğu [1 dəqiqə](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 dəqiqə](https://www.youtube.com/watch?v=nKIu9yen5nc) və [9 dəqiqə](https://www.youtube.com/watch?v=dU1xS07N-FA) olan versiyalar var)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Prezident Obamanın bütün şagirdləri infromatikanı öyrənməyə çağırması](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>